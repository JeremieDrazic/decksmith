# ADR-0026: Reverse Proxy & Deployment Topology (Traefik)

**Last Updated:** 2026-07-24  
**Status:** Active  
**Context:** Decksmith

---

## Context

Decksmith is deployed to a single VPS that also hosts other, unrelated projects (with more planned).
Before this decision the VPS ran one application as a Docker container, exposed through a
**host-installed nginx** acting as reverse proxy, with TLS certificates issued manually per domain
via Certbot. Each application meant:

- one hand-written nginx `server` block (`server_name` + `proxy_pass` to a host port),
- one manual Certbot invocation to obtain and wire the certificate,
- manual bookkeeping of which host port belongs to which container.

Adding Decksmith's `apps/api` container surfaced the limits of this model immediately:

1. **Host-port collision** — the existing site and the new api container both defaulted to the same
   host port. Ports must now be allocated and remembered by hand, and the problem compounds with
   every new project.
2. **Per-project manual ops** — every new service requires editing nginx and running Certbot by
   hand. This is O(manual work) per project and drifts easily (a hand-edited nginx file can diverge
   from what is actually running).

The goal is a routing + TLS layer that scales to N projects on one VPS with near-zero per-project
operations, without coupling each application to shared nginx configuration.

Scope note: Decksmith's deployable unit today is the `apps/api` container (the `apps/web` image is
deferred — see roadmap §2.4, blocked on a nitro v3-beta bundling issue). Data and auth are provided
by Supabase (external managed service), so the proxy fronts stateless application containers only.

## Current Decision

Adopt **Traefik** as a containerized, label-driven reverse proxy that owns ports 80/443 on the VPS.

### Topology

- **Traefik runs as a Docker container** and is the only process bound to host ports 80 and 443.
- A **shared external Docker network** (e.g. `proxy`) connects Traefik to every application
  container. Application containers do **not** publish host ports; Traefik reaches them over the
  shared network by container name. This removes host-port allocation entirely.
- Each application declares its routing and TLS intent through **Docker labels** on its own
  container (a host rule — optionally narrowed by a path prefix — the HTTPS entrypoint, and the ACME
  certificate resolver). There is no central per-project config file to edit.
- **Automatic TLS** via Let's Encrypt (ACME) is built into Traefik: certificate issuance and renewal
  are handled by the proxy, replacing per-project Certbot.

### Migration of the existing site

The single existing site is migrated **behind Traefik**: its container joins the shared network and
gains routing labels, and host-nginx is retired from ports 80/443. This is done now, while only one
site needs migrating — deliberately the cheapest possible moment.

### DNS

A **wildcard record** `*.<domain>` → VPS is used so that any new subdomain resolves without touching
DNS. Traefik dispatches requests by `Host` header, and — within a host — by path prefix. Decksmith
lives under a **single subdomain** `decksmith.<domain>`, split by path: `/api` → API, `/` → web,
`/docs` → VitePress, `/design-system` → Storybook. Traefik's default router priority (longest rule
wins) makes the path-scoped routers outrank the bare-host web router with no explicit priority
needed.

### Images

Application images are **built in CI and pushed to GHCR**; the VPS only **pulls** tagged images. The
server never builds images. Each project ships a small `compose.yml` referencing the shared external
proxy network and its image tag.

> Confidentiality: concrete host addresses, the apex domain, ACME account email, and all secrets
> live only in server-side configuration and untracked `.env` files — never in this repository.

## Rationale

- **Separation of concerns** — routing and TLS are infrastructure, owned by one proxy. Applications
  declare _intent_ (a hostname) via labels instead of owning nginx configuration. This mirrors the
  project's existing boundary discipline (ADR-0005): each unit states its contract, nothing reaches
  across.
- **Deterministic & reproducible** — the running image is a GHCR tag, and the proxy's routing is
  derived from live container labels. There is no hand-edited server file that can silently drift
  from reality.
- **Scales to many projects** — a new project is "container + labels", and wildcard DNS already
  covers its subdomain. Per-project operations drop from manual nginx+Certbot to O(1).
- **Keeps the VPS light** — building in CI means the server spends no CPU on image builds.
- **Clarity over cleverness** — one proxy, one TLS mechanism, one convention across all projects.
- **Transferable** — Traefik is a widely used industry standard; the concepts (label-based routing,
  ACME resolver, shared proxy network) carry directly to other hosts and to orchestrators.

## Trade-offs

**Benefits:**

- No per-project nginx block or Certbot run; TLS (including renewal) is automatic.
- No host-port juggling — application containers publish nothing to the host.
- Wildcard DNS: new subdomains need no DNS change.
- Uniform, documented convention for every current and future project.
- Reproducible images from GHCR; the VPS stays a thin runtime.

**Costs:**

- One-time migration of the existing site behind Traefik.
- A learning curve for Traefik's label/router/resolver model.
- A new moving part (the proxy) and an ACME/DNS configuration to maintain.

**Risks:**

- **Misconfigured labels can take a site offline.** Mitigation: migrate and verify the existing site
  first, and keep the current host-nginx config as an immediate rollback path.
- **Let's Encrypt rate limits** during trial-and-error setup. Mitigation: use the ACME **staging**
  endpoint until the configuration is proven, then switch to production certificates.
- **Traefik is a single point of failure** for every hosted site. Mitigation: a restart policy
  (`unless-stopped`), and routing state that lives in container labels + a persisted ACME store, so
  the proxy is cheap to recreate.

## Evolution History

### 2026-07-24: Single-subdomain, path-based topology

- Replaced the multi-subdomain shape (`api.<domain>` + reserved `app.<domain>`) with a **single
  subdomain** `decksmith.<domain>`, routed by path prefix: `/api` (API), `/` (web), `/docs`
  (VitePress), `/design-system` (Storybook).
- **Why:** the web front end and API share one origin, so browser auth cookies are same-origin (no
  cross-subdomain cookie handling); one host means one certificate and one mental model; fewer
  subdomains to reason about. Traefik's longest-rule-wins priority routes path-scoped services ahead
  of the bare-host web router automatically.
- First concrete deployment lands with this change: CI builds `apps/api` → GHCR, then deploys the
  container behind Traefik via `deploy/compose.yml` (labels `Host(...) && PathPrefix(/api)`).
- Since the API path prefix (`/api`) matches the routes Fastify already serves, **no StripPrefix**
  middleware is used — Traefik forwards the path unchanged.

### 2026-07-21: Initial decision

- Adopt Traefik as a container-based, label-driven reverse proxy owning 80/443, replacing
  host-installed nginx + manual per-project Certbot.
- Application containers join a shared external Docker network and declare routing/TLS via labels;
  they publish no host ports.
- Automatic Let's Encrypt TLS via Traefik's ACME resolver (staging first, then production).
- Images built in CI and pushed to GHCR; the VPS pulls only.
- Wildcard `*.<domain>` DNS; route by `Host`. Decksmith: `api.<domain>` now, `app.<domain>` reserved
  for the deferred web front end.
- The one pre-existing site is migrated behind Traefik as part of this change.
- **Alternatives considered:** _Caddy (caddy-docker-proxy)_ — same label-driven, auto-TLS model with
  a simpler configuration surface, rejected for Traefik's broader industry adoption and richer
  routing/observability. _Keep host-nginx + manual Certbot per project_ — rejected: does not scale
  and already caused a host-port collision at the second project.

## References

- ADR-0005: Package Boundaries and Dependency Graph (boundary/intent-declaration discipline)
- ADR-0014: API-Proxied Auth (the API fronted by the proxy; Supabase as external auth/data)
- `apps/api/Dockerfile` — the production API image (multi-stage, ~380MB) fronted by Traefik
- `apps/docs/roadmap.md` §2.4 Docker & CI/CD (GHCR, nginx→Traefik, Certbot→ACME) and the deferred
  `apps/web` image
