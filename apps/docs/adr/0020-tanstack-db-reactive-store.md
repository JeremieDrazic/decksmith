# ADR-0020: TanStack DB — Reactive Client Store

**Last Updated:** 2026-06-19 **Status:** Draft **Context:** Decksmith

---

## Context

As Decksmith moves toward Phase 6 (Collection Management) and Phase 7 (Deck Builder), two UI
patterns emerge that plain TanStack Query handles awkwardly:

**Derived views / aggregations.** The deck builder must show a mana curve (count of cards per CMC),
a color distribution, a format validation result, and a collection coverage percentage — all derived
from the same card list, re-derived on every add/remove. With plain TanStack Query these become
either separate queries with complex cache synchronization, or `useMemo` chains that recompute from
scratch on every render.

**Optimistic mutations on lists.** Adding a card to a deck or marking a collection entry should feel
instant. `onMutate`/rollback in TanStack Query handles this for singleton objects, but becomes
brittle when the optimistic state must propagate across multiple derived views simultaneously.

During a feasibility study (2026-06-19) TanStack DB was evaluated against the following constraints:

- **ADR-0016**: `apps/web` communicates with `apps/api` over HTTP only — never imports `packages/db`
  or any server-only package.
- **ADR-0018**: TanStack ecosystem coherence (Start, Query, Form, Table, Virtual already in use).
- **ADR-0019**: `packages/web-ui` component architecture; components must not contain business
  logic.
- **Learning context**: the primary learning goals for this project are backend and architecture,
  not additional frontend depth. Frontend investments must be justified.

Key feasibility finding: TanStack DB does **not** require ElectricSQL or direct database access. A
`queryCollection` is loaded via a TanStack Query `queryFn` — meaning `packages/api-client` serves as
the data source unchanged. ADR-0016 is fully preserved.

---

## Current Decision

**Adopt TanStack DB for Phase 6 and Phase 7. Defer adding the dependency until the start of Phase 6
(timeboxed spike, ~1 day).**

### Boundary rule (most important thing this ADR locks)

| Data shape                                                                                    | Solution                                     |
| --------------------------------------------------------------------------------------------- | -------------------------------------------- |
| Singletons / unique objects (user profile, user preferences)                                  | Plain TanStack Query (`packages/query`)      |
| Lists, collections, derived/aggregate views (cards, deck contents, collection entries, stats) | TanStack DB `queryCollection` + live queries |

This rule is explicit and teachable. It prevents the two systems from leaking into each other's
territory.

### What TanStack DB adds (and what it does not add)

TanStack DB extends TanStack Query — it does not replace it. Three new primitives:

- **Collections**: typed, normalized, client-side data stores loaded via `queryFn`
  (REST-compatible).
- **Live queries**: reactive, SQL-like query engine (joins, filters, `groupBy`, aggregates) powered
  by differential dataflow — incremental recomputation (~0.7 ms to update one row in a 100k-item
  collection on M1 Pro). The deck builder's mana curve is a `groupBy(cmc).count()` live query.
- **Optimistic mutations**: `onInsert`/`onUpdate`/`onDelete` handlers with automatic rollback;
  optimistic state is overlaid on synced data and propagates to all live queries instantly.

### Integration shape

```
queryCollection({
  queryKey: ['collection-entries'],
  queryFn: () => apiClient.collection.listEntries(),   // packages/api-client — ADR-0016 preserved
  onInsert: (tx) => apiClient.collection.addEntry(tx),
  onUpdate: (tx) => apiClient.collection.updateEntry(tx),
  onDelete: (tx) => apiClient.collection.removeEntry(tx),
})
```

Live queries tap the collection:

```ts
// Mana curve — free, incremental, no useMemo
const manaCurve = useLiveQuery((q) =>
  q.from({ cards: deckCardsCollection }).groupBy('cmc').select({ cmc: q.cmc, count: q.count() })
);
```

### When to revisit / install

- At the **start of Phase 6** (Collection Management): install `@tanstack/db` and
  `@tanstack/react-db`, run a ~1-day spike (one collection + one live query + one optimistic
  mutation against a mocked API endpoint). Write findings to this ADR.
- Re-evaluate if TanStack DB has **not** reached `≥ 1.0` by Phase 6 start — if still deeply in beta,
  defer a second time and document why.
- **Do not install** the dependency before Phase 6 starts.

### What we explicitly do NOT do

- Do not install `@tanstack/db` or `@tanstack/react-db` today.
- Do not migrate `useUser` or `useUserPreferences` — they are singletons; plain Query is correct.
- Do not create any collection before Phase 3 (Scryfall) and Phase 6 are started.
- Do not use TanStack DB for server state that is genuinely singleton (auth state, user profile,
  feature flags).

---

## Rationale

**Why TanStack DB and not more `useMemo` / manual cache synchronization?**

Derived views (mana curve, color distribution, coverage) recompute from the same underlying list.
With `useMemo` they recompute from scratch on every render cycle; with multiple `useQuery` hooks
they require coordinated invalidation. The differential dataflow engine in TanStack DB recomputes
only the affected rows — O(change) not O(collection). For a deck with 100 cards this is
imperceptible; for a collection with 10,000 entries it is the difference between a 0.7 ms update and
a 70 ms rerender freeze.

**Why not plain TanStack Query optimistic mutations?**

`onMutate`/`setQueryData`/`cancelQueries` works for singleton objects. For list mutations that must
propagate across multiple derived views simultaneously (add a card → update the list, the mana
curve, the color distribution, the format validation, the collection coverage all at once), the
manual cache surgery becomes error-prone and hard to test. TanStack DB's optimistic layer handles
this by design — mutations propagate to all live queries over the collection automatically.

**Why the boundary rule (singletons → Query, lists → DB)?**

Without an explicit rule, engineers will reach for whichever API they learned most recently. The
boundary is meaningful: singletons have one source of truth and no derived views; lists have
multiple consumers and aggregate projections. It is also aligned with the original TanStack DB
design intent.

**Why defer?**

- TanStack DB is pre-1.0 at decision time — API churn is expected. Deferring to Phase 6 gives time
  for the library to stabilize (likely ≥ 1.0 by then given the pace of the TanStack ecosystem).
- Collection and Deck Builder both depend on Phase 3 (Scryfall integration, not yet started). There
  is no write-heavy list UI to optimize today. Carrying a beta dependency with no active use
  competes with higher-priority learning goals (backend, auth, Scryfall sync).
- The spike at Phase 6 start validates the SSR/hydration wrinkle (collections are client-first;
  TanStack Start SSR must prime the initial load via a route loader, then hand off to the collection
  client-side). Better to discover that in a throwaway branch than mid-feature.

**Ecosystem coherence.** TanStack Query is already the data layer. TanStack DB extends it without
replacing it — the mental model delta is smaller than adopting an entirely different system (Zustand
for server data, Jotai, SWR, etc.). Devtools, query keys, and error handling patterns carry over
directly.

---

## Trade-offs

**Benefits:**

- Incremental derived views (mana curve, color breakdown, coverage) with ~0.7 ms update time.
- Optimistic mutations that propagate across all live queries automatically, with automatic
  rollback.
- `packages/api-client` used unchanged as `queryFn`/`mutationFn` — ADR-0016 fully preserved.
- Stays in the TanStack ecosystem — shared devtools, consistent API surface, coherent mental model.
- The boundary rule (singletons vs. collections) is explicit, teachable, and enforceable in review.

**Costs:**

- Second mental model alongside plain TanStack Query — engineers must know when to use which.
- Additional frontend depth that does not advance the stated backend/architecture learning goals.
- `packages/test-utils` must be extended to cover live queries and optimistic transactions in tests
  (MSW covers the HTTP layer; collection state assertions need a new pattern).
- Some boilerplate per collection (queryFn + three mutation handlers + collection definition).

**Risks:**

- **Beta API churn** — `@tanstack/db` is pre-1.0 at decision time; handler signatures or collection
  configuration may change before Phase 6. _Mitigation_: deferred until Phase 6; likely ≥ 1.0 by
  then. The spike validates the actual API before committing to it. If still unstable, defer a
  second time.
- **SSR / hydration wrinkle** — TanStack Start uses server-side rendering; TanStack DB collections
  are client-first. The initial page load must be primed by a route loader (standard `queryFn`),
  then the collection takes over client-side. Mishandled, this causes a hydration mismatch.
  _Mitigation_: explicitly validated during the Phase 6 spike before any production use.
- **Test patterns for live queries** — `useLiveQuery` is reactive and stateful; existing MSW +
  `createQueryWrapper` patterns cover the HTTP layer but not collection state transitions.
  _Mitigation_: defined during the spike; likely a `createCollectionWrapper` utility in
  `packages/test-utils` paralleling the existing `createQueryWrapper`.

---

## Evolution History

### 2026-06-19: Initial decision (adopt-but-defer)

- Feasibility study completed: docs reviewed (overview, live queries, reference), existing data
  layer reviewed (`packages/query`, `packages/api-client`, `context.tsx`).
- Key finding: `queryCollection` is REST-compatible — no ElectricSQL required. ADR-0016 is
  preserved.
- Decision: adopt for Phase 6 / Phase 7; defer dependency install to Phase 6 spike; boundary rule
  locked (singletons → Query, lists/derived views → DB).
- Status set to `Draft` (direction decided, implementation deferred — no code yet in use).

---

## References

- [ADR-0016: TanStack Start for apps/web](./0016-tanstack-start.md)
- [ADR-0018: Frontend Library Stack](./0018-frontend-library-stack.md)
- [ADR-0019: packages/web-ui Component Architecture](./0019-web-ui-component-architecture.md)
- [TanStack DB — Overview](https://tanstack.com/db/latest/docs/overview)
- [TanStack DB — Live Queries](https://tanstack.com/db/latest/docs/guides/live-queries)
- [TanStack DB — Reference](https://tanstack.com/db/latest/docs/reference/index)
