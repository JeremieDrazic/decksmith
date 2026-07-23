# Deployment — Reverse Proxy (Traefik) Runbook

Operational companion to [ADR-0026](../adr/0026-reverse-proxy-traefik.md). Describes the reverse
proxy that fronts every project on the VPS, how it is operated, and how to add a project behind it.

> **No secrets in this repo.** Concrete host address, apex domain, DNS-provider API token, ACME
> email, and the dashboard password live only in server-side files (`~/infra/.env`) that are never
> committed. Placeholders below: `<domain>` = the VPS apex domain, `<vps>` = the server.

---

## Topology

```
                 Internet
                    │  :80  :443
                    ▼
            ┌───────────────┐        Traefik owns 80/443 and is the only
            │    Traefik    │        process bound to the public ports.
            │  (container)  │        Routes by Host header + path.
            └───────┬───────┘
                    │  Docker network "proxy" (internal)
        ┌───────────┼──────────────────────┐
        ▼           ▼                       ▼
  personal site   decksmith-api        (future projects…)
  Host(<domain>)  Host(app.<domain>)   Host(x.<domain>)
                  && PathPrefix(/api)
```

- Application containers **publish no host ports**. Traefik reaches them over the shared `proxy`
  network by container name. This removes host-port allocation entirely.
- Each app opts in with `traefik.enable=true` and declares its hostname via labels. Nothing is
  exposed unless it opts in (`exposedbydefault=false`).

---

## Components (on the server)

```
~/infra/                     Shared proxy stack (NOT in any app repo)
├── compose.yml              Traefik service + dashboard router
├── .env                     SECRETS — DNS API token, ACME_EMAIL, TRAEFIK_DASHBOARD_AUTH, …
└── letsencrypt/acme.json    Issued certificates (chmod 600, persisted)

~/apps/<project>/            One directory per project
└── compose.yml              App container(s), joins the `proxy` network, Traefik labels
```

The shared network is created once:

```bash
docker network create proxy
```

Every stack references it as an **external** network so they all share it:

```yaml
networks:
  proxy:
    external: true
```

---

## TLS — Let's Encrypt via DNS-01

- Wildcard certificate `<domain>` + `*.<domain>` — one cert covers every current and future
  subdomain, so a new project needs **no** new certificate.
- **DNS-01 challenge**: Traefik proves domain ownership by creating a temporary TXT record through
  the DNS provider's API (token in `~/infra/.env`). DNS-01 is required for wildcards (HTTP-01 cannot
  issue them).
- **Auto-renewal** is handled by Traefik; certs persist in `letsencrypt/acme.json`.
- **Staging first**: the ACME `caserver` line points at Let's Encrypt staging while proving the
  setup (staging certs are untrusted by browsers — expected). Once a staging cert is issued
  end-to-end, comment the `caserver` line, reset `acme.json`, redeploy → real certs. See the
  commented line in `~/infra/compose.yml`.

---

## Add a new project behind Traefik

1. Build/pull the app image; it must listen on some internal port (e.g. 3000).
2. Create `~/apps/<project>/compose.yml`:

```yaml
services:
  app:
    image: <your-image>
    restart: unless-stopped
    networks: [proxy] # no `ports:` — Traefik reaches it internally
    labels:
      - traefik.enable=true
      - traefik.http.routers.<name>.rule=Host(`<sub>.<domain>`)
      - traefik.http.routers.<name>.entrypoints=websecure
      - traefik.http.routers.<name>.tls.certresolver=le
      - traefik.http.services.<name>.loadbalancer.server.port=<internal-port>

networks:
  proxy:
    external: true
```

3. `cd ~/apps/<project> && docker compose up -d`. Traefik discovers the labels and routes it,
   issuing/renewing the wildcard cert automatically. No DNS change needed (wildcard `*.<domain>`
   already resolves to the VPS).

### Path-based routing (multiple services under one subdomain)

To put an API under a project subdomain (same origin as its web app — ideal for cookie auth), add a
`PathPrefix` to the rule instead of a new subdomain:

```
traefik.http.routers.<name>.rule=Host(`app.<domain>`) && PathPrefix(`/api`)
```

This is the planned shape for Decksmith: `app.<domain>/api/*` → API container, `app.<domain>/` → web
(when the web image ships).

---

## Operations

```bash
# Bring the proxy up / apply config changes
cd ~/infra && docker compose up -d

# Follow Traefik logs (routing, ACME)
docker compose -f ~/infra/compose.yml logs -f traefik

# Restart just Traefik
docker compose -f ~/infra/compose.yml restart traefik
```

**Dashboard**: `https://traefik.<domain>` — restricted to the operator's source IP **and** behind
HTTP basic auth (both from `~/infra/.env`). Shows live routers, services, and TLS state. If the
operator's IP changes (dynamic ISP), update `DASHBOARD_ALLOW_IP` and `docker compose up -d`.

---

## Rollback (to host-nginx)

The pre-existing host nginx config is left on disk (service stopped and disabled, not removed):

```bash
docker compose -f ~/infra/compose.yml down   # free 80/443
sudo systemctl start nginx                    # host nginx serves again
```

Reverses in seconds. Re-enable Traefik by reversing the two commands.

---

## Troubleshooting notes (issues actually hit)

- **`client version 1.24 is too old. Minimum supported API version is 1.44`** — Docker Engine 29
  dropped old API versions; Traefik ≤ v3.3's Docker client defaults to 1.24 and cannot read the
  socket, so **no routes are discovered**. Fix: run a recent Traefik (v3.7+). Pinning
  `DOCKER_API_VERSION` on the container does **not** work (the docker provider overrides it).
- **A long `docker run … --label …` pasted over SSH gets mangled** (line wrapping + backticks in
  `Host(...)` rules break the shell). Always define containers in a `compose.yml` and transfer the
  file, rather than pasting long inline commands.
- **`acme.json` must be `chmod 600`** or Traefik refuses to start. After switching staging↔prod,
  reset it: `: > letsencrypt/acme.json && chmod 600 letsencrypt/acme.json`.

---

## Secrets reference (server-only)

`~/infra/.env` — never committed:

| Key                      | Purpose                                                         |
| ------------------------ | --------------------------------------------------------------- |
| `<dns>_DNS_API_TOKEN`    | DNS-provider API token (zone DNS edit) for the ACME DNS-01 flow |
| `ACME_EMAIL`             | Let's Encrypt expiry notifications                              |
| `TRAEFIK_DASHBOARD_AUTH` | `user:bcrypt-hash` for dashboard basic auth (`$` doubled)       |
| `DASHBOARD_ALLOW_IP`     | operator source IP (CIDR) allowed to reach the dashboard        |

The dashboard is protected by two layers: a source-IP allowlist (`DASHBOARD_ALLOW_IP`) plus basic
auth. DNS is managed by a provider that exposes an API (nameservers moved off the registrar); the
zone has a wildcard `*.<domain>` record → VPS, so any subdomain resolves without further DNS
changes.
