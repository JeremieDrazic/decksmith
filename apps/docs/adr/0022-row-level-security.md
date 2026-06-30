# ADR-0022 — Row Level Security Strategy

**Status:** Accepted **Date:** 2026-06-30

## Context

Decksmith stores user-owned data in PostgreSQL via Supabase. The API authenticates requests with the
Supabase `service_role` key and accesses the database through Prisma (direct connection as
superuser). Both bypass Row Level Security by design.

Without RLS, the database itself provides no data isolation between users. Authorization is enforced
entirely at the application layer (`assertOwnership` preHandler on Fastify routes).

## Decision

Apply RLS policies to all user-owned tables as **defense-in-depth** — a second layer of protection
that operates independently of the application layer.

Policies are defined in `packages/db/sql/rls-policies.sql` and applied manually via the Supabase SQL
Editor or `psql`. Prisma does not manage RLS natively; the SQL file is version-controlled and
idempotent (safe to re-run).

## What RLS Protects Against

| Attack surface                                   | Protected by app layer | Protected by RLS          |
| ------------------------------------------------ | ---------------------- | ------------------------- |
| API routes missing `assertOwnership`             | ❌                     | ✅ (for PostgREST access) |
| Direct Supabase PostgREST access with a user JWT | ❌                     | ✅                        |
| Prisma queries via `service_role`                | ✅ (`assertOwnership`) | ❌ (bypassed by design)   |

RLS is enforced for the `authenticated` role (PostgREST). Our API uses `service_role`, which
bypasses RLS. This means:

- **RLS does not protect our API today.** `assertOwnership` is the authoritative guard.
- **RLS protects direct PostgREST access** — anyone with a valid user JWT making requests to
  `https://[project].supabase.co/rest/v1/` can only see their own rows.
- **RLS is the last resort** if an application-layer bug slips through in the future.

## Why service_role Bypasses RLS

`service_role` is intentionally a superuser-equivalent key. It bypasses RLS so that server-side code
can perform administrative operations (user registration, cross-user queries for admin features,
background jobs) without being filtered by user-scoped policies. This is the correct architecture:
trust is granted at the key level, and the application is responsible for enforcing scoping.

## Policy Convention

All policies follow the same pattern:

```sql
-- SELECT
USING (auth.uid()::text = <owner_column>)

-- UPDATE (both clauses required)
USING (auth.uid()::text = <owner_column>)
WITH CHECK (auth.uid()::text = <owner_column>)
```

`auth.uid()` returns `UUID`; our columns are `TEXT` (Prisma `String` without `@db.Uuid`), hence the
`::text` cast.

INSERT and DELETE are **not granted** to the `authenticated` role. All inserts go through the
service_role (e.g., user registration creates both `users` and `user_preferences` rows). Account
deletion is not yet implemented.

## Tables Covered

Policies are added incrementally — only for tables with implemented API routes.

| Table                                        | Status | Implemented in                        |
| -------------------------------------------- | ------ | ------------------------------------- |
| `users`                                      | ✅     | `rls-policies.sql`                    |
| `user_preferences`                           | ✅     | `rls-policies.sql`                    |
| `decks`, `deck_sections`, `deck_cards`       | ⬜     | When Phase 7 routes are implemented   |
| `collection_folders`, `collection_entries`   | ⬜     | When Phase 6 routes are implemented   |
| `tags`, `deck_tags`, `collection_entry_tags` | ⬜     | When Phase 6/7 routes are implemented |

## Future Evolution

When Prisma supports connection-level JWT passing (or if we introduce a PostgREST proxy layer), we
could migrate to using the `authenticated` role for all DB access. At that point, RLS would become
the primary authorization mechanism and `assertOwnership` could be simplified or removed.

## Consequences

- **Positive:** defense-in-depth; protects PostgREST access; audit-friendly; incrementally
  extensible as new tables are implemented.
- **Negative:** policies must be applied manually (not tracked by Prisma migrations); risk of drift
  between schema and policies if a table is renamed.
- **Mitigation:** the SQL file is idempotent and version-controlled; `rls-policies.sql` must be
  updated whenever a new user-owned module is added (tracked in this ADR's table above).
