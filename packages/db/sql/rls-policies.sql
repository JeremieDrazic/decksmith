-- =============================================================================
-- Row Level Security (RLS) Policies
-- =============================================================================
--
-- HOW TO APPLY
-- Run this file once via the Supabase SQL Editor or psql:
--   psql "$DATABASE_URL" -f packages/db/sql/rls-policies.sql
--
-- This file is idempotent (IF NOT EXISTS + OR REPLACE) — safe to re-run.
--
-- IMPORTANT: These policies are enforced for the `authenticated` role (PostgREST
-- direct access). Our API uses the service_role key which bypasses RLS by design.
-- RLS here acts as defense-in-depth: it protects direct PostgREST access and any
-- future code paths that might use the authenticated role instead of service_role.
-- See ADR-0022 for the full rationale.
--
-- auth.uid() returns UUID, but our `id` and `user_id` columns are TEXT
-- (Prisma String without @db.Uuid). We cast with ::text for the comparison.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- users
-- -----------------------------------------------------------------------------

ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;

-- SELECT: a user can only read their own row.
CREATE POLICY IF NOT EXISTS "users_select_own" ON "users"
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id);

-- UPDATE: a user can only update their own row.
-- USING filters which rows can be targeted; WITH CHECK validates the new values.
-- Both are required for UPDATE to prevent a user from updating their own id.
CREATE POLICY IF NOT EXISTS "users_update_own" ON "users"
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id)
  WITH CHECK (auth.uid()::text = id);

-- INSERT and DELETE are not granted to the authenticated role.
-- INSERT is handled exclusively by the service_role during registration.
-- DELETE is not exposed in the API (account deletion flow TBD).

-- -----------------------------------------------------------------------------
-- user_preferences
-- -----------------------------------------------------------------------------

ALTER TABLE "user_preferences" ENABLE ROW LEVEL SECURITY;

-- SELECT: a user can only read their own preferences row.
CREATE POLICY IF NOT EXISTS "user_preferences_select_own" ON "user_preferences"
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id);

-- UPDATE: a user can only update their own preferences row.
CREATE POLICY IF NOT EXISTS "user_preferences_update_own" ON "user_preferences"
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- INSERT is handled exclusively by the service_role (nested write during registration).
