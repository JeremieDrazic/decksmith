# ADR-0032: Card Search Architecture

**Last Updated:** 2026-08-10  
**Status:** Active  
**Context:** Decksmith

---

## Context

Phase 3.3 introduces card search over the locally-synced Scryfall catalogue (~34,500 cards, ~400k
prints, refreshed once daily by the worker). Before writing any route we must settle three
architectural questions that shape the schema, the queries, and every future search feature:

1. **Scope** — the product wants a global "spotlight" search spanning cards, decks, collection,
   tags, keywords, rules and sets. Does that live behind one endpoint or several?
2. **The oracle/print mismatch** — search returns **one row per `Card`** (oracle identity), but
   three of the most-used filters (`rarity`, `finishes`/foil, release date) live on `CardPrint`,
   which has one row **per printing**. A card can be common in one set and rare in another. How do
   we filter an oracle-level result set by a print-level attribute without a slow or incoherent
   query?
3. **Indexing** — how full-text and prefix search are indexed in Postgres.

The data model already separates concerns cleanly (ADR-0029): `Card` holds oracle data, `CardPrint`
holds edition data, `CardFace` holds per-face oracle data — the last two both hang off `Card` by
`oracleId`. Card data is **public reference data** (no auth); decks and collection are **private,
user-owned** (auth + RLS). That security asymmetry is central to the scope decision.

This ADR covers the **data-model and boundary decisions**. The concrete index DDL (generated
`tsvector` column, `pg_trgm`, GIN) and the pagination strategy (offset vs keyset) are refined during
implementation and recorded in Evolution History as they land.

## Current Decision

**1. One search endpoint per resource; the global spotlight is a thin aggregator.**

Phase 3.3 ships **card search only**, under the versioned API:

- `GET /api/v1/cards/search` — full-text + filters, oracle-level results, paginated
- `GET /api/v1/cards/:oracleId` — card detail with all prints and faces
- `GET /api/v1/cards/:oracleId/prints` — all prints of a card (print-selection modal)
- `GET /api/v1/cards/autocomplete` — fast prefix search (< 200 ms)

Decks and collection get their **own** `search` endpoints when those features exist (Phases 6–7).
The **global spotlight** is a fan-out that queries the per-resource endpoints and merges results
client-side (or via a thin BFF endpoint later) — **never** a SQL `UNION` across public and private
data. Tags, keywords, rules and sets as spotlight sources are an acknowledged **future** target (see
"Global search — future scope").

**2. Targeted denormalization of low-cardinality print attributes onto `Card`.**

To keep card search a coherent **single-table** query, the worker denormalizes a small,
deliberately-bounded set of derived print attributes onto `Card` at sync time:

| New field              | Type        | Meaning                                                               |
| ---------------------- | ----------- | --------------------------------------------------------------------- |
| `Card.rarities`        | `String[]`  | Distinct rarities this card has been printed at                       |
| `Card.finishes`        | `String[]`  | Distinct finishes available across all prints (nonfoil, foil, etched) |
| `Card.firstReleasedAt` | `DateTime?` | Earliest print release date — for the "newest/oldest" sort            |

Plus two **display** fields added to `CardPrint` (not aggregates — real per-print data needed by the
print-selection modal and detail view):

| New field              | Type        | Meaning                                     |
| ---------------------- | ----------- | ------------------------------------------- |
| `CardPrint.releasedAt` | `DateTime?` | This printing's release date                |
| `CardPrint.setName`    | `String?`   | Human-readable set name (e.g. "Magic 2011") |

We **do not** denormalize `set` onto `Card` (`printedInSets[]`): filtering the oracle search by set
is a weak use case; "show all cards in set X" is naturally a _print/browse_ query and will be a
separate feature once a `Set` entity exists. We **do not** denormalize prices (volatile, per-print,
range-based — they stay on `CardPrint`).

**3. Full-text via a generated `tsvector` column + GIN; prefix autocomplete separately indexed.**

Card search filters resolve against `cards` alone: `tsvector` GIN for text; array overlap (GIN) for
`colors` / `colorIdentity` / `keywords` / `rarities` / `finishes`; B-tree for `cmc` ranges; an
expression index for `legalities`. Exact index DDL and the offset-vs-keyset pagination choice are
finalized in implementation (Evolution History).

## Rationale

- **Separation of concerns.** One endpoint per resource keeps public reference data (cards) and
  private user data (decks, collection) on separate boundaries with separate auth and caching
  profiles. A single mega-search would couple incompatible security models.
- **Explicit data contracts.** A dedicated `CardSearchQuerySchema` (Zod, in `packages/schema`) makes
  the filter/sort/pagination surface an explicit, validated contract rather than ad-hoc query
  parsing.
- **Clarity over cleverness.** The denormalization makes the _entire_ filter set homogeneous — every
  filter is a scalar/array test on one table, one index strategy, one query plan. The alternative
  (oracle scan + `EXISTS` subqueries against prints) creates two query regimes in one statement,
  harder to reason about and to rank. The decisive argument is **model coherence, not raw speed** —
  at this scale a join would also meet the < 500 ms target; we optimize for a search model that is
  uniform and predictable, not for a benchmark.
- **Deterministic behavior & maintainability.** The aggregates are **fully reconstructible**: the
  worker recomputes them per `oracleId` on every sync (idempotent), so a re-sync repairs any drift —
  there is no permanently-corruptible derived state. This is the key mitigation that makes
  denormalization safe here.

## Trade-offs

**Benefits:**

- Card search is a single-table scan on `cards`; all filters share one index model.
- Clean, versioned, per-resource endpoints with independent auth/caching.
- Print-level display data (`releasedAt`, `setName`) unblocks the print-selection UX and
  release-date sorting.
- Denormalization is bounded and justified — a defensible senior decision, not reflexive
  duplication.

**Costs:**

- The worker becomes the owner of three derived fields — a small, bounded extension of the existing
  per-`oracleId` grouping in the sync path.
- Two new `CardPrint` fields require a sync change to populate (`released_at`, `set_name` from
  Scryfall).
- Global spotlight (tags/keywords/rules/sets) is deferred, not delivered in 3.3.

**Risks:**

- **Aggregate drift** if the sync writes prints without recomputing the parent aggregate. Mitigated
  by idempotent per-`oracleId` recomputation on every sync — a full re-sync always reconciles.
- **Premature-optimization critique.** Defended by framing the decision as model coherence rather
  than performance; documented explicitly so the reasoning is auditable.
- Backfilling the new fields requires a one-off full re-sync after the schema migration (acceptable:
  the sync is idempotent and already run daily).

## Global search — future scope

The header spotlight is intended, eventually, to surface: **cards** (done here), **decks** and
**collection** (their own endpoints, Phases 6–7), **keywords** (`Card.keywords[]` surfaced as
concepts), **user tags** (`CardTag`, user-owned — distinct from Scryfall OracleTag/ArtTag, never to
be conflated), **sets** (requires a future `Set` entity), and **rules/rulings** (requires a new
Scryfall rulings sync flow). It will be implemented as a fan-out aggregator over per-resource
endpoints, never a cross-domain SQL union.

## Evolution History

### 2026-08-10: Initial decision

- Chose **per-resource search endpoints**; global spotlight = future fan-out aggregator. Phase 3.3
  scope = cards only (`/cards/search`, `/cards/:oracleId`, `/cards/:oracleId/prints`,
  `/cards/autocomplete`).
- Chose **targeted denormalization** of print attributes onto `Card` (`rarities[]`, `finishes[]`,
  `firstReleasedAt`) over normalized `EXISTS` joins — for single-table query coherence, with
  idempotent per-`oracleId` sync recomputation as the drift mitigation.
- Added `CardPrint.releasedAt` / `CardPrint.setName` for detail/print-selection display and
  release-date sorting.
- Deferred `set` denormalization (browse-by-set = future feature with a `Set` entity) and price
  denormalization (stays on `CardPrint`).
- Full-text via generated `tsvector` + GIN; exact index DDL and offset-vs-keyset pagination to be
  finalized in implementation.

## References

- [card-search.md](../specs/card-search.md) — feature spec (predates implementation; sync and
  multi-language sections are historical)
- [ADR-0029: Multi-face card modeling](0029-multi-face-card-modeling.md) — `Card` / `CardPrint` /
  `CardFace` split
- [ADR-0030: Worker database access](0030-worker-database-access.md) — worker writes reference
  tables via Prisma directly
- [ADR-0031: Job queue (BullMQ + Redis)](0031-job-queue-bullmq-redis.md) — the sync that will
  populate the new fields
- `packages/schema/src/card/` — existing DTOs (`CardResponseSchema`, `CardPrintResponseSchema`,
  `CardFaceSchema`, `CardImagesSchema`) to be reused; `CardSearchQuerySchema` to be added
- Follow-ups: #85 (`foil`→`finish` enum), #96 (bulk upsert perf), #105 (Scryfall-style search
  grammar)
