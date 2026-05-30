# Project State

_Updated: 2026-05-30_

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
- [x] Typecheck: `pnpm typecheck` → 0 errors (verified on TypeScript 6.0.3)
- [x] DB schema: synced to Supabase via Session Pooler (`db:push` ✅ 2026-03-17)
- [x] Supabase client: `supabase.auth.admin.listUsers()` responding from `packages/db`
- [x] Design system docs: `apps/docs/design/` — identity, decisions, 7 screen mocks (PR #16 open)

---

## What's NOT Working / Blockers

- `apps/web`, `apps/worker`, `apps/mobile` are empty shells
- OAuth providers (Google, GitHub) not yet enabled in Supabase dashboard
- RLS policies not yet applied to user-owned tables
- DB seed is broken — `User.id` no longer has `@default(uuid())`, seed must be updated to create
  Supabase Auth users first before seeding profile rows
- Prisma client must be regenerated locally after `pnpm install`
  (`pnpm --filter @decksmith/db db:generate`)

---

## Open PRs

| PR  | Branch               | Description                         | Status |
| --- | -------------------- | ----------------------------------- | ------ |
| #16 | `docs/design-system` | Design system documentation         | Open   |
| #17 | `chore/update-deps`  | Dependency updates (TypeScript 6.0) | Open   |

---

## Current Branch

- Branch: `chore/update-deps`
- In progress: dependency updates + project-state sync

## Dependency Versions (as of 2026-05-30)

| Package         | Version |
| --------------- | ------- |
| TypeScript      | 6.0.3   |
| Vitest          | 4.1.7   |
| Oxlint          | 1.67.0  |
| Oxfmt           | 0.52.0  |
| Turbo           | 2.9.16  |
| lint-staged     | 17.0.6  |
| oxlint-tsgolint | 0.23.0  |

TypeScript 6.0.3 upgrade: no breaking changes observed — typecheck passes on all packages.

---

## Phase 2.2 Auth — Implementation Progress

Steps completed:

- [x] ADR-0014 created: API-proxied auth decision documented
- [x] Prisma schema: `User.id` no longer auto-generated, `username`/`displayName` nullable
- [x] Prisma schema: `CardTag` cascade fixed, 3 missing indexes added
- [x] `db:push` to Supabase ✅
- [x] `@supabase/supabase-js` added to `packages/db`, singleton client created + tested
- [x] Auth Zod DTOs in `packages/schema/src/auth/` — all endpoints covered
- [x] `UserResponseSchema.username` + `displayName` made nullable
- [x] `@fastify/cookie`, `@fastify/cors`, `@fastify/rate-limit` installed + configured in `apps/api`
- [x] Auth plugin `apps/api/src/plugins/auth.ts` — `fastify.authenticate` preHandler decorator
- [x] `src/types/fastify.d.ts` — Fastify module augmentation (`req.user`, `authenticate`)
- [x] `AuthUser` type re-exported from `@decksmith/db`
- [x] Auth routes: register, login, logout, refresh, forgot-password, reset-password
- [x] Auth mapper: `toRegisterResponse` (AuthUser → RegisterResponse DTO)
- [x] Pitfalls doc system: `apps/docs/context/pitfalls/` (fastify, supabase, typescript)
- [x] `api-reviewer` run on auth module — all issues resolved
- [x] `REGISTRATION_FAILED` + `PASSWORD_RESET_FAILED` added to `packages/schema/src/errors/codes.ts`
- [x] CI fix: oxfmt now runs on `.md` files in lint-staged
- [x] PR #14 merged to `main`

Steps remaining:

- [ ] Enable OAuth providers in Supabase dashboard (Google, GitHub)
- [ ] RLS policies for user-owned tables
- [ ] `test-writer` for auth routes

---

## Phase 4.0 Design System Documentation — Complete

- [x] Visual identity defined: palette, Outfit typography, WUBRG tokens, amber accent
- [x] `apps/docs/design/` created: README, identity.md, decisions.md
- [x] ASCII mocks for all 7 screens (desktop + mobile): auth, deck list, deck builder, collection,
      card search, card detail, settings
- [x] Search patterns documented: global popover, `/search` page, deck builder slide-over
- [x] PR #16 open against `main`
- [ ] ADR-0015: Design System Architecture

---

## Open Decisions (not yet ADR'd)

- Profile completion state: what happens when a user has no `username`/`displayName` yet? A redirect
  to an onboarding screen is needed but not yet specced.
- ADR-0015: Design System Architecture — covers tokens strategy, CSS custom properties, Tailwind
  preset, Keyrune for mana icons, no-Figma workflow.
