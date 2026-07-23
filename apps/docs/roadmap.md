# Decksmith — Product Roadmap

Status: ✅ Done · 🔄 In progress · ⬜ Not started

---

## Phase 0: Infrastructure

- ✅ Monorepo scaffold (pnpm + Turborepo)
- ✅ CI pipeline (GitHub Actions — format, lint, typecheck, test)
- ✅ TypeScript strict mode
- ✅ Oxlint + Oxfmt (ADR-0013)
- ✅ Shared configs in `packages/config` (tsconfig, vitest)
- ✅ Prisma schema (16 models) in `packages/db`
- ✅ Zod schemas (all domains) in `packages/schema`
- ✅ Fastify server + Zod type provider in `apps/api`
- ✅ User CRUD routes (`/api/v1/users`)
- ✅ Database seed script with faker.js _(note: `units`/`sortOrder`/notification fields fixed in
  session 13; auth.users orphan issue remains — see project-state.md)_
- ✅ 24 ADRs + 10 feature specs
- ✅ Vitest infrastructure (shared config + sample test)
- ✅ `.env.example`
- ✅ `packages/services` scaffolded + tested: `auth-service`, `user-service`, `ServiceError`,
  exception mapper in `apps/api` error handler — routes = pure HTTP glue (session 18, ADR-0024); 35
  unit tests colocated (session 20)
- ✅ pnpm 11 migration: `allowBuilds` in `pnpm-workspace.yaml`, `CI=true` in pre-commit hook
  (session 18)

---

## Phase 1: Documentation & Context System

- ✅ Create `apps/docs/roadmap.md` (this file)
- ✅ Create `apps/docs/context/project-state.md`
- ✅ Create `apps/docs/context/decisions-log.md`
- ✅ Update `CLAUDE.md` with @import + learning contract + maintenance policy
- ✅ Create `apps/docs/skills-and-agents.md`
- ✅ Create `.claude/WORKFLOW.md`
- ✅ Create 5 skills: `session.start`, `session.end`, `roadmap.update`, `module.scaffold`,
  `spec.sync`
- ✅ Create 9 subagents: `api-reviewer`, `db-reviewer`, `domain-reviewer`, `frontend-reviewer`,
  `ui-reviewer`, `a11y-reviewer`, `test-writer`, `devops-reviewer`, `cto-advisor`
- ✅ Configure GitHub MCP

---

## Phase 2: Foundation

### 2.1 Environment & DB Connection

- ✅ Verify Supabase project + connection string _(recreated session 21 — original project deleted
  after free-tier pause)_
- ✅ Run `db:push` to sync Prisma schema to Supabase _(re-run 2026-07-18, new project)_
- ✅ First real local run verified end-to-end: `pnpm dev:api` + `pnpm dev:web` → register + login +
  dashboard in browser (session 21)
- ✅ Run seed script against live DB _(note: seed creates orphaned profiles — use register API
  instead for real auth testing)_

### 2.2 Auth (spec: `user-auth.md`)

- ⬜ Enable Supabase Auth + OAuth providers (Google, GitHub)
- ✅ Auth plugin in `apps/api` (JWT verification middleware)
- ✅ Auth routes: register, login, logout, refresh, forgot-password, reset-password, `GET /me`
  (session 17)
- ✅ Zod schemas for auth DTOs in `packages/schema/src/auth/`
- 🔄 RLS policies for user-owned tables _(written: `packages/db/sql/rls-policies.sql` + ADR-0022;
  not yet applied to Supabase — run `psql "$DATABASE_URL" -f packages/db/sql/rls-policies.sql`)_
- ✅ Auto-create `UserPreferences` on signup (nested Prisma write in register route)

### 2.3 Rate Limiting & CORS

- ✅ `@fastify/rate-limit` with strict limits on auth endpoints
- ✅ `@fastify/cors` configured for dev + prod origins

### 2.4 Docker & CI/CD (session 22)

- 🔄 `apps/web` production server: `nitro` plugin added, `node .output/server/index.mjs`
  _(session 22)_
- ✅ `apps/api` runs `node dist/index.js` (compiled — `tsx` runtime dropped)
- ✅ `Dockerfile` for `apps/api` (multi-stage) — 1.76GB → 380MB via Prisma 7 `prisma-client`
  generator + `pnpm deploy --no-optional`; boot + `/api/health` verified
- ⬜ `Dockerfile` for `apps/web` (multi-stage) — **blocked**: nitro v3-beta (bundled by TanStack
  Start) leaves `react` externalized and doesn't trace it into `.output`, so the "self-contained"
  `node .output/server/index.mjs` fails with `Cannot find module 'react'`. Not cleanly fixable
  downstream (`noExternals` inlines everything except react). Upstream: nitrojs/nitro#3905,
  TanStack/router#2180, #5476. Revisit when nitro v3 stabilizes OR decide the web hosting strategy
  (static SPA + nginx vs node server) as part of the VPS deployment design.
- ⬜ `docker-compose.yml` — local dev infra (Postgres + Redis only, apps run natively)
- ✅ `.dockerignore`
- ⬜ CI — GitHub Actions → build images → push GHCR
- ✅ Reverse proxy — **Traefik** adopted (ADR-0026 + `apps/docs/deployment/reverse-proxy.md`),
  replaces host-nginx + per-project Certbot. Deployed on the VPS: owns 80/443, label-driven routing,
  wildcard TLS via ACME DNS-01 (Let's Encrypt prod), dashboard behind IP-allowlist + basic auth. The
  pre-existing personal site was migrated behind it (real cert, verified). Traefik v3.7+ required
  (Docker Engine 29 dropped the API version older Traefik used)
- ⬜ Deploy Decksmith API behind Traefik — `deploy/compose.yml` pulling the GHCR image, labels
  `Host(app.<domain>) && PathPrefix(/api)` (same-origin with future web for cookie auth). Blocked on
  the GHCR image-build step above

### 2.5 Build pipeline (before Phase 3)

> Unblocks: proper compiled Docker images, faster cold starts, clean prod/dev parity.

- ✅ Each package (`utils`, `domain`, `schema`, `db`, `services`) gets `tsconfig.build.json` +
  `build` script + exports pointing to `dist/`
- ⬜ Turborepo watch pipeline: `pnpm dev:api` recompiles deps on source change _(not needed as-is:
  `pnpm dev:api` runs `tsx --conditions=source`, reading deps' TS source directly — no dist watch)_
- ✅ `apps/api` migrated to `node dist/index.js` (remove `tsx` runtime dependency)
- ✅ Docker images updated to use compiled output (`apps/api`)

---

## Phase 3: Scryfall Integration (spec: `card-search.md`)

### 3.1 packages/scryfall

- ⬜ Bulk data download client
- ⬜ Card normalization (Scryfall → `Card` + `CardPrint` Prisma models)
- ⬜ In-memory caching layer
- ⬜ Zod schemas for Scryfall API responses
- ⬜ Unit tests for normalization logic

### 3.2 Initial Data Sync (apps/worker)

- ⬜ BullMQ + Redis setup in `apps/worker`
- ⬜ `scryfall-sync` job + daily cron schedule
- ⬜ Incremental update handling

### 3.3 Card API

- ⬜ `GET /api/v1/cards/search` (full-text + filters: color, CMC, rarity, format)
- ⬜ `GET /api/v1/cards/:id` (card detail + prints)
- ⬜ Autocomplete endpoint (< 200ms)

---

## Phase 4: Web Frontend Foundation

### 4.0 Design System Documentation

- ✅ Visual identity defined (palette, typography, MTG touches)
- ✅ ASCII mocks for all screens (desktop + mobile)
- ✅ `apps/docs/design/` — README, identity, decisions, 7 screen files
- ✅ Search patterns documented (global popover, `/search` page, deck builder slide-over)
- ✅ ADR-0015: Design System Architecture

### 4.0.5 Fondations — sessions conversationnelles (avant implémentation)

- ✅ Session A — Architecture `packages/tokens` (hiérarchie, couleurs, typo, spacing, motion) →
  decisions-log + ADR-0017
- ✅ Session B — Revue des libs front (routing, data, forms, animation, state, i18n, icons…) →
  decisions-log + ADR-0018
- ✅ Session C — Définition "composant prêt à l'emploi" (checklist, structure `packages/web-ui`) →
  decisions-log + ADR-0019
- ✅ Session D — Stratégie de test globale (philosophie, outillage par couche, mocks, CI) →
  `test-strategy.md` + ADR-0006 updated

### 4.1 apps/web Setup

- ✅ ADR-0016: TanStack Start adoption (SSR/CSR hybrid, no backend code in apps/web)
- ✅ TanStack Start initialized (replaces plain Vite + TanStack Router)
- ✅ TanStack Query configured
- ✅ Tailwind + `packages/tokens` wired (shadcn/ui deferred to 4.5)
- ✅ Base routes: `/` (SSR), `/login`, `/register`, `/dashboard`

### 4.2 packages/api-client

- ✅ Typed fetch client wrapping all API endpoints
- ✅ Error handling with typed error codes from `packages/schema`
- ✅ `packages/test-utils` — MSW server lifecycle, `createQueryWrapper`, user + preferences
  factories

### 4.3 packages/query

- ✅ TanStack Query hooks: `useUser`, `useUserPreferences`
- ⬜ `useCardSearch` (deferred — depends on Phase 3 Scryfall integration)

### 4.4 Auth UI

- ✅ Login + Register pages (session 15)
- ✅ Forgot Password page (session 15)
- ✅ `useLogin`, `useRegister`, `useForgotPassword` mutation hooks in `packages/query` (session 15)
- ✅ `ApiClientProvider` wired in `apps/web/__root.tsx` (session 15)
- ✅ `@source` for `packages/web-ui` in `apps/web/globals.css` (session 15)
- ✅ Per-route document titles (`makePageHead()` helper in `lib/head/`) + adaptive SVG favicon
  (amber dark / violet light via `prefers-color-scheme`) (session 16)
- ✅ Cookie-based language persistence — SSR-safe, no FOUT; `createServerFn` loader reads cookie
  server-side, `parseLangFromCookieString` shared across server and client (session 16)
- ✅ `ThemeControl` component in `apps/web` — i18n label + `ThemeToggle` primitive (session 16)
- ✅ `LanguageControl` — cookie write on switch, `mounted` pattern removed (session 16)
- ✅ Auth page footer — `Trans` + Heart icon + GitHub/Docs/Storybook links, fully translated EN/FR
  (session 16)
- ✅ `::selection` accent coloring in `globals.css` — amber dark / violet light via CSS vars
  (session 16)
- ✅ Storybook stories for `apps/web` components (`ThemeControl`, `LanguageControl`) in
  `Components/App/` (session 16)
- ⬜ Email confirmation + password reset flow (reset-password page — blocked on OAuth/deep-link)
- ✅ Auth guard for protected routes — `_authenticated` pathless layout, `beforeLoad` `$getMe` SSR
  guard, dashboard moved under `_authenticated/`, `redirectTo` search param on `/login` (session 17)

### 4.5 packages/web-ui Foundation

- ✅ `apps/storybook` scaffold: Storybook 10 + `@storybook/addon-themes` + `withThemeByClassName`
- ✅ Design System token pages: Colors, Typography, Spacing, Radius, Shadows, Motion (PR #26)
- ✅ Semantic shadow tokens: `shadow-popover`, `shadow-card`, `shadow-overlay`, `shadow-accent`
- ✅ Button (4 variants, 3 sizes, isLoading, startIcon/endIcon, polish: shadow-accent, press effect)
- ✅ IconButton, ButtonGroup, Separator (`elaborate` prop `─◈─`)
- ✅ Toggle, ToggleGroup
- ✅ Input, Textarea
- ✅ InputGroup — composite input with inline/block addons, button, error state
- ✅ Field — FieldGroup, FieldLabel (Eyebrow style), FieldDescription, FieldError (TanStack Form)
- ✅ Storybook CI: `@storybook/test-runner` + `axe-playwright` — play functions + a11y on every
  story
- ✅ `packages/utils` scaffolded: `noop` function with colocated tests
- ✅ Surface — bare elevation primitive (`surface` / `raised` variants, configurable padding)
- ✅ Card, ButtonCard, LinkCard — semantic card family (static + interactive; a11y: focus ring,
  press state, keyboard nav)
- ✅ Badge, Tag — status badges + removable Tag with close button
- ✅ Select — dropdown picker (Base UI) with groups, multi-select, error state
- ✅ `packages/tokens` worldclass audit: dead TS layer deleted, `tokens.css` is the single source of
  truth, font fallbacks hardened, shadow scale comment corrected (ADR-0017 updated)
- ✅ Dialog, AlertDialog — Base UI modal + confirmation dialog (PR #36)
- ✅ Floating components: DropdownMenu, ContextMenu, Tooltip, Popover (PR #36)
- ✅ Form primitives: Checkbox, Radio, Switch (PR #36)
- ✅ Kbd, NavigationButton, DeleteButton + `useArmedState` hook (PR #36)
- ✅ Icon sizing centralized: `ICON_IN_CONTROL`, `ICON_INLINE` tables + ADR-0021 (PR #36)
- ✅ Toast, Drawer — Base UI components complete (PR #38)
- ✅ Design tokens from `packages/tokens` applied (semantic token classes across all components)
- ✅ `packages/domain` scaffolded: `MtgColor`, `ColorIdentity`, `SnowMana`, `VariableMana` types +
  `parseManaCost`, `sortColorIdentity`, `getColorIdentityName` — 30 unit tests (PR #32)
- ✅ MTG primitive components: `ManaIcon` (pure SVG), `HybridManaSymbol` (diagonal split pip via SVG
  clipPath), `ManaSymbol` (router), `ManaCost` (pip row from cost string), `ColorIdentity`
  (WUBRG-sorted pip row + `role="img"` aria-label) — Storybook stories under `Components/MTG/…` (PR
  #32)
- ✅ Skeleton — 4 shapes (`text` / `control` / `block` / `circle`), `motion-safe:animate-pulse`,
  `aria-hidden`, dimension from caller `className` (session 16)
- ✅ `useLocalStorage<T>` — SSR-safe hook, sync write (session 16)
- ✅ `ThemeProvider`, `useTheme` — initially localStorage-based (session 16); rewritten to
  cookie-based SSR pattern in session 17 — `theme-cookie.ts` (`THEME_COOKIE`, `DEFAULT_THEME`,
  `VALID_THEMES`, `parseThemeFromCookieString`), `initialTheme` prop, anti-FOUC inline script
  eliminated; `ThemeToggle` (Switch with Sun/Moon thumb icon, `--accent-icon` token) (session 16)
- ✅ `theme-cookie.ts` pure function + 6 colocated unit tests (session 17)
- ✅ `useMediaQuery(query)` — `useSyncExternalStore`, reactive, SSR-safe; `useBreakpoint()` semantic
  shortcut (`isMobile` / `isTablet` / `isDesktop`); `BREAKPOINTS` const (session 16)
- ✅ `useKeyboardShortcut(shortcuts, handler)` — wraps tinykeys, ref-stabilized callback, SSR-safe
  (session 16)
- ✅ `TextLink` — styled `<a>`, `default` / `subtle` variants, exports `textLinkVariants` for
  `AppLink` reuse; `AppLink` in `apps/web` wraps TanStack Router `Link` (session 16)
- ✅ `Text size="xs"` added to typography scale (session 16)
- ✅ `--accent-icon` token (`#5b4fcf` both modes) for static-violet icon tints (session 16)

---

## Phase 5: Internationalisation (i18n)

_Dependency: Phase 4.1 (apps/web initialized)_

- ✅ ADR-0025: i18n strategy — API sends codes, client translates (session 19)
- ✅ Replace hardcoded English strings in `packages/schema` Zod validators with error codes
  (`PASSWORD_TOO_SHORT`, `USERNAME_INVALID_FORMAT`, `HEX_COLOR_INVALID`, `SLUG_INVALID`, etc.)
  (session 19)
- ✅ `packages/i18n` scaffolded: shared translation package (auth/common/errors namespaces, EN +
  FR); `apps/web/src/locales/` deleted — all strings now in `packages/i18n`; multi-namespace init in
  `apps/web/src/i18n.ts`; `get-field-error` extended with optional `t` param for inline field
  translation (session 19)
- ✅ i18n library in `apps/web` (`react-i18next`) with locale files (EN + FR baseline) — done in
  session 14; cookie-based SSR persistence + `Trans` component added session 16
- ✅ `Accept-Language` NOT needed in `apps/api` — ADR-0025 decision: API is locale-agnostic,
  translation is a client concern
- ⬜ i18n in `apps/mobile` (Expo Localization)

---

## Phase 6: Collection Management (spec: `collection.md`)

### 6.1 Collection API

- ⬜ CRUD for collection entries + folders
- ⬜ Domain logic in `packages/domain`
- ⬜ Tags CRUD + attach/detach

### 6.2 Collection UI

- ⬜ Inventory page (grid/table/list views)
- ⬜ Add card flow (search → print → quantity/condition)
- ⬜ Saved views, folder nav, tag UI

---

## Phase 7: Deck Management (spec: `deck-management.md`)

### 7.1 Deck API

- ⬜ CRUD for decks + sections + cards
- ⬜ Format validation (singleton, color identity, banlists)
- ⬜ Collection coverage calculation
- ⬜ Deck statistics (mana curve, colors, avg CMC)
- ⬜ Public deck sharing

### 7.2 Deck UI

- ⬜ Deck list + creation flow
- ⬜ Deck builder (sections sidebar + card grid)
- ⬜ Format validation feedback, coverage indicator, stats panel
- ⬜ Public share page `/decks/:id` (no auth)

---

## Phase 8: Pricing (spec: `pricing.md`)

- ⬜ Extend Scryfall sync for prices (TCGplayer USD + Cardmarket EUR)
- ⬜ `GET /api/v1/collection/valuation`
- ⬜ `GET /api/v1/decks/:id/cost`
- ⬜ Pricing UI in collection view + deck builder

---

## Phase 9: PDF Generation (spec: `pdf-generation.md`)

### 9.1 packages/pdf

- ⬜ Deterministic PDF layout engine
- ⬜ Paper formats, grid config, margins, cut lines, DPI, double-sided
- ⬜ Unit tests for layout math

### 9.2 Worker Infrastructure

- ⬜ Redis (Docker for dev, Upstash for production)
- ⬜ BullMQ PDF job

### 9.3 PDF API + UI

- ⬜ `POST /api/v1/pdf` (enqueue) + GET status + GET download
- ⬜ Preview panel, config form, job status polling

---

## Phase 10: 3D Card Viewer (spec: `card-details.md`)

- ⬜ Three.js card component in `packages/web-ui`
- ⬜ Rotation, zoom, animated foil shader
- ⬜ Fallback for low-end devices

---

## Phase 11: Craft Guide (spec: `craft-guide.md`)

- ⬜ `CraftGuideArticle` seed data
- ⬜ `GET /api/v1/craft-guide` (list + single)
- ⬜ Article list + reader UI

---

## Phase 12: Recommendations

- ⬜ Recommendation engine in `packages/domain`
- ⬜ API routes + feedback endpoints
- ⬜ Recommendations panel in deck builder

---

## Phase 13: Documentation Site

- ✅ `apps/docs/` with VitePress (docs live here directly)
- ✅ GitHub Pages deployment via `.github/workflows/docs.yml`

---

## Phase 14: Mobile App (apps/mobile)

_Dependencies: Phase 6 + 7 stable on web_

### 14.0 Token strategy — conversation préalable

- ⬜ Rediscuter l'architecture de `packages/tokens` pour le mobile : migrer vers Style Dictionary
  (source unique → sorties CSS vars pour web + objets JS pour RN) ou valider que l'export dual
  manuel (`native/`) est suffisant. Décision prise en Session A (Phase 4.0.5) : export dual manuel
  pour l'instant, à réévaluer ici.

### 14.1 Setup

- ⬜ Initialize Expo + React Native in `apps/mobile`
- ⬜ Configure `packages/native-ui` (React Native components)
- ⬜ Auth: Supabase Auth for React Native (`expo-auth-session`)
- ⬜ Navigation: Expo Router
- ⬜ Shared: `packages/api-client`, `packages/schema`, `packages/domain` (reused as-is)

### 14.2 Core Features

- ⬜ Auth flow (login, register, session)
- ⬜ Card search (camera barcode scan → card lookup)
- ⬜ Collection management (add/view/edit entries)
- ⬜ Deck list + view (read-only, edit later)
- ⬜ PDF generation trigger + download

### 14.3 Mobile-Specific

- ⬜ Push notifications (Expo Notifications) for price alerts, PDF ready
- ⬜ Offline mode for collection browsing
- ⬜ Camera integration for card scanning

---

## Evergreen

- ⬜ Write unit tests as each module is implemented
- ⬜ Update ROADMAP per session (`/roadmap.update`)
- ⬜ Update `apps/docs/context/project-state.md` per session (`/session.end`)
- ⬜ Check dependency updates at session start (`/session.start`)
- ⬜ Create ADRs for new architectural decisions
