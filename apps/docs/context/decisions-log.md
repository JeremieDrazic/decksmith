# Decisions Log

Micro-decisions that don't warrant a full ADR. Ordered newest-first.

---

## [2026-08-12] — Sync upsert rewritten to bulk `INSERT … ON CONFLICT` (OOM fix, #96)

**Context:** The prod worker's daily Scryfall sync was **OOM-crash-looping** (heap ~1.9 GB, last
successful sync 3 days stale, `SyncState.status` stuck at `running` because the OOM kill never hits
the `catch`). Root cause found by instrumentation, not guesswork: the streaming path was first
cleared (a slow-consumer probe kept heap flat at ~50 MB, so backpressure works), then the **per-row
upsert** was confirmed as the leak — a probe of the real write loop showed heap climbing
monotonically (127 → 411 MB by chunk 40 → OOM). Each chunk built ~600 Prisma ops
(`prisma.card/cardFace/cardPrint.upsert` × 200 in one `$transaction`); the Prisma 7 client engine /
adapter-pg retains something per op that never gets collected. This is the same work already tracked
for perf as **#96**.

**Decision:** replace the per-row upsert with **one bulk `INSERT … ON CONFLICT DO UPDATE` per
table** (`bulkUpsertCards` / `Faces` / `Prints`), composed via `Prisma.sql` + `Prisma.join` (safe
parameterized multi-row `VALUES`), run inside one interactive `$transaction` in FK order. Key
points:

- `gen_random_uuid()` supplies `CardFace`/`CardPrint` ids inline — `@default(uuid())` in Prisma is
  **client-side**, so those columns have **no Postgres default** and a raw `INSERT` must provide the
  id.
- `cards` deliberately **omits** the level-2 aggregate columns (`rarities`/`finishes`/
  `firstReleasedAt`) from both `INSERT` and `DO UPDATE`, so the per-print sync never clobbers what
  `aggregateCardAttributes` owns.
- `updated_at = now()` explicit (raw SQL bypasses `@updatedAt`); JSON via `::jsonb`, arrays as
  `text[]`.
- Interactive-transaction `timeout` raised to 30 s to absorb Supabase pooler latency spikes (P2028).

Kept the interactive-transaction shape over the `$transaction([...])` array form for readability
(explicit early-return on empty chunks, no lazy-PrismaPromise plumbing) — _clarity over cleverness_.

**Impact:** `apps/worker/src/scryfall-card-sync/` — `upsert-chunk.ts` rewritten as a 3-call
orchestrator + new `bulk-upsert-{cards,faces,prints}.ts`. Proven end-to-end: full dump in **3m13s**
(34.5k cards, 101k prints) under a **512 MB** cap, heap flat — vs ~15 min + OOM before. Closes the
perf goal of **#96** and unblocks the prod worker. **Lessons:** (1) instrument before fixing — the
first hypothesis (broken stream backpressure) was wrong and a 2-minute probe disproved it; (2)
Prisma's `@default(uuid())` generates client-side, so raw SQL must generate ids itself.

---

## [2026-08-11] — Scryfall's 6 rarities added; duplicate `Rarity` definitions kept parallel

**Context:** ADR-0032 denormalizes `Card.rarities[]` (aggregate of all a card's print rarities). Our
`RaritySchema` only knew 4 values (`common`/`uncommon`/`rare`/`mythic`), but Scryfall emits **6** —
`special` (timeshifted) and `bonus` (bonus sheets) too. Left as-is, the aggregate DTO would reject
any card printed at those rarities. Discovered in the process: `Rarity` is defined **twice** —
`RaritySchema` (Zod, `packages/schema`) and a plain `Rarity` union (`packages/domain`, consumed by
`web-ui`'s `RarityBadge`), with the same duplication existing for colours (`ColorSchema` vs
`MtgColor`).

**Decision:** add `special` + `bonus` across **every** layer (schema enum, domain type,
`RarityBadge` `Record` + two new `rarity-special`/`rarity-bonus` design tokens + the design-system
story), keeping the two `Rarity` definitions **parallel and hand-synced** — the same pattern colours
already use. Unifying the duplicated MTG enums into a single source of truth (which package owns
them, dependency direction) is a broader architectural choice deferred to a small ADR — tracked in
**issue #113**. Token colours (`special` purple `#8b47c4`, `bonus` teal `#2fa39a`) are provisional
pending the search UI review.

**Impact:** `packages/schema` (`RaritySchema`), `packages/domain` (`Rarity`), `packages/tokens`
(`mtg.css`), `packages/web-ui` (`RarityBadge` + story). No behaviour change until the aggregate is
populated (sync level 2).

---

## [2026-08-09] — Scryfall migrated bulk data to gzipped JSONL — client reworked

**Context:** The first real Phase 3.2 worker run surfaced that Scryfall's `/bulk-data/default_cards`
now serves **gzipped JSONL** (`.jsonl.gz`, fields `jsonl_download_uri` / `compressed_size`), not the
JSON array (`download_uri` / `size`) the 3.1 client assumed. The 3.1 tests were mocked, so the drift
was latent until first live integration.

**Decision:** rework the three `packages/scryfall` bricks (signatures unchanged, so the worker is
untouched):

- `getBulkDataInfo` reads `jsonl_download_uri` / `compressed_size`.
- `fetchBulkStream` pipes the body through `DecompressionStream('gzip')` — the file is served
  `Content-Type: application/gzip` with **no** `Content-Encoding`, so `fetch` does not
  auto-decompress.
- `streamNormalizedCards` parses **JSONL line-by-line via Node's built-in `readline`**
  (`Readable.fromWeb`), replacing `@streamparser/json-whatwg` (now removed). Chosen over a
  hand-rolled line buffer: readline is the canonical, official way to read a stream by lines.
  **Supersedes** the streaming-JSON-array decision below.

**Impact:** `packages/scryfall` (3 functions + tests), `@streamparser/json-whatwg` dependency
dropped. Read path verified against the live API. **Lesson:** verify an external API's real response
shape against the live endpoint before building on it — mocks alone hid this for a whole phase.

---

## [2026-08-09] — Bulk download client + `@streamparser/json-whatwg` (streaming JSON)

**Context:** Phase 3.1's last step — the client that turns Scryfall's `default_cards` bulk dump into
normalized cards. The dump is a single JSON array (~2 GB, ~90k rows); `JSON.parse` would buffer all
the bytes then materialize a 90k-object array at once → memory blowup. We need to parse
incrementally and process one card at a time.

**Decision — dependency:** add `@streamparser/json-whatwg` (v0.0.23), a streaming JSON parser
exposed as a WHATWG `TransformStream`. Chosen over `stream-json`: **zero runtime dependencies**, and
it consumes `fetch().body` (a WHATWG `ReadableStream`) directly — `stream-json` speaks the legacy
Node streams API and would need a `Readable.fromWeb(...)` adapter. Logged here, **not an ADR**: a
scoped parsing utility, not an infra/runtime brick (unlike Redis/BullMQ).

**Decision — architecture:** three bricks, network deliberately isolated from parsing so the
pipeline is testable without hitting the wire:

- `getBulkDataInfo()` → `{ downloadUri, updatedAt, size }` (metadata endpoint — cheap)
- `fetchBulkStream(uri)` → `ReadableStream<Uint8Array>` (thin fetch of the dump)
- `streamNormalizedCards(bytes)` → `AsyncGenerator<NormalizedCardBundle>` (parse → validate → filter
  → normalize)

The output contract is an **async generator** yielding one bundle at a time → backpressure for free:
the parser only advances when the consumer pulls, so a slow DB write upstream (3.2) pauses parsing
instead of flooding memory. Invalid rows are **skipped and reported via an
`onInvalidRow(error, index)` callback** (never thrown per-row — one bad card can't abort a 90k sync;
a pure lib reports, it doesn't log); non-collectible cards are skipped silently. A **stream-level**
failure (network drop, structurally broken JSON) throws and propagates — that's fatal, unlike a bad
row.

**3.1 / 3.2 boundary:** `packages/scryfall` produces the normalized stream and knows Scryfall
(endpoints, wire format). The worker (3.2) composes the three bricks, batches, and persists via
Prisma. `updatedAt` is the incremental hook — the metadata call is cheap, so the worker can skip the
2 GB download when the dump hasn't changed.

**Tooling fix (same branch):** `packages/scryfall/tsconfig.json` extended `base.json` (`bundler`, no
node types) while its `tsconfig.build.json` used `node.json` (`NodeNext`). The two disagreed, and
`pnpm build` was **silently broken on `main`** — `normalize-card` had relative imports missing the
`.js` extension, which only `NodeNext` rejects, and CI runs lint/typecheck/test but **not** package
builds. Fixed: `tsconfig.json` now extends `node.json`, `@types/node` added as a devDep, `.js`
extensions added. Follow-up: a GitHub issue to add package builds to the CI gate.

**Impact:** `packages/scryfall/` — new `get-bulk-data-info/`, `fetch-bulk-stream/`,
`stream-normalized-cards/`, `schemas/scryfall-bulk-data.ts`; `tsconfig.json`; `package.json`
(`@streamparser/json-whatwg`, `@types/node`). Bulk client public surface complete; consumed by the
worker in 3.2.

---

## [2026-08-03] — Phase 3.1 field mini-scope: gameplay stats + `finishes` (extends ADR-0029)

**Context:** the initial 3.1 model kept a minimal field set. Before writing the bulk download
client, a mini-scope of the fields the search + deck-stats features will need — because we discard
the dump (Postgres is the sole store), so adding a field later costs a Prisma migration **plus a
full re-sync**. Batching them now avoids per-feature churn. Scoped only "gameplay stats +
`finishes`"; the rest (print cosmetics, external IDs like `tcgplayer_id`/`cardmarket_id`,
`all_parts`, `edhrec_rank`) is deferred to its owning phase (Pricing, Recommendations, …).

**Decisions:**

1. **Gameplay stats — placement follows ADR-0029** (per-face data lives on `CardFace`, `Card`
   carries the single-face/combined value). All stored as **String** (Scryfall sends `"*"`, `"1+*"`,
   `"X"` — never parse to int):
   - `power`, `toughness`, `loyalty`, `defense` → nullable **on both `Card` and `CardFace`** (a
     creature front + planeswalker back have different stats).
   - `keywords` (`String[]`) and `producedMana` (`String[]`, colours a card can produce — deck
     manabase analysis) → **`Card` only**: Scryfall aggregates these at card level, not per face.
   - `color_indicator` → **skipped**: it only helps derive the colour of a mana-costless face, and
     we already store per-face `colors` — redundant.

2. **`finishes` replaces the legacy `foil`/`nonfoil` booleans.** Scryfall sends
   `finishes: ["nonfoil","foil","etched"]`; the booleans can't represent _etched_. Since there is
   **no data in the DB yet**, this is the moment for a clean swap rather than keeping both
   (guaranteed drift). `CardPrint.foil`/`nonfoil` → **`CardPrint.finishes String[]`**.

**Impact (implementation, next branch — order per ADR-0029):** Prisma migration (`Card` +
power/toughness/loyalty/defense/keywords/producedMana; `CardFace` + power/toughness/loyalty/
defense; `CardPrint` foil/nonfoil → finishes) + `db-reviewer` + `db:push`; `packages/schema` DTOs
(`CardResponseSchema`, `CardFaceSchema`, `CardPrintResponseSchema`); `packages/scryfall` raw schemas

- `normalizeCard` + tests. Then the bulk download client.

---

## [2026-07-31] — `normalizeCard` output contract: local types + all image sizes

**Context:** implementing `normalizeCard` in `packages/scryfall`. Two shape questions the scoping
left open. **Decisions:** (1) **Output = local plain types** (`NormalizedCard` / `NormalizedPrint` /
`NormalizedFace` / `NormalizedCardBundle`), not `Prisma.*CreateInput` — explicit data contract, zero
Prisma coupling in `scryfall`; the 3.2 worker maps the bundle to DB writes. Plain `type`, not Zod:
validate untrusted input at the boundary, trust what our own code builds. (2) **Store every image
size, not just `normal`** — the bulk dump is streamed then discarded (Postgres is the sole store),
so any size not captured is lost until the next full re-sync. `NormalizedImageUris` mirrors
Scryfall's 6 sizes (camelCase), all **optional** (Scryfall may omit; the API DTO promises all six to
clients, but storage must tell the truth). `CardPrint.imageUris` stays `{ front, back? }` with
`back` present only when faces carry their own images (transform/mdfc/reversible) — a
split/adventure has two faces but one shared image. **Impact:**
`packages/scryfall/src/normalize-card/`.

---

## [2026-07-31] — Scryfall response schemas live in `packages/scryfall`, not `packages/schema`

**Context:** implementing ADR-0029. Its follow-up #2 loosely bundled "the Scryfall response schemas"
into the `packages/schema` work. On closer reading that conflicts with the boundary confirmed at
Phase 3.1 scoping (decisions-log 2026-07-30): normalization "knows an external provider → stays in
`packages/scryfall`". **Decision:** `packages/schema` holds only **API-facing DTOs** (what _our_ API
returns — `CardResponseSchema`, `CardFaceSchema`, `CardImagesSchema`). The Zod schemas that
**validate Scryfall's raw bulk payload** are provider knowledge and live in `packages/scryfall`,
colocated with the normalization that consumes them — keeping the shared contracts package free of
any Scryfall coupling. **Impact:** this session only touched `packages/schema` DTOs; the Scryfall
input schemas move to the `packages/scryfall` scaffold (next branch). Also refined two DTO calls:
`layout` kept `z.string()` and `faceIndex` kept `.int().nonnegative()` (not enum / `0|1` literals) —
forward-compat, an unforeseen layout or face count degrades instead of throwing at the API boundary.

---

## [2026-07-30] — Phase 3.1 `packages/scryfall` scoping (pre-implementation)

**Context:** kicking off Phase 3 (Scryfall). Scoping session — no code — to settle the package's
boundaries and normalization model before writing anything. Spec `card-search.md` predates several
architecture rules and contains drift (worker calling Prisma directly; `createMany` wrongly
presented as an upsert; `colors`/`color_identity` conflated; multi-face cards unaddressed). Decided
each open question, mentor/pair mode (Jérémie will write the normalization logic).

**Decision:**

1. **Bulk strategy** — use Scryfall's `default_cards` dump (one row per print → feeds both `Card`
   and `CardPrint`). Downloaded, **streamed** (not `JSON.parse`'d whole), normalized, written to
   Postgres, then discarded — the file is never persisted; **Postgres is the sole store**. EN first,
   FR deferred (needs a wider dump/pass). Daily download + scheduling belong to 3.2 (worker), not
   3.1.
2. **Colors** — store both `colors` (casting cost) **and** `colorIdentity` (all colors anywhere on
   the card, needed for Commander in Phase 7). Adds `Card.colorIdentity String[]`.
3. **Multi-face cards** — **option B** (mirror Scryfall's structure), adapted to our oracle/print
   split: new **`CardFace`** table holding the _oracle_ part of each face (name, manaCost, typeLine,
   oracleText, colors, index), linked to `Card`; per-face _images_ kept in `CardPrint.imageUris`
   JSON as `{ front, back }` (no `CardPrintFace` table — an image has no queryable structure). Add
   `Card.layout` (`normal` / `transform` / `split` / `token` / …) — drives both face-reading and
   at-query filtering.
4. **Non-card filtering** — keep large, filter at usage (reversible) rather than dropping at
   ingestion. Pure, tested `isCollectibleCard`: keep only `games` including `paper`; **drop**
   digital-only, oversized/memorabilia, and `art_series` (the last has no `type_line`/`cmc`, would
   force nullable columns on 99% of real cards); **keep** tokens and emblems (proxy use case; a
   later "counts toward deck size?" function reads `layout`).
5. **In-memory cache** — **removed from 3.1**, moved to 3.2: nothing costly is re-queried yet; the
   only real cache (last bulk `updated_at` to skip re-downloads) is sync-tracking state that lives
   in the DB, owned by the worker.
6. **Worker → DB (deferred question)** — 3.2's worker will write to Postgres; whether it imports
   `packages/db` (Prisma) directly or goes through the API is an **ADR to write in 3.2**, not
   settled here. The "Prisma never outside the API" rule was written for `apps/web`; the worker is a
   backend.

**Boundary confirmed:** normalization is **pure but stays in `packages/scryfall`** (it knows an
external provider — not reusable MTG domain logic), calling `packages/domain` pure helpers
(`parseManaCost`, `sortColorIdentity`). `packages/domain` stays Scryfall-agnostic.

**Impact:** docs only this session — `roadmap.md` (3.1 replanned: ADR + schema migration precede the
5 items; cache line moved to 3.2; worker→DB ADR added to 3.2), `project-state.md` (Next Up +
branch). Next session's order: **ADR (multi-face card modeling) → Prisma migration
(`Card.colorIdentity`, `Card.layout`, `CardFace`, `imageUris` convention) + `db-reviewer` → `schema`
DTOs → normalization**.

---

## [2026-07-29] — Infra dashboard (Homepage) + external uptime (Better Stack)

**Context:** no single landing page for the VPS services, and no uptime alerting. **Decision:**
**Homepage** (gethomepage) self-hosted at `dashboard.<domain>`, config on the VPS in
`~/infra/homepage/` (never in the repo — references the real domain). Exposed via Traefik on the
shared `proxy` network, TLS from the existing `*.<domain>` wildcard; protected by the Traefik
dashboard's basic-auth middleware only (`dashboard-auth@docker`, no IP allowlist → reachable while
travelling). Pure-black theme via `custom.css` overriding `--bg-color` (Homepage's real background
mechanism, not `body`/`bg-theme-*`). Uptime is **Better Stack** (external SaaS, deliberately NOT
self-hosted — an uptime monitor must live off-box to alert when the VPS itself is down); free tier,
monitors `/api/health` + web root, email alerts. **Impact:** VPS `~/infra/homepage/*` only (no repo
files). See memory `project_homepage_dashboard`.

---

## [2026-07-29] — Web source-map upload to GlitchTip

**Context:** browser errors in GlitchTip pointed at minified `index-*.js` lines (unreadable); the
error-tracking work (#72) left source maps as a follow-up. **Decision:** `@sentry/vite-plugin` (last
plugin in `apps/web/vite.config.ts`) + `build.sourcemap: 'hidden'` — generates maps with no
`sourceMappingURL` in the shipped JS, uploads them to GlitchTip tagged with the release, then
deletes the `.map` files (nothing served publicly). Runtime side: `lib/sentry.ts` now reports
`release: VITE_APP_VERSION`, matching the upload (debug-id based). Disabled unless
`SENTRY_AUTH_TOKEN` is set → dev/local builds no-op. **Security:** the web image is public, so the
token is a **BuildKit secret** (`--mount=type=secret`), never a build-arg;
`SENTRY_URL`/`SENTRY_AUTH_TOKEN` forwarded via `turbo.json` `passThroughEnv` (strict-env would drop
them) without polluting the cache key. `@sentry/cli` build allowed in `pnpm-workspace.yaml`;
org/project = `jerem`/`decksmith-web`. **Impact:** `apps/web` (sentry.ts, vite.config.ts,
Dockerfile, package.json), `deploy.yml`, `turbo.json`, `pnpm-workspace.yaml`. Verified in prod
(release 1.1.0). Closes #79.

---

## [2026-07-29] — Error tracking: Sentry SDK → self-hosted GlitchTip

**Context:** no visibility on production exceptions (API or web). **Decision:** the standard Sentry
SDK (`@sentry/node`, `@sentry/react`) pointed at a **self-hosted GlitchTip** (Sentry-protocol,
simpler UI, data on our VPS — see #72). GlitchTip runs in `~/infra/glitchtip/` (shared infra, NOT
the repo): all-in-one container (`SERVER_ROLE=all_in_one`) + Postgres + Valkey behind Traefik at a
generic subdomain. **App wiring:** API inits Sentry via `src/instrument.ts` (imported first) and
reports only 5xx in the error handler (4xx are expected, kept out to avoid noise); web inits via
`lib/sentry.ts`, gated to browser + production builds. Both no-op in dev. DSNs: API reads
`SENTRY_DSN` from the server `.env`; web bakes `VITE_SENTRY_DSN` at build time (public in the
bundle, so passed as a build-arg from a CI secret — its value carries the real monitoring domain,
kept out of the repo). `VITE_SENTRY_DSN` declared in `turbo.json` build env (Turbo strict-env would
otherwise drop it — same gotcha as `VITE_API_URL`). **Impact:** `apps/api` (instrument, index,
error-handler, package.json), `apps/web` (lib/sentry, router, Dockerfile, package.json),
`.github/workflows/ deploy.yml`, `turbo.json`, `.env.example`. Source-map upload (de-minified web
stacks) is a follow-up. Closes #72.

---

## [2026-07-28] — API docs: @fastify/swagger + Scalar, generated from Zod schemas

**Context:** the API had no browsable documentation. We already declare Zod schemas per route
(`fastify-type-provider-zod`), so an OpenAPI spec can be generated for free. **Decision:** add
`@fastify/swagger` (spec generation via the provider's `jsonSchemaTransform`) + Scalar
(`@scalar/fastify-api-reference`, a modern reference UI with a request playground) over the classic
Swagger-UI. Served at `/api/reference` (path-prefixed so Traefik routes it; public, no auth).
Registered before the route plugins so swagger captures every route. Tooling dependency → logged
here, no ADR. **Impact:** `apps/api/package.json`, `apps/api/src/plugins/docs.ts`,
`apps/api/src/server.ts`. The OpenAPI `info.version` is hardcoded `0.0.0` until the release system
(#73) wires the real version. Closes #71.

---

## [2026-07-24] — Session 24 deployment mechanics (non-ADR decisions)

**Context:** Bringing all of Decksmith online behind the existing Traefik proxy (topology + web
hosting are covered by ADR-0026 / ADR-0027; these are the supporting infra choices). **Decision:**

- **CI deploys via SSH.** `.github/workflows/deploy.yml` (main-only) builds images, pushes to GHCR,
  then `scp`s `deploy/compose.yml` and runs `docker compose pull && up -d` over SSH. A dedicated
  ed25519 key (`VPS_SSH_KEY` + `VPS_HOST`/`VPS_USER` secrets) is used, not a personal key.
- **Deterministic image tag.** Images are tagged `:<sha>` + `:latest`; the deploy persists
  `IMAGE_TAG=<sha>` into the server `.env`, so a manual `up -d` reuses the exact deployed SHA.
- **GHCR images public** (inherit repo visibility) — the VPS pulls anonymously, no registry login.
- **One combined nginx image** serves both static sites (`/docs` + `/design-system`) — a single
  router with two `PathPrefix`es, `absolute_redirect off` so directory redirects stay relative
  behind the TLS proxy. Artifacts are built in the CI runner, not inside Docker.
- **Per-Dockerfile `.dockerignore`.** The shared root `.dockerignore` was replaced by
  `apps/api/Dockerfile.dockerignore`, `apps/web/Dockerfile.dockerignore` (deny-lists) and
  `deploy/statics.Dockerfile.dockerignore` (allow-list) — each image declares its own build context.
- **`VITE_API_URL` declared in `turbo.json` `build` env.** Turbo strict env mode dropped it, so the
  browser bundle baked `localhost:3000`; declaring it forwards it to Vite and keys the cache.
- **Web dev server pinned to 3001** (framework default 3000 collides with the API); API default
  `CORS_ORIGIN` aligned to `http://localhost:3001`. Dev-only — prod reads `CORS_ORIGIN` from `.env`.
- **`redirectTo` validated to internal paths only** (leading `/`) — open-redirect guard, applied on
  the `_auth` layout so login inherits it.

**Impact:** `deploy/` (compose + Dockerfile.statics + nginx.conf + dockerignores),
`.github/workflows/deploy.yml`, deletion of `.github/workflows/docs.yml`, `apps/web/Dockerfile` +
`Dockerfile.dockerignore`, `apps/api/Dockerfile.dockerignore`, `turbo.json`,
`apps/web/vite.config.ts`, `apps/api/src/config.ts`, `apps/web/src/routes/{index,_auth}.tsx`,
`packages/tokens/src/web/base.css`. (PRs #51–#57)

---

## [2026-07-23] — Prisma 7 `prisma-client` generator + `pnpm deploy --no-optional` (Docker image)

**Context:** The `apps/api` production image was 1.76 GB. Two root causes: (1) the legacy
`prisma-client-js` generator writes the client into `node_modules`, forcing fragile store surgery in
the Dockerfile; (2) `@prisma/client` records the `prisma` CLI as an _optional_ peer, so
`pnpm deploy --prod` shipped ~240 MB of CLI/studio/pglite tooling the runtime never imports.
**Decision:** Migrate `packages/db` to the Prisma 7 `prisma-client` generator (client generated as
`.ts` into `src/generated`, gitignored, regenerated via `postinstall`, compiled to `dist/` like any
source); `prisma` + `dotenv` moved to devDependencies; `prisma.config.ts` falls back to a
placeholder `DATABASE_URL` so `generate` needs no `.env` on a fresh clone/CI; the deploy step uses
`pnpm deploy --prod --no-optional --ignore-scripts`. **Impact:** image 1.76 GB → 380 MB;
`packages/db` (schema, config, package.json, client/index imports), `apps/api/Dockerfile`,
`.dockerignore`, `.gitignore`. Verified: boots, `/api/health` 200, Prisma loads its WASM query
compiler without the CLI. Also required `resolve.conditions: ['source', …]` in `apps/storybook`
(and, later, `apps/web`) so bundlers resolve dual packages from TS source. (PR #48)

---

## [2026-07-18] — Session Pooler port 5432 (not 6543) for Prisma 7

**Context:** Supabase ORM quickstart shows two URLs: transaction-mode pooler (port 6543,
`?pgbouncer=true`) and session-mode pooler (port 5432). Prisma 7 with `@prisma/adapter-pg` uses
prepared statements, which PgBouncer (port 6543, transaction mode) does not support — queries fail
silently or error. **Decision:** Always use port 5432 (session-mode pooler) in `DATABASE_URL` for
both queries and migrations. Port 6543 is never used. **Impact:** `.env` root — documented in
`.env.example` comment.

---

## [2026-07-18] — NODE_ENV=development required for local auth

**Context:** `apps/api/src/config.ts` defaults `NODE_ENV` to `'production'` when the var is absent.
Auth cookies are set with `secure: config.nodeEnv === 'production'` (`auth-routes.ts:42/50`).
Without `NODE_ENV=development` in `.env`, cookies are `Secure`-flagged and silently rejected by the
browser on `http://localhost` → login appears to fail with no visible error. **Decision:** Add
`NODE_ENV=development` explicitly to `.env` for local development. **Impact:** `.env` root — first
real local run was blocked by this until the fix.

---

## [2026-07-18] — Supabase email confirmation disabled for dev

**Context:** New Supabase project defaults to email confirmation required. Decksmith dev has no SMTP
configured and no email confirmation flow implemented yet (blocked on OAuth/deep-link spec).
**Decision:** Disable "Confirm email" in Supabase → Authentication → Sign In / Providers → Email for
the dev project. Must re-enable before production. **Impact:** Supabase dashboard only — no code
change. The register response message ("Check your inbox") is a known UX mismatch for dev.

---

## [2026-07-18] — Supabase new key format (sb_publishable / sb_secret)

**Context:** New Supabase projects now issue `sb_publishable_*` / `sb_secret_*` keys by default
instead of legacy JWT keys (`eyJ…`). The legacy keys remain available and both formats work with
`@supabase/supabase-js ^2.108.1`. **Decision:** Use the new `sb_` format keys (what the dashboard
generates by default). Legacy JWTs are kept as fallback in the dashboard but not used in `.env`.
**Impact:** `.env` — `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` use new format.

---

## [2026-07-18] — TypeScript 7.0.2 + oxlint-tsgolint 0.25.0

**Context:** Session 21 dep sweep. TypeScript 6→7 was a major bump — upgraded without code changes
because the codebase was already strict and well-typed. Prisma client regeneration (`db:generate`)
was required after `pnpm install` to restore generated types (expected behaviour — Prisma always
needs a generate step after install). All 210 tests pass, 0 typecheck errors. **Impact:**
`pnpm-workspace.yaml` (catalog), `package.json` (root devDeps).

---

## [2026-07-15] — vi.hoisted() for mock class before vi.mock()

**Context:** Session 20 — `prisma-errors.test.ts` needed a `PrismaClientKnownRequestError` mock
class to test `instanceof` checks. Defining the class as a regular `const` above `vi.mock()` caused
`ReferenceError: Cannot access '...' before initialization` because Vitest hoists `vi.mock()` to the
top of the file before any other code executes. **Decision:** Use
`vi.hoisted(() => { class Foo {} return { Foo }; })` — the callback runs before module evaluation,
so the returned value is available when the `vi.mock()` factory executes. Applied in
`prisma-errors.test.ts`. The shared `__mocks__/db.ts` doesn't have this issue (no hoisting needed in
a plain module). **Impact:** `packages/services/src/prisma-errors.test.ts`,
`packages/services/src/__mocks__/db.ts`.

---

## [2026-07-15] — PrismaClientKnownRequestError mock must match real constructor signature

**Context:** Session 20 — `isUniqueConstraintError` uses
`instanceof Prisma.PrismaClientKnownRequestError`. The `__mocks__/db.ts` initially defined the mock
class as `constructor(code: string, _options?)`, but TypeScript type-checks constructor calls
against the _original_ module type even when `vi.mock` is active. The real Prisma class requires
`(message: string, { code, clientVersion })`. **Decision:** Mock class constructor matches the real
signature — first arg is `message`, second is `{ code, clientVersion }`, with
`this.code = options.code`. Call sites use
`new Prisma.PrismaClientKnownRequestError('...', { code: 'P2002', clientVersion: '5.0.0' })`.
**Impact:** `packages/services/src/__mocks__/db.ts`,
`packages/services/src/user/user-service.test.ts`.

---

## [2026-07-15] — getFieldError t param typed via ErrorKey, not string

**Context:** Session 19 — adding an optional `t` param to `getFieldError` to translate Zod error
codes. Typing `t` as `(key: string) => string` caused a TypeScript contravariance error:
react-i18next's typed `t` (post-`CustomTypeOptions` augmentation) only accepts specific union keys,
not `string`. **Decision:** Type the param as `t?: (key: ErrorKey) => string` where
`ErrorKey = keyof I18nResources['errors']`, imported from `@decksmith/i18n`. The `as ErrorKey` cast
stays inside `getFieldError`, call sites pass `tError` directly with no cast. **Impact:**
`apps/web/src/lib/form/get-field-error.ts` imports from `@decksmith/i18n`.

---

## [2026-07-15] — i18n namespace strategy: feature-based, all strings in packages/i18n

**Context:** Session 19 — deciding where translations live and how to organize them. **Decision:**
All strings (web + future mobile) in `packages/i18n`, organized by feature namespace (`auth`,
`common`, `errors`) — not by platform. No app-level locale files. **Impact:**
`apps/web/src/locales/` deleted. `packages/i18n` is the single source of truth.

---

## [2026-07-14] — pnpm 11 migration: allowBuilds + CI=true in hook

**Context:** Session 18 — user upgraded pnpm to v11.13.0 (via volta). Two breaking changes surfaced:
(1) `pnpm.onlyBuiltDependencies` in `package.json` is no longer read — pnpm 11 deprecated it in
favour of `allowBuilds` in `pnpm-workspace.yaml`; (2) pnpm 11 now requires TTY confirmation before
purging the modules directory, which breaks in husky hooks (no TTY context).

**Decisions:**

- **`allowBuilds` replaces `onlyBuiltDependencies`** — moved to `pnpm-workspace.yaml` as a
  `allowBuilds: { pkg: true }` map. Approved packages: `@prisma/engines`, `@swc/core`, `esbuild`,
  `msw`, `prisma`, `unrs-resolver`. `@parcel/watcher` and `@prisma/client` dropped (no longer need
  build scripts in pnpm 11).
- **`export CI=true` in `.husky/pre-commit`** — pnpm 11 source:
  `confirmModulesPurge: opts.confirmModulesPurge && !opts.ci`. Setting `CI=true` maps to
  `opts.ci = true` (via `ci-info`), which short-circuits the TTY check. Adding `ci=true` to `.npmrc`
  would affect all `pnpm` commands globally; hook-scoped env var is the right boundary.
- **`confirmModulesPurge` is not a user-facing config key** — the pnpm error hint ("set
  confirmModulesPurge to false") is misleading: the value is derived internally from
  `!(autoConfirmAllPrompts || force)`, not settable in `.npmrc`.

**Impact:** `pnpm-workspace.yaml`, `.husky/pre-commit`, root `package.json` (`engines.pnpm` bumped
to `>=11.0.0`).

---

## [2026-07-14] — Service layer: ServiceError + exception mapper (see ADR-0024)

**Context:** Session 18 — routes had repeated try/catch blocks that mapped Prisma/Supabase errors to
`HttpError`. Each route handler had the same boilerplate. As the route count grows, this becomes a
maintenance problem.

**Decisions:**

- **`ServiceError(code, message)` thrown by services, never `HttpError`** — services are
  framework-agnostic; they don't know about HTTP. Throwing `HttpError` from a service would couple
  business logic to the transport layer.
- **`SERVICE_ERROR_STATUS` lookup table in `error-handler.ts`** — the Fastify global error handler
  maps `ServiceError.code → HTTP status`. One place to maintain, zero try/catch in routes. Unknown
  codes map to 500.
- **Routes only try/catch when a side effect must run before re-throwing** — the only case is
  `/refresh`: cookies must be cleared even on failure. Pattern:
  `try { ... } catch (error) { clearCookies; throw error; }`.
- **No DI, no repository pattern** — services call `prisma` singleton directly. Module-level mock
  via `vi.mock('@decksmith/db')` handles tests. A repository layer would add indirection without
  payoff at current scale.

**Impact:** `packages/services/` (new package), `apps/api/src/plugins/error-handler.ts`,
`apps/api/src/modules/auth/auth-routes.ts`, `apps/api/src/modules/user/user-routes.ts`.

---

## [2026-07-14] — Cookie-based theme persistence (mirror of language pattern)

**Context:** Session 17 — `ThemeProvider` read `localStorage` in a `useState` initializer, causing
an SSR hydration mismatch: the server rendered `null` (no `localStorage`), the client rendered
`'dark'`, React logged a mismatch on `ThemeControl` (label text + Switch state). Several approaches
were considered and rejected: `suppressHydrationWarning` patches (doesn't fix the root cause),
`useEffect` (defers reconciliation, still a mismatch on first paint).

**Decisions:**

- **Cookie over localStorage for theme preference** — exactly mirrors the language cookie pattern
  established in session 16. The root loader calls `getCookie(THEME_COOKIE)` server-side and passes
  `initialTheme` to `ThemeProvider`. Server and client render the same `.dark` class → zero
  mismatch.
- **`VALID_THEMES` for raw `getCookie` validation** — `getCookie` returns the raw cookie value
  (`'light'`), not the full cookie string (`'decksmith-theme=light'`). `parseThemeFromCookieString`
  expects the full string (regex requires `key=value`). To avoid misuse, `$getServerTheme` validates
  the raw value directly against `VALID_THEMES` without calling `parseThemeFromCookieString`.
- **Default theme = `'dark'` (brand dark-first), `prefers-color-scheme` OS ignored pre-login** —
  mirrors the language default (`'en'`, ignoring `Accept-Language`). OS preference will be honored
  post-login via `UserPreferences.theme` (server knows the value). Client hints considered and
  rejected (requires server config outside Vite, complicates the mental model).
- **Anti-FOUC inline script eliminated** — since theme is derivable server-side, `.dark` is in the
  initial HTML. `dangerouslySetInnerHTML` + `oxlint-disable react/no-danger` + 3
  `suppressHydrationWarning` attributes all removed.
- **No `js-cookie` dependency at 2 call sites** — 2
  `oxlint-disable-next-line unicorn/no-document-cookie` comments are honest tools. Adding
  `js-cookie` is worth it when a 3rd preference (`UserPreferences.theme`) joins from the API — at
  that point a `resolvePreference` abstraction in `apps/web/src/lib/` makes sense.
- **Testing rule codified in `CLAUDE.md`** — every exported pure function gets a colocated
  `.test.ts` in the same session. Minimum: happy path + 2 edge cases. The `getCookie` vs
  cookie-string bug would have been caught immediately by this rule.

**Impact:** `packages/web-ui/src/hooks/use-theme/` (new `theme-cookie.ts` + `theme-cookie.test.ts`,
rewritten `ThemeProvider.tsx`), `apps/web/src/routes/__root.tsx`, `apps/web/src/components/`,
`CLAUDE.md`.

---

## [2026-07-14] — Auth guard: `beforeLoad` + SSR Cookie forwarding (see ADR-0023)

**Context:** Session 17 — dashboard needed protection; unauthenticated users accessing `/dashboard`
directly via URL (SSR) must be redirected before any content renders.

**Decisions:**

- **`beforeLoad` for SSR-safe guard** — TanStack Router `beforeLoad` runs during SSR and SPA
  navigation before the component mounts. A client-side `useEffect` redirect would flash protected
  content. `beforeLoad` never renders the route if the check fails.
- **`$getMe` server function forwards Cookie header** — during SSR, the browser's session cookie is
  on the incoming request, not in `document.cookie`. `getRequest()` from
  `@tanstack/react-start/server` reads the raw request headers; we forward `Cookie` explicitly to
  `apps/api` so Supabase Auth can verify the session server-to-server.
- **`redirectTo` search param on `/login`** — login page reads `redirectTo` via `validateSearch` +
  `useSearch({ from: '/_auth/login' })` and navigates there on success. If absent, defaults to
  `/dashboard`. Standard pattern — preserves user intent across auth redirects.

**Impact:** `apps/api/src/modules/auth/auth-routes.ts` (`GET /me`), `packages/api-client`
(`auth.me()`, fetcher `headers?`), `apps/web/src/lib/auth/get-me.ts`,
`apps/web/src/routes/_authenticated.tsx`, `apps/web/src/routes/_authenticated/dashboard/`,
`apps/web/src/routes/_auth/login.tsx`, `apps/docs/adr/0023-auth-guard-ssr-beforeload.md`.

---

## [2026-07-05] — Cookie-based i18n persistence + TextLink/AppLink split

**Context:** Session 16 — eliminating FOUT on translated strings (SSR/client divergence when
language was in localStorage) + introducing typed navigation links without coupling the DS to
TanStack Router.

**Decisions:**

- **Cookie over localStorage for language preference** — cookies are sent with every HTTP request,
  so the TanStack Start root loader can call `getCookie(LANGUAGE_COOKIE)` via
  `@tanstack/react-start/server` server-side and pass the resolved language to
  `i18n.changeLanguage()` before the component tree renders. localStorage is client-only — the
  server has no access, causing SSR to always render in `'en'` and the client to correct it
  post-hydration (FOUT). `LANGUAGE_COOKIE`, `SUPPORTED_LANGUAGES`, and `parseLangFromCookieString`
  exported from `i18n.ts` as the single source of truth.
- **`createServerFn` for SSR cookie reading, guarded by `typeof window === 'undefined'`** — the
  handler runs directly in the SSR pipeline (no HTTP round-trip); on the client the guard
  short-circuits to `parseLangFromCookieString(document.cookie)`.
- **`TextLink` (DS) / `AppLink` (apps/web) split** — `packages/web-ui` stays router-agnostic:
  `TextLink` wraps a plain `<a>` and exports `textLinkVariants` (cva). `AppLink` in `apps/web` owns
  the TanStack Router `Link` integration and applies `textLinkVariants` for visual consistency. No
  DS component takes a router dependency.

**Impact:** `apps/web/src/i18n.ts`, `apps/web/src/routes/__root.tsx`,
`apps/web/src/components/LanguageControl.tsx`, `packages/web-ui/src/ui/TextLink/`,
`apps/web/src/components/AppLink.tsx`.

---

## [2026-07-05] — bg-border-subtle for Skeleton background

**Context:** Session 16 — Skeleton component visual verification.

**Decision:** `bg-border-subtle` chosen over `bg-surface-raised` as the Skeleton fill — visually
readable against both `bg-surface` (dark and light mode) without being too prominent.
`bg-surface-raised` was too subtle on `bg-surface` in dark mode.

**Impact:** `packages/web-ui/src/ui/Skeleton/Skeleton.tsx`.

---

## [2026-07-05] — ThemeProvider anti-FOUC inline script — JSON.parse for useLocalStorage

**Context:** Session 16 — `ThemeProvider` reads localStorage. `useLocalStorage` JSON-stringifies
values, so localStorage stores `'"dark"'` not `'dark'`.

**Decision:** Anti-FOUC inline script in `__root.tsx` wraps the localStorage read in `JSON.parse()`
before comparing to `'dark'`/`'light'`, with a `try/catch` guard for when localStorage is blocked.
Without this the script silently fails and the first paint flashes the wrong theme.

**Impact:** `apps/web/src/routes/__root.tsx` (`ANTI_FOUC_SCRIPT` constant).

---

## [2026-07-04] — tinykeys added to packages/web-ui (useKeyboardShortcut)

**Context:** Session 16 — fondations hooks frontend (Skeleton, useMediaQuery, useKeyboardShortcut).

**Decisions:**

- **`tinykeys@^4.0.0` added to `packages/web-ui`** — wraps native
  `addEventListener`/`removeEventListener` with a clean shortcut syntax (`Control+k`, `$mod+k`,
  sequences). Chosen over `react-hotkeys-hook` (React-agnostic, < 1kB, we control the React API
  surface via our own wrapper hook) and over a hand-rolled implementation (tinykeys handles modifier
  normalization, `$mod` cross-platform, `contenteditable`/input ignoring out of the box).
- **Named export `{ tinykeys }` not default** — inline
  `// oxlint-disable-next-line unicorn/prefer-global-this` on `tinykeys(window, …)` call — tinykeys
  types require `Window` explicitly, `globalThis` cast would be noisier.

**Impact:** `packages/web-ui/package.json` (+1 dep), `pnpm-lock.yaml`,
`packages/web-ui/src/hooks/use-keyboard-shortcut/`.

---

## [2026-07-03] — @tanstack/react-form added to apps/web (Phase 4.4 Auth UI)

**Context:** Session 15 — Login, Register, Forgot Password pages.

**Decisions:**

- **`@tanstack/react-form@^1.33.0` added directly to `apps/web`** — ADR-0018 (§ Forms) mandates
  TanStack Form. Added as a direct dep of `apps/web` (not the pnpm catalog) because no other package
  consumes forms today; will be promoted to catalog if `apps/mobile` or a shared package adopts it.
- **Zod Standard Schema integration used (no adapter)** — TanStack Form v1 ships native support for
  Zod v4 Standard Schema via <code v-pre>validators={{ onChange: ZodSchema }}</code>. No
  `@tanstack/zod-form-adapter` needed. Raw Zod issue objects
  (`{origin, code, format, pattern, path, message}`) are returned in `field.state.meta.errors` —
  `getFieldError()` extracts `.message` before rendering.
- **`getFieldError` and `makeSubmitHandler` placed in `apps/web/src/lib/form/`** — app-level
  utilities, not shared across packages. No colocated tests (apps/web has no Vitest config).

**Impact:** `apps/web/package.json` (+1 dep), `apps/web/src/lib/form/`, 3 auth route files.

---

## [2026-06-25] — lucide-react adopted as the icon library for packages/web-ui

**Context:** Session 11 — floating components, NavigationButton, Lucide migration.

**Decisions:**

- **`lucide-react@^1.21.0` added to `packages/web-ui`** — ADR-0018 (§ Icons) mandates Lucide as the
  sole icon system. Added as a direct dependency of `packages/web-ui` (not the pnpm catalog) because
  `apps/web` does not yet consume it directly; it will be promoted to catalog when a second consumer
  appears.
- **MTG icons remain hand-crafted SVG** — Keyrune/MTG glyphs (`packages/web-ui/src/mtg/`) are
  canonical MTG iconography and not available in any generic icon library. They stay as custom SVG
  components and are explicitly excluded from the Lucide migration scope.
- **Inline SVG in `*.stories.tsx` files replaced with Lucide** — ~29 duplicated inline SVG elements
  across 10 story files replaced story-by-story. This is cosmetic for stories but enforces the
  one-system rule immediately so the pattern doesn't spread to component files.
- **Internal icons in components also replaced** — `SelectIcon` (chevron) and `SelectItem`
  `ItemIndicator` (check) migrated from custom inline SVG to `<ChevronDown>` and `<Check>` from
  Lucide.

**Impact:** `packages/web-ui/package.json` (+1 dep), `packages/web-ui/src/ui/Select/Select.tsx`, all
`*.stories.tsx` files that had inline SVG.

---

## [2026-06-22] — MTG primitives: SVG clipPath for hybrid pip split + packages/domain placement

**Context:** Session 10 — MTG primitive components (ManaIcon, ManaSymbol, HybridManaSymbol,
ManaCost, ColorIdentity) and domain functions (parseManaCost, sortColorIdentity,
getColorIdentityName).

**Decisions:**

- **Diagonal hybrid split via SVG clipPath triangles** — top-left triangle
  `polygon points="0,32 0,0 32,0"` clips the first color half; bottom-right
  `polygon points="32,0 32,32 0,32"` clips the second. Matches the appearance of physical MTG cards.
  Icons scaled at 0.4× and offset within each half.
- **`useId()` + `.replaceAll(/[^a-zA-Z0-9]/g, '')` for SVG IDs** — React's `useId()` returns IDs
  like `:r0:` containing colons, which are invalid in SVG `id` attributes when referenced via
  `url(#id)`. Stripping non-alphanumeric characters produces safe, unique IDs per component
  instance.
- **`HybridManaSymbol` is self-contained** — renders its own pip container + SVG fill. `ManaIcon` is
  pure SVG icon only (no pip, no colors). `ManaSymbol` is the router. This separates concerns
  cleanly and avoids the old mixing of pip styling inside `HybridManaIcon`.
- **`packages/domain` is shared, not frontend-specific** — `MtgColor` and domain functions live in
  `packages/domain` (used by both `apps/api` and `apps/web`). Per ADR-0016, `apps/web` should
  receive pre-computed values (e.g. `colorIdentityName`) from API DTOs rather than calling domain
  functions directly. Current placement is correct; DTOs will carry the name string.
- **No re-exports through intermediate files** — consumers import `MtgColor` directly from
  `@decksmith/domain`, never via `hybrid-defs.ts` or any re-exporting barrel. Each file imports from
  its canonical source.
- **WUBRG-sorted keys in `getColorIdentityName` lookup** — all multi-color keys must be sorted in
  WUBRG order (W=0 U=1 B=2 R=3 G=4). E.g. Selesnya = `wg` not `gw`, Simic = `ug` not `gu`, Naya =
  `wrg` not `rgw`. Always produced by running `sortColorIdentity` before joining.
- **`text-text-muted` for readable story table content** — `text-text-faint` (2.5:1) fails WCAG AA
  and is decoration-only per the design system. All story table strings use `text-text-muted`.

**Impact:** `packages/domain/` (new package, 3 functions, 30 tests), `packages/web-ui/src/mtg/`
(ManaIcon, HybridManaSymbol, ManaSymbol, ManaCost, ColorIdentity + stories),
`packages/web-ui/package.json` (added `@decksmith/domain` dep).

---

## [2026-06-21] — Worldclass audit: Card alignment + dead TS token layer deleted

**Context:** Session 9 — full audit of Card components and `packages/tokens` against the
`core/Card.jsx` canonical reference.

**Decisions:**

- **Card hover lift corrected −3px → −2px** — `core/Card.jsx:30` uses `translateY(-2px)`. Our
  implementation had used −3px (copied from `DeckCard`, a heavier tile component). Fixed in
  `Card.tsx` and `ButtonCard.stories.tsx`.
- **`hover:bg-surface-hover` removed from interactive cards** — the reference keeps surface constant
  on hover; hover is signalled by `border-accent` + accent glow + lift only. We removed
  `hover:bg-surface-hover` and `focus-visible:bg-surface-hover` from `interactiveCardClasses`.
- **Dead TS token layer deleted** — `primitives/`, `semantic/colors.ts`, `native/index.ts`,
  `index.ts` removed; `"."` JS export removed from `package.json`. Nothing imported
  `@decksmith/tokens` as JS (verified with `git grep`). The TS layer had silently drifted
  (`primitives/shadows.ts` held legacy all-black values) while `tokens.css` was updated — a dead
  "source of truth" is strictly worse than none. See ADR-0017 for the full rationale.
- **Font fallbacks hardened** — `-apple-system` added to `--font-display`/`--font-body`; `'SF Mono'`
  added to `--font-mono` for better pre-load behavior on macOS/iOS.
- **`tokens.css` header documents source-of-truth status** — explicitly notes that Style Dictionary
  (Phase 14) will generate dual outputs from this file; edit here and nowhere else.

**Impact:** `packages/tokens/src/` (9 files deleted + `tokens.css` + `package.json` + `tsconfig`),
`packages/web-ui/src/ui/Card/Card.tsx`, `packages/web-ui/src/ui/Card/ButtonCard.stories.tsx`,
`apps/docs/adr/0017-packages-tokens-architecture.md`

---

## [2026-06-17] — Storybook CI: axe-playwright + pnpm binary isolation

**Context:** Session 8 — wiring `@storybook/test-runner` + `axe-playwright` into CI. Several
non-obvious choices made during setup.

**Decisions:**

- `playwright` added as a **direct** devDependency in `apps/storybook` (not just transitive via
  `@storybook/test-runner`) — pnpm doesn't hoist binaries from transitive deps; the binary must come
  from a direct dep for `pnpm exec playwright` to work in CI.
- CI pattern: `storybook build` → `http-server storybook-static -p 6006 --silent &` → `until curl`
  health-check → `test-storybook --url http://localhost:6006 --ci` — serves the static build locally
  rather than a full Playwright browser launch; avoids Storybook dev server instability in CI.
- `storyContext.parameters?.['a11y']?.disable` (bracket notation) instead of
  `parameters?.a11y?.disable` — TypeScript 6 strict index signature access (TS4111).
- Stories showing intentionally low-contrast tokens (Design System pages, `Text/Tones`) get
  `parameters: { a11y: { disable: true } }` — these document design tokens, not user-facing UI.
- Disabled component stories get `parameters: { a11y: { disable: true } }` — WCAG 1.4.3 explicitly
  exempts disabled controls from contrast requirements.
- `noop` implemented as `function noop(): void { return; }` (named function with explicit `return;`)
  — the three common alternatives all trigger oxlint: `() => {}` → `no-empty-function`,
  `() => undefined` → `no-useless-undefined`, `() => void 0` → rejected as unclean. A statement body
  satisfies `no-empty-function`; explicit `return;` is idiomatic.
- `packages/utils` scaffolded as a proper workspace package (not a barrel in `packages/web-ui`) —
  `noop` is reusable cross-package; keeping it in `utils` avoids coupling.
- `use-prefers-reduced-motion.ts` filename (kebab-case) — oxlint `unicorn/filename-case` requires
  kebab-case or PascalCase for non-component files.

**Impact:** `.github/workflows/ci.yml`, `apps/storybook/package.json`,
`apps/storybook/.storybook/test-runner.ts`, `packages/utils/`, `packages/web-ui/src/hooks/`,
`packages/web-ui/src/ui/*/**.stories.tsx`

---

## [2026-06-13] — InputGroup, Field, Button polish: component patterns and Tailwind v4 quirks

**Context:** Session 7 — building InputGroup, Field, and polishing Button in `packages/web-ui`.
Several non-obvious choices required during implementation.

**Decisions:**

- `[&:has(...)]` arbitrary variant instead of built-in `has-[...]` — the built-in form generates no
  CSS in our Vite + Storybook setup. All `:has()` selectors use the arbitrary form.
- Descendant combinator `_` (not direct child `>`) for SVG sizing in `InputGroupButton` — SVGs
  passed as `children` to `Button` sit inside Button's inner `<span>`, so `[&>svg]` misses them;
  `[&_svg]` reaches them.
- `@source` with explicit glob (`**/*.{ts,tsx}`) in `preview.css` — Tailwind v4 Vite scanner doesn't
  hot-watch files created after startup; touching the CSS entry point forces a full rescan.
- shadcn Field (pure HTML) over Base UI Field (`@base-ui/react/field`) — TanStack Form manages all
  validation state externally; using Base UI Field would add a second validation layer that
  conflicts.
- `FieldLabel` uses Eyebrow style
  (`font-mono text-xs uppercase tracking-wide font-semibold text-text-muted`) — MTG identity, fully
  semantic token–based, readable at label scale.
- `FieldError.errors` typed as `(string | undefined)[]` (not `{ message?: string }[]`) — TanStack
  Form's `field.state.meta.errors` format differs from react-hook-form; deduplication via `Set`.
- Button `destructive` variant: subtle background (`bg-error-subtle`) at rest, fills to `bg-error`
  on hover — communicates danger without alarming the user in an idle state.
- `active:duration-instant` on Button base — 50ms snap-down for tactile press feel; resets to 0ms in
  `prefers-reduced-motion` (handled in `tokens.css`).

**Impact:** `packages/web-ui/src/ui/InputGroup/`, `packages/web-ui/src/ui/Field/`,
`packages/web-ui/src/ui/Button/Button.tsx`, `packages/web-ui/src/ui/Separator/Separator.tsx`,
`apps/storybook/.storybook/preview.css`, `apps/docs/context/pitfalls/frontend.md`

---

## [2026-06-11] — Storybook Design System stories: co-location + CSS var patterns

**Context:** Building 6 token doc pages (Colors, Typography, Spacing, Radius, Shadows, Motion)
required decisions on file placement, theming approach, and how to resolve design tokens at runtime
in Storybook.

**Decisions:**

- Stories co-located in `packages/web-ui/src/design-system/` (not `apps/storybook/stories/`) —
  closer to the tokens they document, picked up via `{ directory, titlePrefix, files }` entry in
  `main.ts`
- Shadow demo components use `cssValue="var(--shadow-card)"` (live CSS var) rather than hardcoded
  rgba strings — changes to `tokens.css` reflect immediately in stories
- `MotionDemo` passes direct CSS values (`durationMs`, `easingCss`) rather than `var(--token)`
  references for `transition` — static `@theme` tokens don't always resolve reliably in inline
  styles in Storybook renderers
- Dark mode shadows use rim-light (`0 0 0 1px rgba(168,162,204,X)`) not drop shadows — the `#0f0e17`
  background is too dark for any darkening effect to be visible

**Impact:** `packages/web-ui/src/design-system/`, `_doc-components.tsx`,
`packages/tokens/src/web/tokens.css`

---

## [2026-06-11] — Semantic shadow tokens: shadow-popover / shadow-card / shadow-overlay

**Context:** The scale tokens (`shadow-sm/md/lg`) were being used directly in components, creating
the same drift risk as using raw radius scale tokens.

**Decision:** Added three semantic roles + one accent glow, following the same philosophy as
`radius-interactive/surface/modal/badge`:

- `shadow-popover` = `shadow-sm` — tooltips, hints, small dropdowns
- `shadow-card` = `shadow-md` — cards, panels, menus (default surface)
- `shadow-overlay` = `shadow-lg` — modals, drawers, maximum elevation
- `shadow-accent` — mode-specific glow (violet light, violet-muted dark); card hover =
  `shadow-card + shadow-accent`

**Impact:** `packages/tokens/src/web/tokens.css`, all skill components, `identity.md`, `DESIGN.md`

---

## [2026-06-10] — Typography tokens completed: leading, tracking, font-body

**Context:** `packages/tokens` was missing line heights and letter spacing, causing browser defaults
to apply. Discovered when implementing `Heading` and cross-referencing the decksmith-design skill.

**Decision:** Added to `@theme` static block in `tokens.css`:

- `--leading-xs` through `--leading-4xl` — paired with type scale, tighten as size grows (4xl: 1.1)
- `--tracking-tight: -0.02em` / `--tracking-normal: 0em` / `--tracking-wide: 0.04em`
- `--font-body` — same as `--font-display` (Outfit), semantically distinct for future flexibility

**Impact:** `Heading` CVA now pairs each `size` with its `leading-*` class and applies
`tracking-tight` by default. `Heading` size range capped at 4xl (aligned with decksmith-design
skill); 5xl/6xl remain in tokens as escape hatch via `className`.

---

## [2026-06-10] — `cva` + `clsx` + `tailwind-merge` added to `packages/web-ui`

**Decision:** Three standard utilities for component authoring in `packages/web-ui`:

- `class-variance-authority` (CVA) — type-safe variant definitions; replaces ad-hoc ternaries in
  `className`
- `clsx` — conditional class joining
- `tailwind-merge` — resolves Tailwind class conflicts when consumers pass `className` overrides

`cn(...inputs)` helper lives in `packages/web-ui/src/lib/cn.ts` and is used by every component.

---

## [2026-06-10] — `errorCode` on hook return instead of `isApiError` in components

**Context:** TanStack Query hooks return `error: Error | null`. Consumers need to branch on the
error type to show the right message.

**Decision:** Each hook spreads `UseQueryResult` and adds `errorCode: ErrorCode | null`. The hook
does the `isApiError` narrowing once internally; components receive a plain string or null.

**Impact:** `useUser`, `useUserPreferences` — and all future hooks follow the same pattern. No
`isApiError` import needed in feature components.

---

## [2026-06-10] — `packages/test-utils` created to share test infrastructure

**Context:** Both `packages/api-client` and `packages/query` need MSW server lifecycle + factory
helpers. Duplicating them would diverge quickly.

**Decision:** New `packages/test-utils` package with three exports: `./server` (MSW lifecycle),
`./query-wrapper` (`createQueryWrapper` with `QueryClientProvider` only), and per-entity
`./factories/*`. Critically, `test-utils` does NOT include `ApiClientProvider` — that would create a
circular dependency (`test-utils → packages/query → test-utils`). Each consuming package wraps
`QueryWrapper` with its own providers locally.

**Impact:** New `packages/test-utils/` in the monorepo. `packages/query` and `packages/api-client`
both depend on it as a devDependency.

---

## [2026-06-10] — React Context pattern for `ApiClient` distribution in `packages/query`

**Context:** Hooks in `packages/query` need access to an `ApiClient` instance. Three options were
considered: (1) `configure(client)` module-level singleton, (2) factory `createUseUser(client)`, (3)
React Context with `ApiClientProvider`.

**Decision:** React Context (`ApiClientProvider` + `useApiClient`). The client is immutable so there
is no re-render risk. It follows the same pattern as `QueryClientProvider` which consumers already
understand, and it doesn't require every hook to accept a `client` parameter.

**Impact:** `packages/query/src/context/context.tsx`. `apps/web` will mount `<ApiClientProvider>`
near the root alongside `<QueryClientProvider>`.

---

## [2026-06-10] — `ErrorCode` union derived from schema constants via `typeof`

**Context:** `packages/schema/src/errors/codes.ts` exports string constants
(`const VALIDATION_ERROR = 'VALIDATION_ERROR'`). `packages/api-client` needs a typed `ErrorCode`
union without duplicating the string values.

**Decision:** `import type { VALIDATION_ERROR, ... }` (named imports of the constants) and build the
union as `typeof VALIDATION_ERROR | typeof VALIDATION_ERROR | ...`. TypeScript infers the literal
type from each constant. `import type *` + `ErrorCodes[keyof ErrorCodes]` was rejected — it produces
a wide `string` union and requires a namespace, which oxlint flags.

**Impact:** `packages/api-client/src/errors/errors.ts`.

---

## [2026-06-10] — `credentials: 'include'` on every fetch in `createFetcher`

**Context:** Auth tokens are stored in httpOnly cookies (ADR-0014). Every API request must send
them; `fetch` does not include cookies cross-origin by default.

**Decision:** `credentials: 'include'` hardcoded in `createFetcher` — not optional per call. SSR
route loaders (TanStack Start server-side) must not use this client; they forward cookies manually
via raw `fetch` with the request's `Cookie` header.

**Impact:** `packages/api-client/src/fetcher/fetcher.ts`. Documented in project-state.md.

---

## [2026-06-09] — Oxlint rules hardened: React, jsx-a11y, no-use-before-define

**Context:** `apps/web` scaffolded — first real React code in the repo. Default oxlint config had
the `react` and `jsx-a11y` plugins loaded but no rules enabled.

**Decisions:**

- `react/rules-of-hooks`, `react/jsx-key`, `react/button-has-type`, `react/no-unknown-property`,
  `react/jsx-no-target-blank`, `react/no-unstable-nested-components`, `react/no-danger` — critical
  correctness/security rules
- `react/jsx-pascal-case`, `react/self-closing-comp`, `react/no-array-index-key`,
  `react/jsx-no-useless-fragment`, `react/no-children-prop` — best practice rules
- `jsx-a11y/alt-text`, `anchor-is-valid`, `anchor-has-content`, `heading-has-content`, `aria-role`,
  `aria-props`, `aria-proptypes`, `label-has-associated-control`, `no-redundant-roles` —
  accessibility baseline
- `no-use-before-define: error` — enforces "component before Route" convention for all TanStack
  Router route files; catches const TDZ errors and prevents hoisting-reliant ordering
- `react/exhaustive-deps` confirmed as `DummyRule` in oxlint 1.69 — not yet implemented, revisit
  when oxlint adds support
- `*.gen.ts` added to `ignorePatterns` in both `.oxlintrc.json` and `.oxfmtrc.json` —
  `routeTree.gen.ts` is auto-generated by TanStack Router's Vite plugin and must not be linted or
  formatted

**Impact:** `.oxlintrc.json`, `.oxfmtrc.json` updated. All new rules pass on existing codebase with
0 errors.

---

## [2026-06-09] — TanStack Start v1: `@tanstack/react-start` (not `@tanstack/start`)

**Context:** Two distinct packages exist for TanStack Start. Wrong one initially installed.

**Decision:** `@tanstack/react-start` (1.168.25) is the current Vite-native v1 API.
`@tanstack/start` (< 1.x) is the deprecated Vinxi-based API — config file is `app.config.ts`,
scripts are `vinxi dev/build/start`. The correct v1 API uses `vite.config.ts` with `tanstackStart()`
from `@tanstack/react-start/plugin/vite`.

**Impact:** `apps/web/package.json`, `apps/web/vite.config.ts`. `app.config.ts` deleted. Documented
in `apps/docs/context/pitfalls/frontend.md`.

---

## [2026-06-09] — TanStack Router: `scrollRestoration` option replaces `<ScrollRestoration />`

**Context:** `<ScrollRestoration />` from `@tanstack/react-router` is deprecated since 1.170.

**Decision:** Pass `scrollRestoration: true` to `createRouter()` instead of rendering the component
in `__root.tsx`. Documented in `apps/docs/context/pitfalls/frontend.md`.

**Impact:** `apps/web/src/router.tsx`, `apps/web/src/routes/__root.tsx`.

---

## [2026-06-09] — Auth routes grouped under `_auth/` pathless layout

**Context:** Login and Register pages share a visual layout and could be at `/login` or
`/auth/login`.

**Decision:** Pathless layout `_auth.tsx` + folder `_auth/` — URLs stay `/login` and `/register`
(industry standard, password manager friendly) while sharing a layout component. TanStack Router `_`
prefix convention for groups without URL segment.

**Impact:** `apps/web/src/routes/_auth.tsx`, `apps/web/src/routes/_auth/login.tsx`,
`apps/web/src/routes/_auth/register.tsx`.

---

## [2026-06-09] — Router type augmentation auto-generated by TanStack Start

**Context:** TanStack Router docs suggest manually augmenting `@tanstack/react-router` Register
interface in `router.tsx`. TanStack Start's Vite plugin generates this automatically.

**Decision:** Do not add manual `declare module '@tanstack/react-router'` in `router.tsx`. The
`routeTree.gen.ts` codegen already augments `@tanstack/react-start` with the router type. Manual
augmentation duplicates this and can drift. Documented in `apps/docs/context/pitfalls/frontend.md`.

**Impact:** `apps/web/src/router.tsx` kept minimal.

---

## [2026-06-08] — Token system: interactive states and status triplets added

**Context:** Post-Session-A review caught missing tokens that will be needed from the first
component: interactive hover state, focus ring, and full status color triplets.

**Decisions:**

- `surface-hover` (`#2a2840` / `#ede9d8`) — subtle lift for hoverable surfaces (cards, list items)
- `border-focus` (= `accent`) — named separately from `accent` to signal accessibility intent
- Full triplets for all 4 status states: `{state}` (solid color) + `{state}-subtle` (tinted bg)
  - `{state}-text` (WCAG AA compliant on both bg colors)
- `warning` (`#f59e0b`) is orange-amber, distinct from `accent` (`#e8b84b` golden) — both
  amber-family but different purposes, must not be substituted
- `info` is a neutral UI blue (`#5b9cf6` / `#2563eb`) — never substitute `mtg-blue` (MTG color
  identity ≠ UI state)
- All light-mode `*-text` variants verified WCAG AA: error-text 9.4:1, success-text 7.0:1,
  warning-text 10.4:1, info-text 6.4:1

**Impact:** ADR-0017 updated (table + contrast section + evolution entry), DESIGN.md token list
updated, token-preview.html updated (new section + all color chips)

---

## [2026-06-08] — Session D: global test strategy validated (Phase 4.0.5)

**Context:** Conversational session to align on the full testing strategy before scaffolding
`apps/web`, `packages/web-ui`, and `packages/utils`. Decisions are documented in
`apps/docs/context/test-strategy.md` and ADR-0006 (evolution entry).

**Key decisions:**

- **`apps/storybook` as a separate app** — aggregates stories from `packages/web-ui` and
  `apps/web/src/components`. Stories remain colocated with their components.
- **`packages/utils`** — new package for pure cross-domain utilities (array, formatting). Test
  mental: "could this be used outside Decksmith?" Yes → `packages/utils`, No → `packages/domain`.
- **TDD on pure layers** — `packages/domain` and `packages/utils` use Red → Green → Refactor. All
  other layers use test-close (same session, before merge).
- **Real PostgreSQL for `apps/api`** — Docker service in CI, `beforeEach` truncate. Prisma is never
  mocked. Only Supabase Auth SDK HTTP calls mocked via `vi.mock`.
- **MSW for frontend tests** — network-level interception in Storybook (addon) and Vitest. TanStack
  Query hooks are never mocked directly.
- **Factory pattern** — colocated factories with sensible defaults and overrides. Seeds are for
  development data, not tests.
- **No coverage thresholds** — value criterion only: catches costly bugs, documents non-obvious
  behaviour, enables refactoring.
- **CI split** — unit + integration on every PR (< 3 min), E2E (Playwright) on `main` only.

**Impact:** `apps/docs/context/test-strategy.md` created, ADR-0006 evolution entry added

---

## [2026-06-08] — Session C: "production-ready component" definition validated (Phase 4.0.5)

**Context:** Before scaffolding `packages/web-ui`, aligned on what "done" means for a component and
how the package should be structured.

**Key decisions:**

- **`packages/web-ui` structure:** `ui/` (shadcn-generated), `components/` (custom Decksmith),
  `typography/` (`<Heading>`, `<Body>`, `<Label>`), `icons/` (custom animated SVG)
- **`packages/web-ui` vs `apps/web` boundary:** mental test — "could this component be used in
  another React app without modification?" Yes → `packages/web-ui`, No → `apps/web/src/components/`
- **Forbidden in `packages/web-ui`:** TanStack Router imports, TanStack Query hooks, Zustand,
  `packages/api-client` — no app coupling
- **Two levels of "done":** v1 (usable — 7 criteria) and Complete (stable — all v1 criteria + play
  functions, MDX, a11y-reviewer, motion tokens). v1 unblocks usage; Complete is earned through use.
- **Rule of 3:** never create a component speculatively — extract when a pattern repeats in 3
  distinct contexts
- **MDX anatomy:** each stable component has a `.mdx` with anatomy diagram, API table, dos/don'ts,
  a11y notes. `<Anatomy>` is a Storybook-only utility.
- **Comments:** JSDoc required on exports; inline comments only for non-obvious constraints (the
  _why_, never the _what_)

**Impact:** ADR-0019 created

---

## [2026-06-08] — Session B: frontend stack validated (Phase 4.0.5)

**Context:** Conversational review of all frontend technical aspects before scaffolding `apps/web`
and `packages/web-ui`. All decisions are documented in ADR-0018.

**Key decisions and corrections:**

- **shadcn/ui + Base UI** (not Radix) — first-class since January 2026, by the Radix authors
- **PDFKit** (not @react-pdf/renderer) — cards are images, pixel/mm precision required
- **Zustand added** — shared UI state (sidebar, search, nav) crosses component boundaries
- **Lucide** (not Phosphor) — native shadcn/ui icon system, guaranteed visual consistency
- **Icon animations** — custom SVG components with Motion, not Lottie or Lordicon
- **TanStack Virtual + Table** — missed in initial stack, essential (long lists, collection view)
- **@dnd-kit** — drag & drop for deck builder (Phase 7)
- **tinykeys** — keyboard shortcuts with chord sequence support
- **Native Intl** for dates — date-fns only if proven necessary
- **i18n rule from Phase 4** — no hardcoded strings, `t('key')` everywhere from the start

**Impact:** ADR-0018 created

---

## [2026-06-08] — Session A: `packages/tokens` architecture validated (Phase 4.0.5)

**Context:** Before scaffolding `packages/tokens`, ran a conversational session to validate the
complete token system architecture, with visual preview in `apps/docs/design/token-preview.html`.

**Decisions:**

- **2-layer hierarchy:** primitives → semantic. Component tokens added on demand (rule of 3
  repetitions), never speculatively.
- **Dual output:** `web/tokens.css` (`@theme` Tailwind v4, CSS vars) + `native/index.ts` (flat JS
  objects for React Native). Style Dictionary deferred to Phase 14.
- **Accent revised:** `#f59e0b` (Tailwind orange) replaced by `#e8b84b` (warm gold). Two new tokens:
  `on-accent` (`#0f0e17` — text on amber button) and `accent-text` (`#8a6a0c` in light mode — dark
  enough to pass WCAG AA on light backgrounds).
- **WCAG AA contrast:** all critical pairs verified and documented in ADR-0017. `text-faint`
  accepted as decorative only (2.5:1 — never for essential content).
- **Motion:** Mode A (micro 50–200ms, ease-out) + Mode B (key moments 300–500ms, ease-spring).
  Explicit separation: immediate feedback vs expressive narration.
- **Fluid typography:** `clamp()` via Utopia confirmed — no fixed breakpoints for type scale. Values
  generated during Phase 4.1 scaffold. Fonts self-hosted, `font-display: optional`.
- **Storybook:** Design System section required — palette, typography, spacing, motion, shadows,
  z-index — always live and synchronized with the real tokens.

**Impact:** ADR-0017 created · ADR-0015 updated · token-preview.html created in `apps/docs/design/`

---

## [2026-05-30] — DESIGN.md as @importable domain quick-reference convention

**Context:** Before starting Phase 4 (frontend), Claude needs design context loaded in every session
without reading the full `identity.md`, `decisions.md`, and all 7 screen mocks. The `CLAUDE.md`
context-import mechanism (used for roadmap + project-state) can serve the same purpose for design.

**Decision:** `apps/docs/design/DESIGN.md` is the canonical quick-reference for the design system —
key token values, non-negotiable rules, search patterns, nav patterns, and links to full docs. It is
@imported in `CLAUDE.md` alongside roadmap and project-state. This establishes a pattern: any domain
complex enough to have its own package or doc folder should have a corresponding `DOMAIN.md`
quick-reference that can be @imported.

**Impact:** `apps/docs/design/DESIGN.md` (new), `CLAUDE.md` (new @import + Design Rules section).

---

## [2026-05-30] — Design Rules section in CLAUDE.md (non-negotiable)

**Context:** Architectural Rules in `CLAUDE.md` prevent code-level violations (e.g., Prisma in wrong
packages). Design decisions have the same risk: future sessions could inadvertently use hardcoded
hex values, `dark:` Tailwind variants, or coloured circles for mana symbols — all explicitly
rejected decisions.

**Decision:** Added a Design Rules section to `CLAUDE.md` at the same level as Architectural Rules
(5 rules, non-negotiable). Rules are flagged the same way: if a suggestion violates them, Claude
must call it out before proceeding.

**Impact:** `CLAUDE.md` (new Design Rules section). Pattern: when a domain has established
non-negotiable constraints, they belong in `CLAUDE.md`, not only in docs files that may not be read.

---

## [2026-05-30] — Global search scope: cards + decks + collection

**Context:** The original `card-search.md` spec treated the header search as card-only search with
autocomplete. During design mockup work, the question arose: should search also cover the user's
decks and collection entries?

**Decision:** The header search bar is a **global search** — it searches MTG cards, user decks, and
collection entries simultaneously. Results are grouped by type (CARTES / DECKS / COLLECTION) in the
autocomplete dropdown. Each page (deck list, collection) keeps a separate local filter for filtering
items on the current page — distinct from global search.

**Impact:** `apps/docs/specs/card-search.md` (updated: "Search Bar" → "Global Search", grouped
results mock added), `apps/docs/design/screens/card-search.md` (Popover mock reflects 3 groups),
`apps/docs/design/decisions.md` (decision logged).

---

## [2026-03-30] — lint-staged glob extended to include .md files

**Context:** CI was failing on `pnpm format:check` because three markdown files in
`apps/docs/context/` had formatting issues that were never caught locally. The lint-staged glob had
been restricted to `*.{ts,tsx,js,jsx}` to fix a YAML issue — but markdown was incorrectly dropped in
the same change. oxfmt supports markdown fine.

**Decision:** Extended lint-staged glob to `*.{ts,tsx,js,jsx,md}`. YAML/JSON remain excluded (oxfmt
doesn't support them). The earlier decision log entry was wrong about markdown.

**Impact:** Root `package.json` lint-staged config. CI will no longer fail on markdown formatting.

---

## [2026-03-30] — Supabase error codes live in packages/db, not packages/schema

**Context:** During auth implementation, the Supabase SDK error code `user_already_exists` was
initially placed in `packages/schema/src/errors/codes.ts` alongside public API error codes. The
`api-reviewer` flagged this as a layering violation.

**Decision:** Supabase SDK error codes go in `packages/db/src/supabase-error-codes.ts`. The
distinction: `packages/schema` is the public API contract shared with the frontend — codes there are
i18n keys the client will `switch` on. Supabase codes are internal infrastructure strings used only
server-side to map SDK errors to public codes. Mixing them would expose implementation details and
pollute the frontend contract.

**Impact:** `packages/db/src/supabase-error-codes.ts` (new), `packages/schema/src/errors/codes.ts`
(Supabase codes removed), `apps/api/src/modules/auth/auth-routes.ts` (imports from correct package).

---

## [2026-03-30] — FastifyPluginCallbackZod over AsyncZod for auth routes

**Context:** The auth routes plugin was initially written as `FastifyPluginAsyncZod`. Oxlint's
`no-floating-promises` rule flagged the top-level `async` function as a floating promise. An
`eslint-disable` comment was added, but Oxlint ignores ESLint-style disable comments.

**Decision:** Switched to `FastifyPluginCallbackZod` (synchronous callback + `done()`). The
`async/await` syntax inside individual route handlers is unaffected — only the plugin wrapper
changes. This satisfies Oxlint without suppression and is the correct pattern for plugins that have
no top-level `await` outside route registrations.

**Impact:** `apps/api/src/modules/auth/auth-routes.ts`. Pattern to follow for future route files
that trigger the same lint rule.

---

## [2026-03-19] — Fastify module augmentation in dedicated .d.ts file

**Context:** The auth plugin needed to augment `FastifyInstance` and `FastifyRequest` with
`authenticate` and `user`. Placing `declare module 'fastify'` directly in `auth.ts` mixed type
declarations with business logic, and oxlint's `consistent-type-definitions` rule was flagging the
required `interface` keyword.

**Decision:** Extracted all Fastify type augmentations to `apps/api/src/types/fastify.d.ts`. Added a
`*.d.ts` override in `.oxlintrc.json` to allow `interface` in declaration files. This is the
standard TypeScript pattern for module augmentation.

**Impact:** `apps/api/src/types/fastify.d.ts` (new), `apps/api/src/plugins/auth.ts` (cleaner),
`.oxlintrc.json` (new override).

---

## [2026-03-19] — AuthUser type re-exported from @decksmith/db

**Context:** `apps/api` needed the Supabase `User` type for `req.user` typing, but importing
directly from `@supabase/supabase-js` in `apps/api` would create a direct coupling between the API
layer and the auth infrastructure.

**Decision:** Re-exported `User as AuthUser` from `packages/db/src/index.ts`. `apps/api` imports
`AuthUser` from `@decksmith/db` only — it has no knowledge of `@supabase/supabase-js`. The name
`AuthUser` is intentionally provider-agnostic.

**Impact:** `packages/db/src/index.ts`, `apps/api/src/types/fastify.d.ts`.

---

## [2026-03-19] — lint-staged glob restricted to TS/JS files only

**Context:** oxfmt was failing on `pnpm-lock.yaml` during commits because the lint-staged glob
`*.{ts,tsx,js,jsx,json,md,mdx,yml,yaml}` matched YAML files, which oxfmt doesn't support.

**Decision:** Restricted lint-staged glob to `*.{ts,tsx,js,jsx}` only. oxfmt only formats
JavaScript/TypeScript — JSON, Markdown, and YAML files are not supported and should not be passed to
it.

**Impact:** Root `package.json` lint-staged config.

---

## [2026-03-17] — Added @supabase/supabase-js to packages/db

**Context:** Phase 2.2 auth requires a server-side Supabase client to verify JWTs and perform admin
auth operations.

**Decision:** `@supabase/supabase-js` added to the pnpm catalog and as a dependency of
`packages/db`. The client uses `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS — server-only) with
`persistSession: false` and `autoRefreshToken: false` (server is stateless, sessions are managed
per-request via cookies). Exported as `supabase` from `@decksmith/db`.

**Why packages/db and not apps/api:** `packages/db` owns all infrastructure data concerns (Prisma +
Supabase). `apps/worker` will also need this client later. Avoids duplication and keeps the swap
surface isolated to one package (ADR-0005).

---

## [2026-03-17] — Supabase direct connection deprecated, switched to Session Pooler

**Context:** The direct PostgreSQL connection (`db.<ref>.supabase.co:5432`) no longer resolves via
DNS for this Supabase project. Supabase migrated to a pooler infrastructure.

**Decision:** `DATABASE_URL` now points to the **Session Pooler**
(`aws-[region].pooler.supabase.com:5432`). The Session Pooler is compatible with Prisma (persistent
connections, unlike the Transaction Pooler on port 6543 which is incompatible with Prisma
transactions).

**Impact:** `.env` and `.env.example` updated. Any developer cloning the repo must use the Session
Pooler URL from the Supabase dashboard → Settings → Database.

---

## [2026-03-17] — `User.id` must not be auto-generated by Prisma

**Context:** The `User` Prisma model had `@default(uuid())` on its `id`. This default was added
during initial schema design, before Supabase Auth was integrated. At that point, users only existed
in the public `users` table — created directly via the seed script (faker + Prisma), without any
authentication layer.

**Problem:** With Supabase Auth, every user is first created in `auth.users` (Supabase's internal
table), which generates a UUID. The public `users` table is a profile table that **must reference
that same ID**. If Prisma generates its own UUID, the two tables will have different IDs and RLS
policies (`auth.uid() = user_id`) will never work.

**Decision:** Remove `@default(uuid())` from `User.id`. The `User` ID is always passed explicitly
from the Supabase Auth ID at profile creation time.

**Impact:** `packages/db/prisma/schema.prisma` — migration required. The seed script must be updated
to no longer generate arbitrary UUIDs for users.

---

## [2026-03-17] — Auth API-proxied, not Supabase direct from the frontend

**Context:** See ADR-0014. Significant decision documented in full as an ADR.

---

## [2026-03-16] — tsgolint alpha: disable `tsconfig-error` rule

**Context:** Oxlint type-aware linting via `oxlint-tsgolint` triggered a false positive on `baseUrl`
in all four app tsconfig files (`apps/api`, `apps/web`, `apps/worker`, `apps/mobile`). The error
message "Option 'baseUrl' has been removed" is a tsgolint alpha bug (tracked in
oxc-project/tsgolint#351).

**Decision:** Removed `baseUrl` from all four tsconfig files (TypeScript 5+ supports `paths` without
it). Also disabled the `tsconfig-error` rule override in `.oxlintrc.json` as a safety net.

**Impact:** `apps/*/tsconfig.json` — removed `baseUrl: "."` from `compilerOptions`. Typecheck still
passes.

---

## [2026-03-16] — Oxlint `unicorn/no-useless-undefined` disabled for test files

**Context:** The `mergeJsonField` test explicitly passes `undefined` to test that code path.
Oxlint's `unicorn/no-useless-undefined` rule flagged it as unnecessary, but in this context it is
intentional — we are testing a specific parameter value, not omitting it by accident.

**Decision:** Added an `.oxlintrc.json` override to disable `unicorn/no-useless-undefined` for
`*.test.ts` / `*.spec.ts` files.

**Impact:** `.oxlintrc.json` overrides section. Affects all future test files.

---

## [2026-03-16] — Oxlint runs at workspace root, not per-package

**Context:** The old ESLint setup used `turbo run lint` (per-package). Oxlint can run at the root
and lint the entire monorepo in one pass (~200ms), making the turbo approach unnecessary.

**Decision:** `pnpm lint` → `oxlint .` from workspace root. The turbo `lint` task remains in
`turbo.json` for per-package dev convenience (`pnpm --filter @decksmith/api lint`) but the root
command no longer goes through turbo.

**Impact:** `package.json` root scripts. CI `lint` job no longer needs Prisma generate.

---

## [2026-03-16] — vitest installed at workspace root + per-package (not catalog)

**Context:** Vitest is a devDependency needed by `packages/config` (for the shared base config) and
each package that has tests. Adding it to the pnpm catalog would be correct long-term, but since
only `apps/api` has tests today, installing directly avoids premature catalog entries.

**Decision:** Vitest pinned in root `devDependencies` and `apps/api` `devDependencies`. Will move to
catalog once 2+ packages use it.

---

## [2026-06-22] — `packages/tokens` split into thematic sub-files

**Context:** `tokens.css` reached ~350 lines with all token categories in a single file. Adding MTG
rarity tokens (new) made the growth trajectory clear — the file would keep growing with every new
token domain.

**Decision:** Split into `colors.css`, `mtg.css`, `typography.css`, `layout.css`, `motion.css`.
`tokens.css` becomes a master `@import` entry point — the only file consumers reference. Tailwind v4
merges multiple `@theme` blocks across imported files, so no consumer changes are needed.

**Impact:** `packages/tokens/src/web/`. Import path `@decksmith/tokens/web/tokens.css` unchanged.

---

## [2026-06-22] — MTG rarity tokens added to `packages/tokens`

**Context:** `RarityBadge` component (upcoming) needs canonical rarity colors. These are part of the
MTG visual vocabulary like WUBRG — fixed, not theme-adaptive.

**Decision:** Four rarity tokens + four foreground tokens in `mtg.css` under static `@theme`:
`rarity-common` (#b8b8b8), `rarity-uncommon` (#8fa9bf), `rarity-rare` (#c8a951), `rarity-mythic`
(#e05c1e). Common uses mid-gray rather than black — pure black is invisible in dark mode. All
foreground contrast ratios WCAG AA verified (common 8.7:1, uncommon 5.7:1, rare 8.75:1, mythic
5.9:1).

**Impact:** `packages/tokens/src/web/mtg.css`. Generates `bg-rarity-*` and `text-rarity-*-fg`
Tailwind utilities.

---

## [2026-07-18] — `tsx` at runtime for `apps/api` in Docker (deliberate, temporary)

**Context:** All workspace packages (`packages/db`, `schema`, `services`, `utils`, `domain`) export
their TypeScript source directly (`./src/index.ts`). There is no compilation pipeline for packages.
This creates a problem for Docker: a compiled `apps/api` would import workspace packages at runtime,
and Node.js cannot execute `.ts` files without a loader.

**Options considered:**

- Conditional exports (`development` / `default`) — divergence between dev and prod
- tsup bundle — requires a custom esbuild plugin to remap `.js` → `.ts` imports (NodeNext
  convention), which is a hack
- Full tsc pipeline per package + Turborepo watch — correct, but a dedicated session of work
- `tsx` at runtime — no compilation needed, esbuild-fast startup (~100ms), clean Docker setup

**Decision:** Use `tsx` as the Node.js runtime loader in the Docker image for `apps/api`.
Concretely: `tsx` moved to `dependencies` (not devDependencies), start script is
`node --import tsx/esm src/index.ts`. This is a deliberate, documented choice — not a shortcut to
forget.

**Planned migration:** Session dedicated to "build pipeline" — each package gets a
`tsconfig.build.json`, exports point to `dist/`, Turborepo watch recompiles on source change. Docker
then uses pure compiled JS. This session should happen before Phase 3 (Scryfall) to avoid the
pipeline work growing with more packages.

**Impact:** `apps/api/package.json`. No impact on dev, typecheck, or tests.

---

## [2026-06-22] — `radius-stamp` semantic token replaces `radius-sm` exception

**Context:** The old rule used Tailwind's built-in `rounded-sm` with a required inline comment for
MTG stamp elements (format badges, rarity chips). This was an undocumented exception that relied on
a raw value rather than expressing intent.

**Decision:** `--radius-stamp: 0.25rem` added as a fifth semantic radius role in `layout.css`. The
raw radius scale (`radius-sm` through `radius-full`) removed entirely — Tailwind's built-in scale
uses different values anyway (e.g. `rounded-md` = 0.375rem ≠ our former `radius-md` = 0.5rem),
making the scale a source of confusion.

**Impact:** `packages/tokens/src/web/layout.css`, `Radius.stories.tsx` updated.

**Impact:** `package.json`, `apps/api/package.json`, `packages/config/package.json`.
