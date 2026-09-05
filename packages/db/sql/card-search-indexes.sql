-- =============================================================================
-- Card Search Indexes (full-text + trigram autocomplete)
-- =============================================================================
--
-- HOW TO APPLY
-- Applied automatically after every schema sync by the `db:push` script:
--   prisma db push && prisma db execute --file sql/card-search-indexes.sql
-- To run it on its own:
--   pnpm --filter @decksmith/db exec prisma db execute \
--     --file sql/card-search-indexes.sql --schema prisma/schema.prisma
--
-- WHY THIS FILE EXISTS (and isn't in schema.prisma)
-- Prisma can't express these objects: a GIN index over a `to_tsvector(...)`
-- EXPRESSION (full-text), and a trigram (`pg_trgm`) index. The array GIN indexes
-- it CAN express (colors / rarities / sets) live in schema.prisma.
--
-- `prisma db push` leaves these two alone: it doesn't introspect expression or
-- non-default-opclass indexes, so `migrate diff` reports no drift and won't drop
-- them (verified). The `db:push` script still replays this file after every push
-- so a fresh database / new environment gets the indexes, and because it's
-- idempotent (`IF NOT EXISTS`) re-running is free and safe.
--
-- NOTE FOR QUERIES: Postgres only uses the full-text index when the query
-- repeats the SAME expression. The card-search service must build its WHERE /
-- ORDER BY from exactly the weighted expression below.
-- =============================================================================

-- pg_trgm powers the trigram index used for substring autocomplete.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- -----------------------------------------------------------------------------
-- Full-text search: name + type line + oracle text
-- -----------------------------------------------------------------------------
-- Weighted so a name match (A) outranks a type match (B) outranks a rules-text
-- match (C) — searching "bolt" surfaces "Lightning Bolt" before cards that only
-- mention "bolt" in their text.
--
-- Expression index (no stored column): Postgres computes and stores the tsvector
-- inside the index itself. Passing 'english' as a literal keeps to_tsvector
-- IMMUTABLE, which an index expression requires.
CREATE INDEX IF NOT EXISTS cards_fts_idx ON cards USING gin (
  (
    setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(type_line, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(oracle_text, '')), 'C')
  )
);

-- -----------------------------------------------------------------------------
-- Autocomplete: case-insensitive substring match on name
-- -----------------------------------------------------------------------------
-- Trigram index on lower(name) so "bolt" matches "Lightning Bolt" (substring,
-- not just prefix) and small typos still hit. Supports lower(name) LIKE '%...%'.
CREATE INDEX IF NOT EXISTS cards_name_trgm_idx ON cards USING gin (lower(name) gin_trgm_ops);
