# ADR-0002: Monorepo Structure with pnpm Workspaces and Turborepo

**Last Updated:** 2026-01-08 **Status:** Active **Context:** Decksmith

---

## Context

Decksmith is designed as a modular system with multiple applications (web, API, worker, mobile) and
shared business logic. We need a repository structure that supports:

- Shared code reuse between frontend and backend (contracts, domain logic)
- Independent deployment of applications
- Atomic refactoring across boundaries
- Type safety across the entire system
- Efficient build and test orchestration

The fundamental question is: **monorepo or polyrepo**, and if monorepo, **which tooling?**

## Current Decision

We will use a **monorepo structure** with:

- **pnpm workspaces** for package management
- **Turborepo** for task orchestration and caching
- **Structure**: `apps/*` for applications, `packages/*` for shared code
- **Workspace protocol** (`workspace:*`) to enforce dependency boundaries

## Rationale

### Why Monorepo Over Polyrepo

1. **Shared Contracts**: `packages/schema` defines all DTOs. In a polyrepo, this would require
   publishing to npm or using git submodules, both adding friction.
2. **Atomic Refactoring**: Changes to `packages/domain` that affect multiple apps can be made and
   tested in a single commit.
3. **Type Safety**: TypeScript can resolve types across packages without publishing intermediate
   versions.
4. **Unified Tooling**: Single CI/CD pipeline, single versioning strategy, shared configs.
5. **Developer Experience**: Clone once, run once, test once.

This aligns with **"Separation of concerns"** (clear package boundaries) and **"Explicit data
contracts"** (packages/schema is the single source of truth).

### Why pnpm

1. **Efficient Disk Usage**: Content-addressable storage, no duplicate dependencies.
2. **Strict by Default**: No phantom dependencies. If a package uses a dependency, it must declare
   it.
3. **Fast Installation**: Parallel dependency resolution, faster than npm/yarn.
4. **Workspace Protocol**: `workspace:*` ensures packages link to local versions, preventing
   accidental external dependencies.
5. **Hoisting Control**: `shamefully-hoist=false` prevents accidental access to undeclared
   dependencies.

pnpm's strictness aligns with **"Clarity over cleverness"** — explicit dependencies, no magic.

### Why Turborepo

1. **Task Orchestration**: Automatically parallelizes builds, tests, lints across packages.
2. **Intelligent Caching**: Caches build outputs based on input hashes. Rebuilds only what changed.
3. **Dependency-Aware**: Builds dependencies before dependents (`^build` syntax).
4. **Simple Configuration**: Single `turbo.json` defines all pipelines.
5. **Incremental Adoption**: Works with existing scripts, no rewrite required.

Turborepo aligns with **"Deterministic behavior"** — same inputs = same outputs, always.

### Why Not Alternatives

**Nx**: More opinionated, heavier setup, designed for Angular-first (though supports others).
Overkill for Decksmith's needs.

**Lerna**: Older, focused on versioning and publishing. No built-in caching or task orchestration.
pnpm + Turbo is a more modern stack.

**Rush**: Microsoft's tool, very powerful but complex. Designed for massive monorepos (100+
packages). Decksmith has ~15 packages.

**Polyrepo**: Would require:

- Publishing `packages/schema` to npm or private registry
- Versioning every change to shared packages
- Coordinating updates across multiple repos
- Duplicated tooling configs

This would violate **"Minimal coupling"** by introducing npm as a dependency boundary.

## Trade-offs

**Benefits:**

- **Atomic changes**: Refactor contracts and consumers in one PR
- **Type safety**: TypeScript resolves types across packages without intermediate builds
- **Shared tooling**: One prettier, one eslint, one tsconfig
- **Fast CI**: Turborepo caches unchanged packages
- **Developer experience**: Single `pnpm install`, single `pnpm dev`

**Costs:**

- **Initial complexity**: More setup than a single package.json
- **Learning curve**: Team must understand workspaces and dependency graphs
- **CI time**: Testing all packages on every push (mitigated by Turborepo caching)
- **Discipline required**: Must respect package boundaries to avoid coupling

**Risks:**

- **Accidental coupling**: Without discipline, packages may depend on implementation details, not
  interfaces
  - **Mitigation**: ADR-0005 (Package Boundaries) defines strict dependency rules
- **Slow builds**: As the monorepo grows, builds could slow down
  - **Mitigation**: Turborepo's caching and parallelization scale well
- **Complex merges**: Multiple developers changing shared packages
  - **Mitigation**: Small, frequent PRs; clear ownership of packages

## Evolution History

### 2026-01-08: Initial decision

- Chosen pnpm + Turborepo for monorepo infrastructure
- Defined apps/_ and packages/_ structure
- Enforced workspace protocol for local dependencies

## References

- [pnpm Workspaces Documentation](https://pnpm.io/workspaces)
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Monorepo.tools](https://monorepo.tools) - Comparison of monorepo tools
- ADR-0005: Package Boundaries and Dependency Graph (defines rules for using this structure)
