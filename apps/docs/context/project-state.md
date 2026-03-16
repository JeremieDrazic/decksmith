# Project State

_Updated: 2026-03-16_

---

## Environment

| Variable         | Status                                         |
| ---------------- | ---------------------------------------------- |
| `DATABASE_URL`   | ✅ Configured (Supabase)                       |
| Supabase project | ✅ Active (`amsnscsignhhcderjczy.supabase.co`) |
| Redis            | Not needed yet                                 |
| `.env.example`   | ✅ Exists                                      |

---

## What's Working

- [x] API server: `pnpm --filter @decksmith/api dev` → `localhost:3000`
- [x] User CRUD routes: `/api/v1/users` responding
- [x] Lint: `pnpm lint` → `oxlint .` (0 errors)
- [x] Format: `pnpm format:check` → oxfmt (0 errors)
- [x] Tests: `pnpm test` → 3/3 passing (`apps/api`)
- [x] Typecheck: `pnpm typecheck` → 0 errors
- [x] DB schema: synced to Supabase (`db:push` — already in sync)
- [x] DB seed: run against live DB (2 users seeded)

---

## What's NOT Working / Blockers

- `apps/web`, `apps/worker`, `apps/mobile` are empty shells
- Auth not yet implemented (Phase 2.2 next)

---

## Current Branch

- Branch: `chore/db-seed`
- In progress: Phase 2.2 — Auth

---

## Open Decisions (not yet ADR'd)

_none_
