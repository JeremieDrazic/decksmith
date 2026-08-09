# ADR-0030 — Worker Database Access (Prisma Direct)

**Status:** Accepted **Date:** 2026-08-09

## Context

Phase 3.2 builds the first real job in `apps/worker` (until now an empty shell): `scryfall-sync`. It
composes the Phase 3.1 bricks — `getBulkDataInfo` → `fetchBulkStream` → `streamNormalizedCards` —
and must **persist** the resulting `Card` / `CardPrint` / `CardFace` rows: tens of thousands of
cards from Scryfall's `default_cards` bulk dump, ingested by streaming (never buffered whole).

Before writing persistence code, one architectural question must be settled: **how does the worker
write to the database?** Two options:

- **A — via the API:** the worker sends normalized cards to `apps/api` over HTTP; the API performs
  the writes. This mirrors the `apps/web` boundary (ADR-0016: web never touches `packages/db`,
  always goes through the API).
- **B — Prisma direct:** the worker imports `packages/db` and writes to Postgres itself.

The tension is with the standing rule **"Prisma models never exposed outside the API"** and ADR-0016
("never import `packages/db` in `apps/web`"). Does that rule bind the worker the same way it binds
the web app?

## Decision

**The worker accesses the database directly via `packages/db` (Prisma) — option B.**

The `scryfall-sync` job imports `packages/db`, normalizes cards with `packages/scryfall` (pure), and
performs the batch upsert itself. The worker never goes through `apps/api` to persist reference
data.

Two disciplines make this safe, and are non-negotiable for any worker code:

1. **The worker writes only reference tables** — `Card`, `CardPrint`, `CardFace` (and, later,
   sync-state / pricing reference tables). It never writes user-owned tables (`users`,
   `collections`, `decks`, …). Those remain the API's exclusive domain.
2. **The worker orchestrates, it does not implement business rules.** It composes pure bricks
   (`packages/scryfall` normalization) + Prisma writes. Any card domain logic lives in
   `packages/scryfall` or `packages/domain`, tested and pure — never inlined in the worker.

## Rationale

The rule "Prisma never exposed outside the API" bundles **two distinct concerns**, and neither
applies to the worker:

1. **Prisma is server-only** — it must never reach a _client_ bundle. This is the entire reason
   `apps/web` cannot import `packages/db`. The worker is a server-side backend process; there is no
   client bundle to protect.
2. **A stable DTO contract for external/HTTP consumers** — anyone talking to the API over HTTP
   receives DTOs, not Prisma models. The worker is not an external HTTP consumer; it is a **backend
   peer of the API, in the same trust domain**. `packages/db` is explicitly a _shared server-side_
   package (ADR structure lists it as such), not one reserved to `apps/api`.

The mental model: the API and the worker are two coworkers **inside the same secure office**, both
holding keys to the filing cabinet (the DB). `apps/web` is a customer at the front desk who must ask
through the window (HTTP + DTOs). The rule protects the cabinet _from the customer_, not from a
coworker standing next to it.

Routing the worker through the API would actively harm the design:

- **It destroys the streaming architecture.** Phase 3.1's whole point is to never buffer the dump —
  fetch → parse → normalize as a stream. Re-serializing ~30k normalized cards over HTTP to our own
  API throws that away, doubling memory and adding a pointless network hop.
- **It creates a phantom endpoint.** The API would need a bulk-ingest route called _only_ by the
  worker — leaking a worker concern into the HTTP surface for no external consumer.
- **Direct DB access is the canonical shape for ETL / batch ingestion** (`createMany`,
  transactions). This is exactly what a data-sync worker is _for_.

**On the "two writers" concern:** the anti-pattern to avoid is two services racing to write the
_same rows_. That is not this case. Writes are **partitioned by data domain**: the API owns user
data, the worker owns reference data (a global card catalogue, identical for every user, read-only
from the API's side — the `GET /cards` read path arrives in Phase 3.3). This "dedicated ingestion
pipeline feeding reference data, separate from the transactional API" is the standard, recommended
architecture for catalogue ingestion — not a smell.

## Trade-offs

**Benefits:**

- Preserves the streaming design end-to-end (Scryfall → Postgres, nothing buffered whole).
- No phantom bulk-ingest endpoint on the API.
- Uses the right tool for batch ETL (direct Prisma: `createMany`, transactions).
- Clean domain partition: API = user data, worker = reference data.

**Costs:**

- A second database write-point exists in the system. Accepted because writes are partitioned by
  disjoint table sets — no shared-row contention.

**Risks:**

- **Boundary erosion:** a future worker job could be tempted to write user tables, or to inline card
  business rules. Mitigated by the two disciplines above; enforce them in review (a
  `worker-reviewer` or the existing `db-reviewer` on any worker→DB change).
- **Schema-change coupling:** the worker now depends on the Prisma schema directly. Acceptable — so
  does the API; both are backend peers versioned in the same monorepo.

## Consequences / Follow-ups

- `apps/worker` gains a dependency on `packages/db` and `packages/scryfall`.
- The Prisma client must be generated before the worker runs (`packages/db` postinstall already does
  this monorepo-wide).
- Batch-upsert strategy (chunk size, upsert keys, transaction boundaries, idempotence, handling of
  cards that disappear from the dump) is a **separate design step** in Phase 3.2.
- BullMQ + Redis adoption and sync-state persistence (`SyncState`) are settled in their own
  decisions (BullMQ/Redis → ADR-0031).

## References

- ADR-0016 — TanStack Start adoption (`apps/web` never imports `packages/db`; the boundary this ADR
  contrasts against)
- ADR-0024 — Service-layer architecture (business rules live in `packages/services` / pure packages,
  not in orchestrators)
- ADR-0029 — Multi-face card modeling (`Card` / `CardPrint` / `CardFace` schema the worker writes)
- Phase 3.1 — `packages/scryfall` bulk download client (the bricks the worker composes)
