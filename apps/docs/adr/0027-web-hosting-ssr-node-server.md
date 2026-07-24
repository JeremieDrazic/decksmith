# ADR-0027: Web Hosting — TanStack Start SSR Node Server

**Last Updated:** 2026-07-24  
**Status:** Active  
**Context:** Decksmith

---

## Context

`apps/web` (TanStack Start, SSR/CSR hybrid) must be deployed online. Two things had to be decided
together: the **hosting shape** (a Node SSR server vs a static SPA behind nginx) and how to
**unblock the Docker build**, which was stuck on a nitro bundling bug.

Forces at play:

- Several already-shipped features depend on server-side rendering: the auth guard runs in
  `beforeLoad` server-side and forwards cookies (ADR-0023), theme and language are read from cookies
  during SSR to avoid a flash of wrong content, and link-sharing meta tags are rendered server-side
  (ADR-0010). Dropping SSR would mean rewriting working, tested code.
- The production Docker image was blocked: nitro v3-beta (bundled by TanStack Start) externalizes
  `react` but does not trace it into `.output`, so `node .output/server/index.mjs` crashes at render
  with `Cannot find module 'react'`. Root cause is upstream — Vite's SSR lowering turns a vendored
  `require("react")` (from Base UI's `use-sync-external-store` shim) into a runtime `__require` that
  dangles once React is bundled for a self-contained output (nitrojs/nitro#4171).
- Decksmith is deployed on a single VPS behind Traefik (ADR-0026), under one subdomain routed by
  path (ADR-0026 evolution): `/api` → API, `/` → web.

## Current Decision

Ship `apps/web` as a **Node SSR server** — `node .output/server/index.mjs` — in a Docker container,
behind Traefik at `Host(decksmith.<domain>)` (bare host; path-scoped routers for `/api`, `/docs`,
`/design-system` win by Traefik's longest-rule-first priority).

API base URL resolves per execution context (`apps/web/src/lib/api-client.ts`):

- **Browser:** the build-time `VITE_API_URL`, baked **empty** in production → requests are
  same-origin relative (`/api/...`). Same origin keeps auth cookies same-origin, no cross-subdomain
  handling.
- **SSR server:** the runtime `API_URL` env (`http://api:3000`), reaching the API container over the
  project-private `internal` compose network.

Unblock the nitro bug with the **production `node_modules` workaround**: the image ships a pruned
prod dependency tree (`pnpm deploy --filter @decksmith/web --prod --ignore-scripts --legacy`)
alongside `.output`, so the leaked `require("react")` resolves against a real `node_modules`. This
is the same `pnpm deploy` technique already used by the API image (`apps/api/Dockerfile`).

## Rationale

- **Separation of concerns** — the web app renders and orchestrates; `apps/api` remains the sole
  backend (ADR-0016). Same-origin path routing doesn't change that boundary, it only collapses the
  hostnames.
- **Explicit data contracts** — a single origin makes the cookie/auth contract explicit and simple:
  the browser always talks to `/api` on the same host; no `SameSite`/cross-subdomain nuance.
- **Deterministic behavior** — the image is built from published, pinned versions and is
  reproducible. We deliberately avoided an experimental pre-release dependency (see alternatives).
- **Maintainability** — the unblock reuses the exact `pnpm deploy --prod` pattern of the API image,
  so there is one packaging technique to understand across both server images.
- **Clarity over cleverness** — a plain Node server with a real `node_modules` is boring and
  predictable, over an experimental bundler flag whose behavior may shift.

## Trade-offs

**Benefits:**

- Keeps SSR and server functions already relied on (auth guard, cookie-based theme/language, meta
  tags) — zero rewrite.
- Same-origin `/api` → simplest possible cookie auth.
- Reproducible image from stable, published versions.
- Consistent packaging with the API image.

**Costs:**

- Larger image than a self-contained `.output` — it ships a prod `node_modules` (with React) next to
  the bundle.
- A running Node process to operate (vs static files), though that is inherent to the SSR choice,
  not to the workaround.

**Risks:**

- The `node_modules` workaround is a **stopgap** for an unresolved upstream bug. It must be
  revisited as the dependency chain releases fixes — see the Evolution note. Mitigation: a `TODO` in
  `apps/web/Dockerfile` points here.
- If SSR-time rendering calls the API and the API is down, the SSR render can fail. Mitigation: the
  container healthcheck probes `/`; Traefik keeps serving as soon as the container is up.

## Alternatives Considered

- **Static SPA + nginx** — trivial hosting, no nitro dependency. Rejected: loses SSR/server
  functions (the `beforeLoad` cookie-forwarding auth guard of ADR-0023, SSR theme/language cookies,
  ADR-0010 meta tags), forcing a rewrite of working, tested code and a UX regression (FOUC, auth
  flash).
- **nitro experimental `cjsRequireRewrite` flag** (PR nitrojs/nitro#4365) — would rewrite the leaked
  require to the bundled React copy, giving a self-contained `.output` and a smaller image. Rejected
  for now: the PR is unmerged and requires pinning a non-published pre-release build
  (`https://pkg.pr.new/nitro@4365`), and the flag is `experimental` — not reproducible or durable
  for a public showcase repo. To be re-evaluated once merged and published.
- **Edge/serverless hosting** — off-VPS. Rejected: contradicts the single-VPS Traefik topology
  (ADR-0026).

## Evolution History

### 2026-07-24: Initial decision

- Host `apps/web` as a Node SSR server behind Traefik, single subdomain, same-origin `/api`.
- Per-context API URL: empty `VITE_API_URL` (browser, relative) + runtime `API_URL` (SSR, internal).
- Unblock nitrojs/nitro#4171 with a prod `node_modules` shipped next to `.output`
  (`pnpm deploy --prod`), same technique as the API image.
- **Open follow-up (tech debt):** drop the workaround and ship a bare, self-contained `.output` once
  the upstream Vite/rolldown fix — or nitro's `experimental.cjsRequireRewrite` (PR #4365) — lands in
  a published release. Track the dependency chain (`@tanstack/react-start`, `nitro`, `vite`) at each
  upgrade and re-test `node .output/server/index.mjs` **outside the workspace** (the monorepo
  `node_modules` masks the bug).

## References

- ADR-0016: TanStack Start adoption (SSR/CSR hybrid, `apps/api` sole backend)
- ADR-0023: Auth guard SSR (`beforeLoad` + cookie forwarding — depends on SSR)
- ADR-0026: Reverse Proxy & Deployment Topology (Traefik, single subdomain, path routing)
- nitrojs/nitro#4171 — externalized `react` not traced into `.output`
- nitrojs/nitro#4365 — experimental `cjsRequireRewrite` workaround flag
- `apps/web/Dockerfile` — the production web image (SSR + prod `node_modules` workaround)
- `apps/web/src/lib/api-client.ts` — per-context API base URL resolution
