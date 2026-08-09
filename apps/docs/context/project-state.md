# Project State

_Updated: 2026-08-09 (Phase 3.2 **code-complete** — `apps/worker` `scryfall-card-sync` job (BullMQ +
Redis, ADR-0030/0031); write-path end-to-end validation pending a Scryfall Cloudflare unblock. On
branch `feat/scryfall-sync-worker`). This file describes the **current** state only: environment,
what works today, blockers, and what's next. Per-session history lives in `decisions-log.md`, the
merged PRs, and git — see also `retrospectives/`._

---

## Environment

| Variable                    | Status                                                                       |
| --------------------------- | ---------------------------------------------------------------------------- |
| `DATABASE_URL`              | ✅ Configured (Session Pooler port 5432 — `wcvexyibmjkuzufbvuyh`, eu-west-1) |
| Supabase project            | ✅ Active (`wcvexyibmjkuzufbvuyh.supabase.co`) — recreated session 21        |
| `SUPABASE_URL`              | ✅ Configured                                                                |
| `SUPABASE_ANON_KEY`         | ✅ Configured (`sb_publishable_*` format)                                    |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Configured (`sb_secret_*` format)                                         |
| `COOKIE_SECRET`             | ✅ Configured (real 64-char secret)                                          |
| `NODE_ENV`                  | ✅ `development` — required for `secure: false` cookies on localhost         |
| Redis                       | Not needed yet                                                               |
| `.env.example`              | ✅ Up to date (Session Pooler + COOKIE_SECRET + VITE_API_URL + NODE_ENV)     |

---

## What's Working (today)

**Quality gates** — `pnpm lint` (oxlint), `pnpm format:check` (oxfmt), `pnpm typecheck` (TypeScript
7): 0 errors. `pnpm test`: 276 passing (30 domain · 47 schema · 34 api · 19 api-client · 18 query ·
11 utils · 41 web-ui · 37 services · 14 web · 20 scryfall · 5 worker). Storybook CI runs play
functions + axe on every story.

**Backend** — Fastify API (`pnpm dev:api` → `localhost:3000`): user CRUD + all 7 auth routes
(register, login, logout, refresh, forgot/reset-password, `GET /me`), Zod type provider, error
handler with `ServiceError` exception mapper (ADR-0024), auth plugin (`app.authenticate`), rate
limiting + CORS. All orchestration in `packages/services`; routes are HTTP glue.

**Database** — Prisma 7 schema (18 models — `SyncState` added for worker sync bookkeeping, ADR-0031;
`CardFace` for multi-face cards, ADR-0029) synced to Supabase via session pooler; Supabase client
working from `packages/db`. RLS policies applied and verified (4 policies on the `authenticated`
role — defense-in-depth, the API bypasses RLS; ADR-0022, session 25).

**Frontend** — `pnpm dev:web` → `localhost:3001`. TanStack Start SSR: auth pages (login, register,
forgot-password), `_authenticated` guard (`beforeLoad` + SSR cookie forwarding, ADR-0023),
dashboard, root redirect by auth state. Cookie-based theme + language (SSR-safe, no FOUC/FOUT), i18n
EN + FR from `packages/i18n` (ADR-0025).

**Worker** — `apps/worker` (`pnpm dev:worker`, or `pnpm dev:backend` for Redis + api + worker):
`scryfall-card-sync` job on BullMQ (daily cron, concurrency 1, idempotent retries), writing
`Card`/`CardPrint`/`CardFace` via Prisma directly (ADR-0030). Composes the 3.1 bricks →
`chunkAsyncIterable` → `groupChunk` (dedup, FK order) → `upsertChunk` (per-chunk transaction). Redis
via `docker-compose.yml` (dev). Boot verified; one-off trigger `pnpm worker:sync:once`.

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
ADR-0028) surfaced at `GET /api/version` + web footer (currently `1.2.0`); external uptime (Better
Stack); infra dashboard (Homepage) at `dashboard.<domain>`.

---

## What's NOT Working / Blockers

- **Phase 3.2 write-path validation pending** — `pnpm worker:sync:once` reaches Scryfall then gets a
  Cloudflare bot challenge (403, `cf-mitigated: challenge`) on `api.scryfall.com`, triggered by the
  day's repeated automated requests. Not a code bug (read path proven in isolation); clears after an
  IP cooldown — retry later. The DB write path itself is untested end-to-end until then.
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
- Batch upsert is per-row-in-transaction (slow, ~15 min for the full dump); bulk
  `INSERT … ON CONFLICT` optimization tracked in #96 (P2028 timeout worked around with chunk 200 +
  60 s budget)
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

- **Immediate: finish Phase 3.2 validation** — once Scryfall's Cloudflare challenge clears, run
  `pnpm worker:sync:once` to validate the write path end-to-end (expect ~15 min), then verify
  `cards`/`card_prints`/`sync_state` in `pnpm db:studio` (`status = success`, `lastCardCount`).
- **Then #96** — bulk `INSERT … ON CONFLICT` upsert (removes the P2028 workaround, ~seconds instead
  of ~15 min). First ticket next session.
- **Phase 3.2 tail** — deploy the worker in prod (4th Docker image + internal Redis container,
  ADR-0031 follow-up).
- **Phase 3.3 (Card API)** — `GET /cards/search` + `/cards/:id` + autocomplete; GIN index on
  `Card.keywords`; `foil`→`finish` enum (#85).
- Phase 2.2 remainder: enable OAuth providers (Google, GitHub); email confirmation + password reset
  flow (blocked on OAuth/deep-link spec)
- Consolidation backlog P1: 30-min service-layer walkthrough (retro E2)
- Follow-up: source-map E2E validation — trigger a real prod web error, confirm GlitchTip shows
  `file:line` instead of minified output

---

## Open PRs

- `feat/scryfall-sync-worker` — Phase 3.2 worker + ADR-0030/0031 + SyncState + Scryfall JSONL fix
  (PR opened this session; includes the `chore/deps-safe-bumps` commit)
- `fix/rls-policies` — RLS docs/idempotence follow-up (session 25)

---

## Infrastructure (production)

- **Live** at `decksmith.<domain>`, path-routed behind Traefik: `/api` (API), `/` (web SSR), `/docs`
  (VitePress), `/design-system` (Storybook). Register/login verified end-to-end (same-origin
  cookies).
- **Traefik** owns 80/443 on the VPS, label-driven routing over the shared `proxy` network, wildcard
  TLS via ACME DNS-01 (auto-renew). ADR-0026 + `apps/docs/deployment/reverse-proxy.md`.
- **Deploy pipeline**: `.github/workflows/deploy.yml` builds 3 GHCR images (api / web / statics) →
  scp `deploy/compose.yml` + SSH `docker compose pull && up -d`. Deployed SHA pinned as `IMAGE_TAG`
  in the server `.env`. Secrets: `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY` (dedicated ed25519 key). GHCR
  images public.
- **Server-side `~/apps/decksmith/.env`** (never committed): `DECKSMITH_HOST`, `CORS_ORIGIN`,
  `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `COOKIE_SECRET`, `IMAGE_TAG`.
  `NODE_ENV` unset → `production` (secure cookies, `trustProxy`).
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

- `feat/scryfall-sync-worker` — Phase 3.2 worker (ADR-0030/0031, `SyncState`, batch upsert),
  Scryfall gzipped-JSONL fix, safe dep bumps. Based on `main` @ `a160f6c` (#92 bulk client merged;
  live at **v1.4.0**). 8 commits; PR opened this session.

---

## Open Decisions (not yet ADR'd)

- Profile completion state: what happens when a user has no `username`/`displayName` yet? A redirect
  to an onboarding screen is needed but not yet specced.

> Dependency versions live in the individual `package.json` files — never duplicated here.
