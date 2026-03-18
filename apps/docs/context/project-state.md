# Project State

_Updated: 2026-03-19_

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
- [x] Lint: `pnpm lint` → `oxlint .` (0 errors)
- [x] Format: `pnpm format:check` → oxfmt (0 errors)
- [x] Tests: `pnpm test` → 3/3 passing (`apps/api`)
- [x] Typecheck: `pnpm typecheck` → 0 errors
- [x] DB schema: synced to Supabase via Session Pooler (`db:push` ✅ 2026-03-17)
- [x] Supabase client: `supabase.auth.admin.listUsers()` responding from `packages/db`

---

## What's NOT Working / Blockers

- `apps/web`, `apps/worker`, `apps/mobile` are empty shells
- Auth not yet implemented (Phase 2.2 in progress — steps 4-6 remaining)
- DB seed is broken — `User.id` no longer has `@default(uuid())`, seed must be updated to create
  Supabase Auth users first before seeding profile rows

---

## Current Branch

- Branch: `main`
- In progress: Phase 2.2 — Auth

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

Steps remaining (in order):

- [ ] Step 6: Auth routes (register, login, logout, refresh, forgot-password, reset-password)
- [ ] Step 6: Auth module `apps/api/src/modules/auth/` (register, login, logout, refresh,
      forgot-password, reset-password)
- [ ] Step 7: Enable OAuth providers in Supabase dashboard (Google, GitHub)
- [ ] Step 8: RLS policies for user-owned tables
- [ ] Step 9: Auto-create `UserPreferences` on signup
- [ ] Step 10: `devops-reviewer` + `api-reviewer` + `test-writer`

---

## Open Decisions (not yet ADR'd)

- Profile completion state: what happens when a user has no `username`/`displayName` yet? A redirect
  to an onboarding screen is needed but not yet specced.
