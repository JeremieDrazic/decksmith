# Project State

_Updated: 2026-08-12 (Phase 3.3 Card API — **sync levels 1 & 2 done and merged** (#114). Level 2 = a
post-load SQL pass (`aggregateCardAttributes`) recomputing `Card.rarities`/`finishes`/
`firstReleasedAt` from the prints; backfilled. **Prod OOM incident resolved** (#115, #96 closed):
the per-row sync upsert leaked memory and crash-looped the worker — replaced by a bulk
`INSERT … ON CONFLICT` per table (3m13s / <512 MB vs ~15 min + OOM); prod redeployed and verified
healthy. `SyncState` observability (`lastCheckedAt` + `startedAt`) **merged** (#116, released 1.9.0;
`db:push` applied). Remaining in 3.3: the endpoints. This file describes the **current** state only:
environment, what works today, blockers, and what's next. Per-session history lives in
`decisions-log.md`, the merged PRs, and git — see also `retrospectives/`._

---

## Environment

| Variable                    | Status                                                                                  |
| --------------------------- | --------------------------------------------------------------------------------------- |
| `DATABASE_URL`              | ✅ Configured (Session Pooler port 5432 — `wcvexyibmjkuzufbvuyh`, eu-west-1)            |
| Supabase project            | ✅ Active (`wcvexyibmjkuzufbvuyh.supabase.co`) — recreated session 21                   |
| `SUPABASE_URL`              | ✅ Configured                                                                           |
| `SUPABASE_ANON_KEY`         | ✅ Configured (`sb_publishable_*` format)                                               |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Configured (`sb_secret_*` format)                                                    |
| `COOKIE_SECRET`             | ✅ Configured (real 64-char secret)                                                     |
| `NODE_ENV`                  | ✅ `development` — required for `secure: false` cookies on localhost                    |
| Redis                       | ✅ Dev: `docker-compose.yml` (localhost:6379, passwordless). Prod: internal container   |
| `REDIS_PASSWORD`            | ✅ Prod only — server `~/apps/decksmith/.env` (never committed; `openssl rand -hex 32`) |
| `.env.example`              | ✅ Up to date (Session Pooler + COOKIE_SECRET + VITE_API_URL + NODE_ENV)                |

---

## What's Working (today)

**Quality gates** — `pnpm lint` (oxlint), `pnpm format:check` (oxfmt), `pnpm typecheck` (TypeScript
7): 0 errors. `pnpm test`: 278 passing (30 domain · 47 schema · 34 api · 19 api-client · 18 query ·
11 utils · 41 web-ui · 37 services · 14 web · 22 scryfall · 5 worker). Storybook CI runs play
functions + axe on every story.

**Backend** — Fastify API (`pnpm dev:api` → `localhost:3000`): user CRUD + all 7 auth routes
(register, login, logout, refresh, forgot/reset-password, `GET /me`), Zod type provider, error
handler with `ServiceError` exception mapper (ADR-0024), auth plugin (`app.authenticate`), rate
limiting + CORS. All orchestration in `packages/services`; routes are HTTP glue.

**Database** — Prisma 7 schema (18 models — `SyncState` added for worker sync bookkeeping, ADR-0031;
`CardFace` for multi-face cards, ADR-0029; `Card` + `CardPrint` gained the search-support fields of
ADR-0032 — `rarities`/`finishes`/`firstReleasedAt` and `releasedAt`/`setName`) synced to Supabase
via session pooler; Supabase client working from `packages/db`. RLS policies applied and verified (4
policies on the `authenticated` role — defense-in-depth, the API bypasses RLS; ADR-0022, session
25).

**Frontend** — `pnpm dev:web` → `localhost:3001`. TanStack Start SSR: auth pages (login, register,
forgot-password), `_authenticated` guard (`beforeLoad` + SSR cookie forwarding, ADR-0023),
dashboard, root redirect by auth state. Cookie-based theme + language (SSR-safe, no FOUC/FOUT), i18n
EN + FR from `packages/i18n` (ADR-0025).

**Worker** — `apps/worker` (`pnpm dev:worker`, or `pnpm dev:backend` for Redis + api + worker):
`scryfall-card-sync` job on BullMQ (daily cron, concurrency 1, idempotent retries), writing
`Card`/`CardPrint`/`CardFace` via Prisma directly (ADR-0030). Composes the 3.1 bricks →
`chunkAsyncIterable` → `groupChunk` (dedup, FK order) → `upsertChunk` (per-chunk transaction). Redis
via `docker-compose.yml` (dev). One-off trigger `pnpm worker:sync:once`. **Deployed in prod** (PR
#111): 4th GHCR image, internal Redis container (`internal` network only, requirepass + AOF +
`redis-data` volume), `depends_on: service_healthy`; daily cron 06:00 UTC live and verified.

**Packages** — `tokens` (tokens.css single source of truth), `web-ui` (~40 components + hooks, all
Base UI + semantic tokens), `domain` (MTG color/mana logic), `schema` (Zod DTOs + stable error
codes), `scryfall` (raw Scryfall Zod schemas + `normalizeCard` + `isCollectibleCard` + bulk client:
`getBulkDataInfo` / `fetchBulkStream` (gzip) / `streamNormalizedCards` (JSONL via readline),
provider knowledge), `api-client`, `query`, `services`, `test-utils`, `utils` (+
`chunkAsyncIterable`), `i18n`, `db`. Build pipeline compiles packages to `dist/`; `apps/api` runs
compiled `node dist/index.js`.

**Production** — fully deployed, see Infrastructure below.

**Observability & Release** — API docs (Scalar) at `/api/reference`; error tracking via self-hosted
GlitchTip (`@sentry/node` + `@sentry/react`, prod-only, no-op in dev), web stacks de-minified via
source maps uploaded to GlitchTip per release; automated SemVer releases (semantic-release,
ADR-0028) surfaced at `GET /api/version` + web footer (currently `1.8.0`); external uptime (Better
Stack); infra dashboard (Homepage) at `dashboard.<domain>`.

---

## What's NOT Working / Blockers

- The 81 rows the sync skips are edge layouts (likely `reversible_card` — `oracle_id`/`cmc` live on
  the faces, not top-level) that fail `ScryfallCardSchema`. Small (0.09%), not a bug; a follow-up
  may handle/filter them explicitly instead of logging them as "invalid".
- `apps/mobile` is an empty shell
- OAuth providers (Google, GitHub) not yet enabled in Supabase dashboard
- Supabase email confirmation **disabled** (dev-only) — re-enable before production or when the
  email confirmation flow is implemented
- DB seed creates orphaned `User` profiles (no matching `auth.users` row) — usable for DB
  exploration, not for auth testing; full fix needs `supabase.auth.admin.createUser()` before
  seeding
- `apps/api` tests use mocked Prisma/Supabase — real-DB CI (Docker PostgreSQL) pending, see
  `test-strategy.md`
- Dev docker-compose now exists but Redis-only (Postgres stays on Supabase cloud); needs OrbStack/
  Docker running for the worker
- `packages/query` has no `useCardSearch` — blocked on Phase 3 (Scryfall)
- Deploy workflow actions target deprecated Node 20 — bump in a future session
- Storybook preview: brief light-theme flash on story change (cosmetic)
- Postgres log noise: `42P01`/`3F000` on `supabase_migrations.schema_migrations` (we use Prisma
  `db:push`, not Supabase CLI migrations) — to investigate

**Dev gotchas** — after `pnpm install`, regenerate the Prisma client
(`pnpm --filter @decksmith/db db:generate`); after route changes, regenerate `routeTree.gen.ts`
(start `pnpm dev:web`, then Ctrl-C).

---

## Next Up

- **Phase 3.3 endpoints** — `GET /cards/search` (+ `CardSearchQuerySchema`: filters/sort/pagination)
  - `/cards/:id` + `/cards/:id/prints` + autocomplete; Postgres indexing (generated `tsvector` +
    GIN, array GIN, prefix/trigram) in raw SQL; `useCardSearch` in `packages/query` (unblocks Phase
    4.3). **Next up.**
- **#113** — unify the duplicated MTG enums (`Rarity`/`Color`: schema Zod vs domain type) into a
  single source of truth (small ADR). Surfaced while adding `special`/`bonus` rarities.
- **Scryfall feature backlog** — survey in `scryfall-capabilities.md`, issues #100–#108 (Tier 1:
  oracle tags / all_parts / edhrec_rank are the high-leverage next data wins).
- `foil`→`finish` enum (#85); GIN index on `Card.keywords`.
- Phase 2.2 remainder: enable OAuth providers (Google, GitHub); email confirmation + password reset
  flow (blocked on OAuth/deep-link spec)
- Consolidation backlog P1: 30-min service-layer walkthrough (retro E2)
- Follow-up: source-map E2E validation — trigger a real prod web error, confirm GlitchTip shows
  `file:line` instead of minified output

---

## Open PRs

- None. #114 (Phase 3.3 sync levels 1 & 2), #115 (bulk-upsert OOM fix, closes #96) and #116
  (`SyncState` heartbeat, released 1.9.0) **all merged**.

---

## Infrastructure (production)

- **Live** at `decksmith.<domain>`, path-routed behind Traefik: `/api` (API), `/` (web SSR), `/docs`
  (VitePress), `/design-system` (Storybook). Register/login verified end-to-end (same-origin
  cookies).
- **Traefik** owns 80/443 on the VPS, label-driven routing over the shared `proxy` network, wildcard
  TLS via ACME DNS-01 (auto-renew). ADR-0026 + `apps/docs/deployment/reverse-proxy.md`.
- **Deploy pipeline**: `.github/workflows/deploy.yml` builds 4 GHCR images (api / web / statics /
  worker) → scp `deploy/compose.yml` + SSH (`set -euo pipefail`) `docker compose pull && up -d`.
  Deployed SHA pinned as `IMAGE_TAG` in the server `.env`. Secrets: `VPS_HOST`, `VPS_USER`,
  `VPS_SSH_KEY` (dedicated ed25519 key). GHCR images public.
- **Worker + Redis** (PR #111, ADR-0030/0031): the `worker` container (headless BullMQ consumer,
  daily Scryfall sync) and an internal `redis` container (digest-pinned, requirepass + AOF +
  `redis-data` volume, healthcheck) run on the `internal` network only — never Traefik-routed. The
  worker waits on `depends_on: redis service_healthy`; cron 06:00 UTC. One-off:
  `docker compose exec worker node dist/sync-once.js`.
- **Server-side `~/apps/decksmith/.env`** (never committed): `DECKSMITH_HOST`, `CORS_ORIGIN`,
  `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `COOKIE_SECRET`, `REDIS_PASSWORD`,
  `IMAGE_TAG`. `NODE_ENV` unset → `production` (secure cookies, `trustProxy`).
- **DNS**: wildcard record → VPS via API-capable provider. Traefik dashboard behind IP-allowlist +
  basic auth. Infra secrets live only in server-side `~/infra/.env`.
- **Observability**: self-hosted **GlitchTip** (error tracking) at `monitoring.<domain>` in
  `~/infra/glitchtip/`; **Better Stack** (external uptime) on `/api/health` + web root; **Homepage**
  infra dashboard at `dashboard.<domain>` in `~/infra/homepage/` (basic auth, reuses the Traefik
  dashboard middleware). All observability config lives on the VPS, never in the repo.
- **Releases**: semantic-release heads the deploy pipeline (ADR-0028) — git tag + GitHub Release +
  root `package.json` bump (`chore(release) [skip ci]`), version baked into images and surfaced at
  `/api/version` + web footer. CI secrets added: `VITE_SENTRY_DSN`, `SENTRY_URL`,
  `SENTRY_AUTH_TOKEN`.

---

## Current Branch

- `main` — #116 merged (released 1.9.0). Next: the Phase 3.3 Card API endpoints.

---

## Open Decisions (not yet ADR'd)

- Profile completion state: what happens when a user has no `username`/`displayName` yet? A redirect
  to an onboarding screen is needed but not yet specced.

> Dependency versions live in the individual `package.json` files — never duplicated here.
