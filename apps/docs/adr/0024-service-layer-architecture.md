# ADR-0024: Service Layer Architecture

**Last Updated:** 2026-07-14 **Status:** Active **Context:** Decksmith

---

## Context

Fastify route handlers currently call Prisma and Supabase directly. For simple reads this works, but
multi-step use cases already exist (`POST /register` calls `supabase.auth.signUp` then
`prisma.user.create` with nested preferences) and more are coming: Phase 3 (Scryfall sync), Phase 6
(collection management), Phase 9 (PDF generation).

Without a defined service layer, business logic accumulates in HTTP handlers. This creates three
concrete problems:

1. **Untestable orchestration** — testing `POST /register` requires a full Fastify server; the
   "create profile + preferences atomically" logic cannot be tested in isolation.
2. **Inconsistent discoverability** — logic is split between routes (simple cases) and some future
   abstraction (complex cases). A new contributor does not know where to look.
3. **Unreusable logic** — `apps/worker` (PDF generation, Scryfall sync) will need to read and write
   the same domain data as `apps/api`. Without a shared service layer, orchestration logic would be
   duplicated across apps.

## Current Decision

### 1. Layer responsibilities

**Route handlers are pure HTTP glue.** Their only responsibilities are:

- Parsing and validating the HTTP request (enforced by Zod + Fastify type provider)
- Calling the relevant service function
- Converting business errors to HTTP errors via `createHttpError`
- Mapping the service result to a DTO via mapper functions
- Setting cookies, status codes, and sending the response

Route handlers contain no business logic, no Prisma calls, no Supabase calls.

**Services own all orchestration.** A service function:

- Executes one use case end-to-end
- Calls Prisma and/or Supabase and/or external APIs in the correct order
- Throws typed business errors (not `HttpError`) when the use case cannot complete
- Returns a plain domain value (not a DTO, not a raw Prisma model)

`packages/domain` is unchanged: pure functions, zero infrastructure, no Prisma, no Supabase.

### 2. The rule

> All orchestration lives in `packages/services`. Routes do HTTP only.

No exceptions based on complexity or number of infrastructure calls. A service function that wraps a
single `prisma.findUnique` is valid — it will absorb future growth (RLS checks, caching, conditional
includes) without requiring a structural change at that point.

### 3. Package location

Services live in `packages/services` — a new server-only package in the monorepo.

Rationale for a shared package over app-local folders:

- Phase 9 (PDF generation) requires the worker to read full deck and collection data from Prisma.
  The API serves the same data. A shared package avoids duplication across `apps/api` and
  `apps/worker`.
- Declaring the boundary now (empty package, clear import rules) costs nearly nothing. Extracting
  services from `apps/api` to a shared package after the fact requires touching every import across
  both apps — real friction at a busy phase of development.
- The precedent already exists: `packages/domain` was created before it had content specifically to
  declare the architectural boundary.

`packages/services` depends on `packages/db` and `packages/domain`. It is server-only — it must
never be imported by `apps/web` or `packages/web-ui`.

### 4. Prisma dependency

Services import the Prisma singleton directly from `@decksmith/db`:

```ts
import { prisma } from '@decksmith/db';

export async function registerUser(input: RegisterInput): Promise<AuthUser> {
  const { data, error } = await supabase.auth.signUp({ ... });
  // ...
  await prisma.user.create({ ... });
}
```

Dependency injection (passing `prisma` as a constructor argument) was considered and rejected. The
existing test infrastructure already mocks `@decksmith/db` at module level via Vitest. Switching to
DI would require rewriting all existing tests for no concrete gain on a single-server deployment.

### 5. No repository pattern

Repository classes are not used. The pattern is appropriate when the data store may be replaced or
when tests require injecting a fake store. Neither applies here — Supabase Postgres is an ADR'd
infrastructure choice, and module-level Prisma mocks provide sufficient isolation.

If a complex Prisma query is reused across ≥ 2 service functions within the same module, it may be
extracted as a named function in a `queries/` subfolder. This is a plain function, internal to its
module, not exported from `packages/services`.

## Rationale

- **Separation of concerns**: routes know HTTP; services know use cases; domain knows rules. Each
  layer has one reason to change.
- **Consistent discoverability**: logic is always in services. A new contributor never has to guess
  whether a given piece of logic lives in the route or somewhere else.
- **Deterministic behavior**: every use case has a single, named, testable entry point.
- **Clarity over cleverness**: named service functions (`registerUser`, `addCardToCollection`) read
  as use-case descriptions. No abstract classes, no DI containers, no factory patterns.

## Trade-offs

**Benefits:**

- All business logic is testable without a running Fastify server.
- Business errors are decoupled from HTTP — a service can be called from a route, a worker job, or a
  CLI script without modification.
- `apps/worker` imports from `packages/services` directly — no duplication when Phase 9 reads deck
  data.
- The rule is unconditional — no debate about whether a given case is "complex enough".

**Costs:**

- Service functions that wrap a single infrastructure call add one indirection with no immediate
  payoff. This is accepted as the cost of consistency.
- `packages/services` is a new package to maintain: `package.json`, `tsconfig`, pnpm workspace
  entry.

**Risks:**

- **Over-granularity**: one service function per route may produce too many files in early phases.
  Grouping by domain module (e.g. `auth-service.ts` exposing multiple functions) is the mitigation.
- **Concurrency between apps**: if a service function is called by both `apps/api` (per-request) and
  `apps/worker` (background job), transaction semantics must be considered explicitly per function.
  Prisma handles the DB-level isolation, but application-level invariants must be documented.

## Evolution History

### 2026-07-14: Initial decision

- Service layer introduced: routes are pure HTTP glue, all orchestration lives in services.
- `packages/services` created as a shared server-only package (anticipating Phase 9 worker overlap).
- Rule: unconditional — every use case in a service, regardless of complexity.
- Repository pattern rejected in favour of direct Prisma singleton usage.
- Complex reused queries may be extracted as named functions in a module-local `queries/` folder.

## References

- ADR-0005: Package Boundaries and Dependency Graph
- ADR-0012: Prisma Database Package
- ADR-0014: Auth API-proxied (current route structure this layer sits above)
- `apps/api/src/modules/auth/auth-routes.ts` — primary motivating example
- `apps/docs/roadmap.md` — Phase 3 (Scryfall), Phase 6 (Collection), Phase 9 (PDF)
