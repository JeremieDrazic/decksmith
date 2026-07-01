# Project State

_Updated: 2026-06-30 (session 13 — quality audit)_

---

## Environment

| Variable                    | Status                                                  |
| --------------------------- | ------------------------------------------------------- |
| `DATABASE_URL`              | ✅ Configured (Supabase Session Pooler — IPv4 fallback) |
| Supabase project            | ✅ Active (`amsnscsignhhcderjczy.supabase.co`)          |
| `SUPABASE_URL`              | ✅ Configured                                           |
| `SUPABASE_ANON_KEY`         | ✅ Configured                                           |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Configured                                           |
| `COOKIE_SECRET`             | ✅ Configured                                           |
| Redis                       | Not needed yet                                          |
| `.env.example`              | ✅ Updated (Session Pooler format + COOKIE_SECRET)      |

---

## What's Working

- [x] API server: `pnpm --filter @decksmith/api dev` → `localhost:3000`
- [x] User CRUD routes: `/api/v1/users` responding
- [x] Auth routes: `/api/v1/auth/` — all 6 routes implemented (merged in PR #14)
- [x] Lint: `pnpm lint` → `oxlint .` (0 errors)
- [x] Format: `pnpm format:check` → oxfmt (0 errors, markdown included)
- [x] Tests: `pnpm test` → ~132 passing (30 domain · 42 schema · 31 api · 15 api-client · 8 query ·
      3 utils · 3 json-merge)
- [x] Typecheck: `pnpm typecheck` → 0 errors (TypeScript 6.0.3)
- [x] DB schema: synced to Supabase via Session Pooler (`db:push` ✅ 2026-03-17)
- [x] Supabase client: `supabase.auth.admin.listUsers()` responding from `packages/db`
- [x] Design system docs: `apps/docs/design/` — identity, decisions, 7 screen mocks, DESIGN.md
- [x] ADR-0015: Design System Architecture documented
- [x] `CLAUDE.md`: `@apps/docs/design/DESIGN.md` imported + Design Rules section added
- [x] VitePress docs site: Design System section in sidebar and nav
- [x] ADR-0016: TanStack Start adoption decision documented (SSR/CSR hybrid, no backend in apps/web)
- [x] Phase 4.0.5 complete: Sessions A–D done → ADR-0017, ADR-0018, ADR-0019, test-strategy.md
- [x] Token system complete: all semantic tokens locked including status triplets + interactive
      states
- [x] `packages/tokens` scaffolded: primitives → semantic → web/tokens.css + native stub
- [x] `apps/web` scaffolded: TanStack Start v1, Tailwind v4, TanStack Query, react-i18next
- [x] Base routes: `/` (SSR), `/login`, `/register` (pathless `_auth/` layout), `/dashboard`
- [x] `apps/docs/context/pitfalls/frontend.md` created, referenced in `CLAUDE.md`
- [x] Oxlint rules hardened: `no-use-before-define`, React critical rules, jsx-a11y baseline
- [x] `*.gen.ts` excluded from both oxlint and oxfmt (generated files)
- [x] `apps/web` dev server confirmed working: `pnpm --filter @decksmith/web dev` → `localhost:5173`
- [x] `packages/api-client` scaffolded: `createFetcher`, `createAuthModule`, `createUsersModule`,
      `createApiClient` — 15 tests (MSW) — PR #23
- [x] `packages/test-utils` scaffolded: MSW server lifecycle, `createQueryWrapper`, `buildUser`,
      `buildUserPreferences` factories
- [x] `packages/query` scaffolded: `ApiClientProvider`, `useUser`, `useUserPreferences` — 8 tests —
      PR #23
- [x] `apps/storybook` scaffolded: Storybook 10, `@storybook/addon-themes`, `withThemeByClassName`
      decorator for runtime dark/light switching
- [x] Design System token pages: Colors, Typography, Spacing, Radius, Shadows, Motion — co-located
      in `packages/web-ui/src/design-system/` with auto-title from directory
- [x] Semantic shadow tokens locked: `shadow-popover`, `shadow-card`, `shadow-overlay`,
      `shadow-accent` — violet-tinted light mode, rim-light dark mode
- [x] Shadow tokens propagated to all skill components (Card, Dialog, Toast, Tooltip, ui_kits)
- [x] `InputGroup` — composite input: `InputGroupInput`, `InputGroupTextarea`, `InputGroupAddon`
      (inline + block), `InputGroupButton`, `InputGroupText`; focus ring + error state via
      `[&:has(...)]` Tailwind v4 pattern
- [x] `Field` — `FieldGroup`, `FieldLabel` (Eyebrow style: font-mono uppercase tracking-wide),
      `FieldDescription`, `FieldError` (TanStack Form: `(string | undefined)[]`, dedup via Set)
- [x] Button polish: `hover:shadow-accent` on primary,
      `active:translate-y-px active:duration-instant` press effect, destructive redesign (subtle →
      filled on hover), Separator `elaborate` prop
- [x] 3 new pitfalls documented in `apps/docs/context/pitfalls/frontend.md`: Tailwind v4 scanner
      new-file bug, `has-[...]` vs `[&:has(...)]`, SVG descendant combinator in Button children
- [x] Storybook CI: `@storybook/test-runner` + `axe-playwright` — build → serve → `test-storybook`
      in `.github/workflows/ci.yml`; `playwright` as direct devDep in `apps/storybook` (pnpm binary
      isolation); `test-runner.ts` injects axe + respects `parameters.a11y.disable` per story
- [x] ToggleGroup `aria-orientation` fixed: `role="toolbar"` override on `<ToggleGroupPrimitive>`
      (Base UI renders `role="group"` which doesn't allow `aria-orientation`)
- [x] `packages/utils` scaffolded: `noop` function (`function noop(): void { return; }`) — avoids
      `no-empty-function` + `no-useless-undefined` lint conflicts; colocated `noop.test.ts` with 3
      tests; used in `use-prefers-reduced-motion.ts` (renamed from camelCase for `filename-case`)
- [x] All axe CI violations resolved: 6 DS pages + Text/Tones disabled (intentional low contrast),
      Field/Disabled + InputGroup/Disabled disabled (WCAG 1.4.3 exemption), Button/Loading ghost got
      `loadingLabel`, Input/Error + Textarea/Error + InputGroup/ErrorState got `aria-label`
- [x] Surface — bare elevation primitive (`surface` / `raised` variants, configurable padding)
- [x] Card, ButtonCard, LinkCard — semantic card family (PR #30); hover: lift −2px, border-accent,
      accent glow, no bg shift; a11y: focus ring, press state, keyboard nav
- [x] Badge, Tag — status badges + removable Tag with close button (PR #30)
- [x] Select — Base UI dropdown picker: groups, multi-select, error state, align-item-with-trigger
      (PR #30)
- [x] `packages/tokens` worldclass audit (PR #30): dead TS layer (`primitives/`, `semantic/`,
      `native/`, `index.ts`) deleted — `tokens.css` is now the single source of truth; font
      fallbacks hardened; shadow scale comment corrected; ADR-0017 updated
- [x] pitfall doc: `text-text-faint` fails axe-core contrast on real DOM nodes (PR #31)
- [x] `packages/domain` scaffolded: `MtgColor`, `ColorIdentity`, `SnowMana`, `VariableMana` types;
      `parseManaCost`, `sortColorIdentity`, `getColorIdentityName` — 30 unit tests (PR #32)
- [x] MTG primitives in `packages/web-ui`: `ManaIcon` (pure SVG icon), `HybridManaSymbol`
      (self-contained hybrid pip, diagonal `∕` split via SVG clipPath triangles + `useId()` ID
      sanitization), `ManaSymbol` (router), `ManaCost` (pip row from cost string), `ColorIdentity`
      (WUBRG-sorted + `role="img"` + aria-label lore name) — Storybook stories `Components/MTG/…`
      (PR #32)
- [x] Floating components (PR #36): `Dialog`, `AlertDialog`, `DropdownMenu`, `ContextMenu`,
      `Tooltip`, `Popover` — all via `@base-ui/react`; Storybook stories + axe CI
- [x] Form primitives (PR #36): `Checkbox`, `Radio`, `Switch` — Base UI, Storybook stories + axe CI
- [x] `Kbd`, `KbdCmd`, `KbdOpt`, `KbdShift`, `KbdDel`, `KbdEnter` — keyboard shortcut badges (PR
      #36)
- [x] `NavigationButton` (close/back/forward semantic variants) + `DeleteButton` + `useArmedState`
      hook — armed delete pattern: first click arms, second click confirms, auto-resets on timeout
      (PR #36)
- [x] Icon sizing refactor (PR #36): three-table system — `ICON_IN_CONTROL` (icon fills square tap
      target), `ICON_INLINE` (icon beside text label), `ICON_SIZE` (self-rendered); ADR-0021; bug
      fixed: `IconToggle lg` showed 16px icon in 44px square; `toggleBaseClasses` flat size-4
      removed; pitfall documented (Tailwind v4 layer-order conflict)
- [x] Toast, Drawer — Base UI components complete (PR #38)

### Quality audit (session 13)

- [x] IDOR fix: `preHandler: app.authenticate` + `assertOwnership(req, params.id)` on all 4 user
      routes (GET/PATCH `/:id`, GET/PATCH `/:id/preferences`) — ADR-0022
- [x] `COOKIE_SECRET` length validation: config startup fails if secret < 64 chars
- [x] Auth plugin order fixed: `error` checked before `data.user` → `SESSION_EXPIRED` now reachable
      (previously dead branch)
- [x] `apps/api` test infrastructure: `test-utils/` with `mocks/db.ts`, `mocks/config.ts`,
      `factories/auth-user.ts`, `server.ts`, `inject.ts` — shared across all route tests
- [x] `apps/api` auth route tests: 16 integration tests (all 6 routes) via Fastify inject + mocked
      Supabase/Prisma
- [x] `apps/api` user route tests: 15 integration tests including IDOR protection cases (401
      unauthenticated, 403 wrong user) and correct ownership checks
- [x] `packages/schema` contract tests: 42 `safeParse` boundary tests — auth (10), user (13),
      primitives (19)
- [x] `DisplayNameSchema` trim bug fixed: `.min(1).max(50).trim()` → `.trim().min(1).max(50)` (was
      silently accepting whitespace-only strings)
- [x] CI `db:generate` step added to `test` job (`DATABASE_URL=postgresql://localhost:5432/dummy`) —
      prevents "Missing DATABASE_URL" failures when packages import Prisma client
- [x] `seed.ts` fixed: `units: 'in'` → `'inches'`, `sortOrder` → `sortDirection`, `email`/`push` →
      `emailOnPdfReady`; orphan-profile caveat documented in code comment
- [x] `test-strategy.md` reconciled with actual CI: current (mocked DB, single `test` job) vs
      aspirational (Docker PostgreSQL, split jobs) clearly distinguished
- [x] `data-model.md` spec drift annotated: `Tag.type`, Card FTS index, CardPrint `(language)` and
      `(oracle_id, language)` indexes marked ⚠️ Planned with target phase
- [x] `decisions-log.md` fully translated to English: Sessions A/B/C, Supabase pooler, `User.id`,
      Auth API-proxied entries

---

## What's NOT Working / Blockers

- `apps/worker`, `apps/mobile` are empty shells
- OAuth providers (Google, GitHub) not yet enabled in Supabase dashboard
- RLS policies written (`packages/db/sql/rls-policies.sql`, ADR-0022) but **not yet applied** — run
  via Supabase SQL Editor or `psql "$DATABASE_URL" -f packages/db/sql/rls-policies.sql`
- Prisma client must be regenerated locally after `pnpm install`
  (`pnpm --filter @decksmith/db db:generate`)
- `routeTree.gen.ts` must be regenerated after adding/changing routes
  (`pnpm --filter @decksmith/web dev`, then Ctrl-C)
- `packages/query` does not yet have `useCardSearch` — blocked on Phase 3 (Scryfall)
- `apps/api` tests use mocked Prisma/Supabase (not real DB) — pending Docker PostgreSQL service in
  CI (see `test-strategy.md` aspirational CI section)
- DB seed creates orphaned `User` profiles with no matching `auth.users` row — seed is usable for DB
  exploration but auth routes won't work for seeded users. Full fix requires creating Supabase auth
  users via `supabase.auth.admin.createUser()` before seeding profile rows.

---

## Open PRs

_None_

---

## Current Branch

- Branch: `feat/floating-components-clean` (session 13 quality audit — not yet merged)

> Dependency versions are in the individual `package.json` files. The version table was removed from
> this file (it was always stale and duplicated package.json).

---

## Phase 2.2 Auth — Implementation Progress

Steps completed:

- [x] ADR-0014 created: API-proxied auth decision documented
- [x] Prisma schema: `User.id` no longer auto-generated, `username`/`displayName` nullable
- [x] Prisma schema: `CardTag` cascade fixed, 3 missing indexes added
- [x] `db:push` to Supabase ✅
- [x] `@supabase/supabase-js` added to `packages/db`, singleton client created + tested
- [x] Auth Zod DTOs in `packages/schema/src/auth/` — all endpoints covered
- [x] `@fastify/cookie`, `@fastify/cors`, `@fastify/rate-limit` installed + configured in `apps/api`
- [x] Auth plugin `apps/api/src/plugins/auth.ts` — `fastify.authenticate` preHandler decorator
- [x] Auth routes: register, login, logout, refresh, forgot-password, reset-password
- [x] Auth mapper: `toRegisterResponse` (AuthUser → RegisterResponse DTO)
- [x] Pitfalls doc system: `apps/docs/context/pitfalls/` (fastify, supabase, typescript, frontend)
- [x] PR #14 merged to `main`

Steps remaining:

- [ ] Enable OAuth providers in Supabase dashboard (Google, GitHub)
- [ ] Apply RLS policies (`psql "$DATABASE_URL" -f packages/db/sql/rls-policies.sql`)
- [x] Integration tests for auth + user routes (done in session 13)

---

## Phase 4.1 apps/web — Complete

- [x] TanStack Start v1 (`@tanstack/react-start` 1.168.25) initialized with `vite.config.ts`
- [x] Tailwind v4 wired via `@tailwindcss/vite` + `@import` in `globals.css`
- [x] `packages/tokens` wired: `globals.css` imports `@decksmith/tokens/web/tokens.css`
- [x] TanStack Query configured: singleton `QueryClient` in `__root.tsx`, `staleTime: 30_000`
- [x] react-i18next configured: `src/i18n.ts` + `src/locales/en.json`
- [x] Base routes: `/` (SSR), `/_auth/login` → `/login`, `/_auth/register` → `/register`,
      `/dashboard/`
- [x] Pathless layout `_auth.tsx` for shared auth page wrapper
- [x] `routeTree.gen.ts` generated (TanStack Router codegen)
- [x] `src/declarations.d.ts` for CSS module imports
- [x] `ScrollRestoration` deprecated component replaced by `scrollRestoration: true` router option

---

## Phase 4.0.5 Sessions — Complete

- [x] Session A: `packages/tokens` architecture locked → ADR-0017
- [x] Session B: frontend library stack validated → ADR-0018
- [x] Session C: `packages/web-ui` component architecture + definition of done → ADR-0019
- [x] Session D: global testing strategy → `apps/docs/context/test-strategy.md` + ADR-0006 updated

---

## Phase 4.2 packages/api-client — Complete

- [x] `createFetcher(baseUrl)` — internal partial application, `credentials: 'include'` on every
      request
- [x] `ApiError` class + `isApiError` guard + `ErrorCode` union in `errors/errors.ts`
- [x] `ErrorCode` derived via `import type { X }` + `typeof X` (no string duplication from
      `packages/schema`)
- [x] `createAuthModule(fetcher)` — 6 methods (register, login, logout, refresh, forgotPassword,
      resetPassword)
- [x] `createUsersModule(fetcher)` — 4 methods (getUser, updateUser, getUserPreferences,
      updateUserPreferences)
- [x] `createApiClient(baseUrl)` factory + `ApiClient` inferred type in `index.ts`
- [x] Two exports only: `"."` and `"./errors"` — fetcher + modules are internal
- [x] 15 tests with MSW (happy path + error + network failure per module)

## packages/test-utils — Complete (new package)

- [x] MSW `setupServer()` + Vitest lifecycle (`beforeAll`, `afterEach`, `afterAll`) in `server.ts`
- [x] `createQueryWrapper()` — fresh `QueryClient({ retry: false })` per test suite
- [x] `buildUser(overrides?)` factory
- [x] `buildUserPreferences(overrides?)` factory
- [x] Three exports: `"./server"`, `"./query-wrapper"`, `"./factories/user"`,
      `"./factories/preferences"`

## Phase 4.3 packages/query — Complete

- [x] `ApiClientProvider` + `useApiClient` React Context in `context/context.tsx`
- [x] `useUser(id)` — TanStack Query hook, `enabled: !!id`, `errorCode` on return
- [x] `useUserPreferences(id)` — same pattern, key nested under `['user', id, 'preferences']`
- [x] 8 tests (2 context + 3 per hook) with MSW + `createQueryWrapper` + `ApiClientProvider`

---

## Open Decisions (not yet ADR'd)

- Profile completion state: what happens when a user has no `username`/`displayName` yet? A redirect
  to an onboarding screen is needed but not yet specced.
