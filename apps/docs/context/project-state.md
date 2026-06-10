# Project State

_Updated: 2026-06-11 (session 5)_

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
- [x] Tests: `pnpm test` → 3/3 passing (`apps/api`)
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

---

## What's NOT Working / Blockers

- `apps/worker`, `apps/mobile` are empty shells
- OAuth providers (Google, GitHub) not yet enabled in Supabase dashboard
- RLS policies not yet applied to user-owned tables
- DB seed is broken — `User.id` no longer has `@default(uuid())`, seed must be updated to create
  Supabase Auth users first before seeding profile rows
- Prisma client must be regenerated locally after `pnpm install`
  (`pnpm --filter @decksmith/db db:generate`)
- `routeTree.gen.ts` must be regenerated after adding/changing routes
  (`pnpm --filter @decksmith/web dev`, then Ctrl-C)
- `packages/web-ui` has design-system stories but no shadcn/ui components yet (Phase 4.5 next)
- `packages/query` does not yet have `useCardSearch` — blocked on Phase 3 (Scryfall)

---

## Open PRs

- PR #26 — `feat/storybook-scaffold` → `main` (Design System token pages + semantic shadows)

---

## Current Branch

- Branch: `feat/storybook-scaffold` (PR #26 open)

---

## Dependency Versions (as of 2026-06-09)

| Package                | Version  |
| ---------------------- | -------- |
| TypeScript             | 6.0.3    |
| Vitest                 | 4.1.8    |
| Oxlint                 | 1.69.0   |
| Oxfmt                  | 0.54.0   |
| Turbo                  | 2.9.16   |
| lint-staged            | 17.0.7   |
| oxlint-tsgolint        | 0.23.0   |
| @tanstack/react-start  | 1.168.25 |
| @tanstack/react-router | 1.170.15 |
| @tanstack/react-query  | 5.101.0  |
| react                  | 19.2.7   |
| vite                   | 8.0.16   |
| @tailwindcss/vite      | 4.3.0    |
| i18next                | 26.3.1   |
| react-i18next          | 17.0.8   |

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
- [ ] RLS policies for user-owned tables
- [ ] `test-writer` for auth routes

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
