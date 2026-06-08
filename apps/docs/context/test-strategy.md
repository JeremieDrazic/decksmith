# Test Strategy

_Validated: Session D (Phase 4.0.5) — 2026-06-08_

---

## Philosophy

**Test what can go wrong in a costly way.** No coverage targets — a value criterion. A test has
value if it:

1. Catches a class of bugs that would be hard to spot in review or at runtime
2. Documents a non-obvious behaviour (edge case, business rule)
3. Enables fearless refactoring

A test without value is debt: it must be maintained when code changes, with nothing gained in
return. Per-package coverage thresholds are dropped in favour of this criterion.

**TDD on pure layers.** For `packages/domain` and `packages/utils`, the workflow is Red → Green →
Refactor: write the test first, implement to make it pass, clean up. The test becomes the spec. For
`apps/api` and `packages/web-ui`, the workflow is "test-close" — tests written in the same session
as the code, before the feature is considered done.

---

## Tooling Overview

| Tool                         | Role                                        | Layers                                               |
| ---------------------------- | ------------------------------------------- | ---------------------------------------------------- |
| Vitest                       | Unit + integration tests                    | All except E2E                                       |
| Storybook (`apps/storybook`) | Documentation + visual tests + interactions | `packages/web-ui`, `apps/web` components             |
| Testing Library              | Behaviour tests for complex components      | `packages/web-ui` (non-trivial interactions)         |
| MSW (Mock Service Worker)    | Network interception                        | `packages/api-client`, `packages/web-ui`, `apps/web` |
| Playwright                   | E2E on critical flows                       | `apps/web`                                           |
| Docker PostgreSQL            | Isolated test database                      | `apps/api`                                           |

---

## Strategy by Layer

### `packages/domain` + `packages/utils`

**Pattern: TDD, Vitest, zero mocks.**

Pure functions take arguments and return a result — no side effects, no external dependencies, no
reason to mock. This is the simplest layer to test and the most important: it is where business
rules live.

**TDD workflow:**

```ts
// Write first (Red)
it('rejects a Commander deck with more than 100 cards');
it("rejects a card outside the commander's color identity");
it('accepts a valid 100-card mono-black deck');

// Implement to Green, then Refactor
```

**Rule:** if you need to mock something to test a function in `packages/domain`, that is a signal
the function is not pure — extract the side effect.

**`packages/utils` vs `packages/domain`:** mental test — "could this function be used in a non-MTG
app?" Yes → `packages/utils`. No → `packages/domain`. Both layers are tested the same way.

---

### `packages/schema`

**Pattern: Vitest, `safeParse`, edge cases.**

Zod schemas are contracts. Test the invalid cases the schema must reject and the boundary conditions
— not what Zod already guarantees (a `z.string()` rejecting `42` is not worth testing).

```ts
it('rejects a password shorter than 8 characters');
it('rejects an invalid email format');
it('trims whitespace from display name');
it('accepts exactly the minimum length boundary');
```

---

### `apps/api`

**Pattern: Vitest + Fastify inject + real PostgreSQL Docker.**

Fastify supports in-memory injected requests — no real HTTP server, but a real Fastify instance with
all plugins. Combined with a real test PostgreSQL database, each test covers the full behaviour
end-to-end (route → plugin → Prisma → DB → DTO).

**Test DB setup in CI:**

```yaml
# .github/workflows/test.yml
services:
  postgres:
    image: postgres:16
    env:
      POSTGRES_PASSWORD: test
      POSTGRES_DB: decksmith_test
    ports:
      - 5432:5432
    options: >-
      --health-cmd pg_isready --health-interval 5s --health-timeout 5s --health-retries 5
```

Before running tests: `prisma db push --force-reset` against the test DB. The database starts clean
on every CI run.

**Test isolation:** `beforeEach` truncates the relevant tables. No transaction rollback for now —
simpler, sufficient.

**What is mocked in `apps/api`:** only Supabase Auth SDK HTTP calls (via `vi.mock` on specific
methods). Prisma is never mocked — we test against the real database.

**File structure:**

```
apps/api/src/
  modules/auth/
    auth-routes.ts
    auth-routes.test.ts      → unit tests (mappers, isolated logic)
  __tests__/
    auth.integration.test.ts → end-to-end with inject + DB
```

---

### `packages/web-ui` + `apps/storybook`

**Pattern: Storybook play functions + Testing Library for non-trivial behaviour.**

Storybook is the component development environment (stories-first). Play functions cover
interactions visible in Storybook. Testing Library completes the picture for behaviours that are not
visible: focus trapping, keyboard filtering, form validation.

**`apps/storybook` — separate app:**

```
apps/storybook/
  .storybook/
    main.ts     → stories: [
                    '../../packages/web-ui/src/**/*.stories.tsx',
                    '../../apps/web/src/components/**/*.stories.tsx'
                  ]
    preview.ts  → decorators: theme (dark/light), fonts
```

Stories remain **colocated** with their components (`Button.stories.tsx` next to `Button.tsx`).
`apps/storybook` is the aggregator — it knows where to find stories, not what they contain.

**`apps/web` components coupled to router or Zustand:** a Storybook decorator mocks the required
context. These mocks never ship in `apps/web`.

**MSW in Storybook:** for components that consume data, MSW intercepts at the network level via a
Storybook addon. The component makes a real fetch, TanStack Query handles it for real — only the
network response is controlled.

---

### `apps/web` (E2E)

**Pattern: Playwright, critical flows only, written when the feature is stable.**

E2E tests are the slowest and most fragile. They are not written during active feature development —
only when the flow is stable.

**Critical flows to cover:**

| Flow                                  | Phase     |
| ------------------------------------- | --------- |
| Register → email confirmation → login | Phase 4.4 |
| Create a deck, add cards, save        | Phase 7   |
| Generate a PDF, download              | Phase 9   |

**E2E runs on `main` only** — not on every PR (too slow, too brittle).

---

## Mocking Strategy

**Core rule: mock at system boundaries, never inside.**

A system boundary is the edge between your process and the outside world.

| What                                 | Why mock                        | How                                |
| ------------------------------------ | ------------------------------- | ---------------------------------- |
| Supabase Auth SDK (HTTP)             | Remote calls, non-deterministic | `vi.mock` on specific methods      |
| `Date.now()` / `crypto.randomUUID()` | Non-deterministic               | `vi.setSystemTime()`               |
| Email sending (Phase 5+)             | Irreversible side effect        | Stub that captures without sending |
| Network requests (frontend)          | Control responses               | MSW — intercepts at network level  |

| What                 | Why NOT mock                                | Alternative        |
| -------------------- | ------------------------------------------- | ------------------ |
| Prisma               | Mock ≠ real SQL behaviour                   | Real test database |
| `packages/domain`    | Pure functions — calling them costs nothing | Call directly      |
| `packages/schema`    | Zod schemas — parsing costs nothing         | Use directly       |
| TanStack Query hooks | Hides data flow bugs                        | MSW instead        |

**Prefer stubs over mocks.** A mock that asserts `expect(fn).toHaveBeenCalledWith(args)` breaks on
every internal refactor, even when observable behaviour is unchanged. Test behaviour, not
implementation.

**Test double vocabulary:**

- **Stub**: returns a fixed value, no call verification
- **Mock**: verifies calls (how many, with what args) — use sparingly
- **Spy**: wraps the real implementation to observe calls
- **Fake**: a working simplified implementation (e.g. in-memory DB)

---

## Test Data — Factories

Seeds (`packages/db/seed.ts`) are for development data, not tests. Tests use **factories** colocated
with the tests that use them.

```ts
// apps/api/src/__tests__/factories/deck.ts
export function buildDeck(overrides?: Partial<Deck>): Deck {
  return {
    id: crypto.randomUUID(),
    name: 'Test Deck',
    format: 'commander',
    userId: crypto.randomUUID(),
    createdAt: new Date(),
    ...overrides,
  };
}
```

Each factory creates a valid object with sensible defaults. Overrides allow testing specific cases
without repeating the full structure.

For integration tests that need data in the DB, factories create the TS object — an
`insertDeck(db, buildDeck())` helper inserts it and returns the created record.

---

## CI Structure

```
Every PR (target: < 3 min)
├── typecheck        → pnpm typecheck
├── lint             → oxlint (< 1s)
├── format:check     → oxfmt
├── unit tests       → packages/domain, packages/utils, packages/schema (Vitest, no DB)
├── api tests        → apps/api (Vitest + Fastify inject + PostgreSQL Docker service)
└── component tests  → packages/web-ui (Vitest + jsdom + MSW)

On main only
├── E2E              → Playwright (critical flows)
└── Storybook build  → verify the build does not break
```

**Why the split:** E2E tests take several minutes and are naturally more fragile (timing, async
state, network dependencies). Blocking every PR on them would slow merges without adding much signal
— `apps/api` integration tests already cover server behaviour. E2E is the last safety net, not the
first.

**Turborepo caching:** per-package tests are cached by Turborepo. If `packages/domain` has not
changed, its tests do not re-run. Only packages touched by a PR are retested.
