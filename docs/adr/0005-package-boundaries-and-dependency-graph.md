# ADR-0005: Package Boundaries and Dependency Graph

**Last Updated:** 2026-01-08 **Status:** Active **Context:** Decksmith

---

## Context

The monorepo structure (ADR-0002) allows code sharing, but **without clear boundaries**, packages
become tightly coupled and the architecture degrades into a monolith.

Critical architectural rules from CLAUDE.md:

- **Prisma models never exposed outside API**
- **All boundaries use DTOs from `packages/schema`**
- **Domain logic only in `packages/domain`**
- **`apps/*` orchestrate, don't implement business rules**
- **No circular dependencies**

This ADR defines the **dependency graph** and **enforcement strategy** to maintain these boundaries.

## Current Decision

We enforce **unidirectional dependency flow** with explicit package boundaries:

### Package Dependency Rules

**Core Contracts** (zero dependencies):

- **`packages/schema`**: Zod DTOs only. No dependencies (only Zod as peer dependency)
- **`packages/tokens`**: Design primitives (colors, spacing, fonts). No dependencies
- **`packages/config`**: Shared tooling configs. DevDependencies only

**Domain Logic** (depends on contracts):

- **`packages/domain`**: Pure functions. Depends **only** on `schema`
  - No I/O, no HTTP, no database, no React

**Infrastructure Packages** (depends on contracts):

- **`packages/db`**: Prisma schema and client. Depends **only** on `schema`
  - Prisma models are **never exported** outside this package
  - Only consumed by `apps/api` and `apps/worker`
- **`packages/scryfall`**: External API client. Depends **only** on `schema`
- **`packages/pdf`**: PDF generation. Depends on `domain` and `schema`
  - Used **only** by `apps/worker`

**Client Packages** (depends on contracts and clients):

- **`packages/api-client`**: Typed HTTP client. Depends on `schema`
- **`packages/query`**: TanStack Query hooks. Depends on `api-client` and `schema`

**UI Packages** (depends on design tokens):

- **`packages/web-ui`**: React components. Depends on `tokens`
- **`packages/native-ui`**: React Native components. Depends on `tokens`

### Application Dependency Rules

- **`apps/web`**: Web SPA
  - Can use: `schema`, `api-client`, `query`, `web-ui`, `tokens`
  - **Cannot use**: `db`, `domain`, `scryfall`, `pdf`, `native-ui`

- **`apps/mobile`**: Mobile app (future)
  - Can use: `schema`, `api-client`, `query`, `native-ui`, `tokens`
  - **Cannot use**: `db`, `domain`, `scryfall`, `pdf`, `web-ui`

- **`apps/api`**: HTTP API
  - Can use: `schema`, `domain`, `db`, `scryfall`
  - **Cannot use**: `query`, `api-client`, `pdf`, `*-ui`, `tokens`
  - **Critical**: Prisma models never leak outside this app

- **`apps/worker`**: Background jobs (PDF generation)
  - Can use: `schema`, `domain`, `pdf`, `scryfall`, `db`
  - **Cannot use**: `query`, `api-client`, `*-ui`, `tokens`

### Dependency Graph Visualization

```
Layer 1: Contracts (zero dependencies)
  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
  │   schema    │  │   tokens    │  │   config    │
  └──────┬──────┘  └──────┬──────┘  └─────────────┘
         │                │
         │                │
Layer 2: Domain & Infrastructure
         │                │
    ┌────┴────┬──────────┬┴─────────┬──────────┐
    │         │          │          │          │
┌───▼───┐ ┌──▼──┐  ┌────▼────┐ ┌───▼────┐ ┌──▼──────┐
│domain │ │ db  │  │scryfall │ │api-    │ │web-ui/  │
│       │ │     │  │         │ │client  │ │native-ui│
└───┬───┘ └─────┘  └─────────┘ └────┬───┘ └─────────┘
    │                               │
    │                               │
Layer 3: Derived Services
    │                               │
┌───▼───┐                       ┌───▼───┐
│  pdf  │                       │ query │
└───┬───┘                       └───┬───┘
    │                               │
    │                               │
Layer 4: Applications
    │                               │
    ├───────────────────────────────┼──────────┐
    │                               │          │
┌───▼───┐                       ┌───▼───┐ ┌───▼────┐
│ worker│                       │  web  │ │ mobile │
└───────┘                       └───────┘ └────────┘
    │
    │ (also uses db)
    │
┌───▼───┐
│  api  │
└───────┘
```

### Enforcement Strategy

**Immediate** (this PR):

- Use pnpm `workspace:*` protocol in all internal dependencies
- Document rules in this ADR (living document)

**Near-term** (future PR):

- Add `@manypkg/cli` to validate dependency graph
- Add custom script to check for circular dependencies

**Long-term** (as needed):

- ESLint plugin to enforce import rules (e.g., `@typescript-eslint/no-restricted-imports`)
- Automated PR checks for boundary violations

## Rationale

### Why These Boundaries

1. **`packages/schema` has zero dependencies**
   - DTOs are **contracts**, not implementations
   - Must be stable, minimal, focused
   - Both frontend and backend depend on it → it cannot depend on either

2. **`packages/domain` only depends on `schema`**
   - Pure domain logic (deck validation, print layout, card parsing)
   - No I/O → fully testable without mocks
   - Aligns with **"Deterministic behavior"** and **"Separation of concerns"**

3. **Prisma models never leave `packages/db`**
   - Prisma models contain DB-specific types (`Decimal`, `Json`, relations)
   - Exposing them couples consumers to Prisma implementation
   - Instead, `apps/api` converts Prisma models → `schema` DTOs at the boundary
   - Aligns with **"All boundaries use DTOs"**

4. **`apps/api` and `apps/worker` can use `db`, but `apps/web` cannot**
   - Frontend cannot directly access database (security, architecture)
   - `apps/web` uses `api-client` to talk to `apps/api`
   - Enforces client-server boundary

5. **`packages/pdf` only used by `apps/worker`**
   - PDF generation is CPU-intensive, belongs in background jobs
   - Not needed in `apps/web` (web calls worker via API)
   - Aligns with **"PDF generation only in worker"**

6. **UI packages (`web-ui`, `native-ui`) depend only on `tokens`**
   - UI components should not know about business logic
   - Only depend on design primitives (colors, spacing)
   - Makes components reusable and testable

### Why Unidirectional Flow

**Data flows one direction: contracts → domain → apps**

```
schema → domain → api → web
  ↓        ↓       ↓
  └───→ pdf  ───→ worker
```

**Benefits**:

- **No circular dependencies**: Impossible by design
- **Predictable changes**: Changing `schema` affects downstream, never upstream
- **Easy testing**: Pure packages (`schema`, `domain`) have no dependencies, easy to test
- **Clear mental model**: Dependencies always point toward apps, never back

This aligns with **"Minimal coupling"** and **"Clarity over cleverness"**.

## Trade-offs

**Benefits:**

- **Clear architecture**: Dependency graph makes system structure obvious
- **Prevents coupling**: Rules catch violations before they become tech debt
- **Easier refactoring**: Changes are localized by boundaries
- **Testability**: Pure packages (`domain`, `schema`) are trivial to test
- **Enforces architectural rules**: CLAUDE.md principles are checked, not just documented

**Costs:**

- **Requires discipline**: Developers must understand and respect boundaries
- **May feel restrictive**: "Why can't I just import this directly?"
- **Indirection overhead**: DTOs at boundaries add conversion code
- **Initial friction**: Setting up boundaries takes time upfront

**Risks:**

- **Workarounds**: Developers may bypass boundaries if rules feel too strict
  - **Mitigation**: Document **why** each rule exists in this ADR
- **Boundary erosion**: Over time, boundaries may weaken without enforcement
  - **Mitigation**: Add automated checks (`@manypkg/cli`, ESLint plugins)
- **Over-abstraction**: DTOs at every boundary can add boilerplate
  - **Mitigation**: Only use DTOs at **system boundaries** (API, DB), not internal package
    boundaries

## Evolution History

### 2026-01-08: Initial decision

- Defined dependency graph for all 11 packages and 4 apps
- Established unidirectional flow (contracts → domain → apps)
- Documented enforcement strategy (pnpm workspace protocol, future tooling)

## References

- [CLAUDE.md](../../CLAUDE.md) - Architectural rules (non-negotiable)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/) - Influence for
  domain/infrastructure separation
- [@manypkg/cli](https://github.com/Thinkmill/manypkg) - Monorepo validation tool
- Related ADR: ADR-0002 (Monorepo structure establishes workspace protocol)
