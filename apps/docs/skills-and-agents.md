# Skills & Agents Reference

Quick reference for all Claude Code skills and subagents available in Decksmith.

---

## When to Use What

| Situation                                   | Use                       |
| ------------------------------------------- | ------------------------- |
| Start of a working session                  | `/session.start`          |
| End of a working session                    | `/session.end`            |
| Mark ROADMAP items complete                 | `/roadmap.update`         |
| Scaffold a new API module                   | `/module.scaffold`        |
| Check spec vs implementation                | `/spec.sync`              |
| New ADR needed                              | `/adr.create`             |
| Existing ADR needs updating                 | `/adr.update`             |
| After implementing a route                  | `api-reviewer` agent      |
| After changing Prisma schema                | `db-reviewer` agent       |
| After touching `packages/domain`            | `domain-reviewer` agent   |
| After implementing a React component/page   | `frontend-reviewer` agent |
| After building a UI component               | `ui-reviewer` agent       |
| After building any interactive UI           | `a11y-reviewer` agent     |
| After implementing a domain fn or API route | `test-writer` agent       |
| After modifying CI/CD or env config         | `devops-reviewer` agent   |
| Before a major architectural decision       | `cto-advisor` agent       |
| After implementing any UI feature           | `ux-reviewer` agent       |

---

## Skills

### `/session.start`

Briefing at the start of a working session.

**Does:**

1. Reads ROADMAP — identifies last completed item and next pending item
2. Reads `project-state.md` — checks environment status and blockers
3. Runs `pnpm outdated` — surfaces any outdated dependencies
4. Outputs a one-paragraph briefing: where we are, what's next, any blockers
5. Asks if `project-state.md` needs updating before starting

---

### `/session.end`

Closes out a session and updates all living docs.

**Does:**

1. Asks "what did we complete today?"
2. Updates `docs/ROADMAP.md` checkboxes (⬜ → ✅)
3. Updates `docs/context/project-state.md` — environment, branch, blockers
4. Appends any micro-decisions to `docs/context/decisions-log.md`
5. Suggests a commit message if there are uncommitted changes
6. Outputs "Next session starts at: [next ROADMAP item]"

---

### `/roadmap.update`

Mark ROADMAP items as complete without a full session-end ritual.

**Does:**

1. Asks which items to mark complete
2. Reads `docs/ROADMAP.md`
3. Updates matching checkboxes ⬜ → ✅
4. If all items in a phase are ✅, marks the phase complete
5. Shows a summary of what changed

---

### `/module.scaffold`

Scaffold a new API module following the established patterns.

**Does:**

1. Asks for the module name (e.g. "collection", "deck")
2. Reads `apps/api/src/modules/user/` as the reference pattern
3. Generates:
   - `apps/api/src/modules/<name>/<name>-routes.ts`
   - `apps/api/src/modules/<name>/<name>-mapper.ts` (Prisma → DTO)
4. Registers routes in `apps/api/src/plugins/v1-routes.ts`
5. Identifies which `packages/schema` DTOs to use
6. Triggers `api-reviewer` after generation

---

### `/spec.sync`

Compare a spec document against the actual implementation.

**Does:**

1. Asks which spec to review
2. Reads the spec file from `docs/specs/`
3. Reads the relevant implementation files
4. Flags: aspirational sections vs. actually implemented
5. Proposes specific updates to align the spec with reality

---

### `/adr.create`

Create a new Architecture Decision Record. See [adr/index.md](adr/index.md).

---

### `/adr.update`

Update an existing ADR with new evolution. See [adr/index.md](adr/index.md).

---

## Subagents

### `api-reviewer`

**Trigger:** After implementing any Fastify route or modifying an existing one.

**Checks:**

- DTO used (never raw Prisma model in response)
- Mapper function present
- Typed error codes from `packages/schema`
- JSDoc on the route handler
- No business logic in route handler (only in `packages/domain`)
- Route registered in `v1-routes.ts`

---

### `db-reviewer`

**Trigger:** After any Prisma schema change.

**Checks:**

- Cascade/restrict rules match the ownership model
- UUID v4 for new model IDs
- camelCase fields with `@map()` for snake_case columns
- Indexes for expected query patterns
- No accidental cascade deletes on shared/reference data

---

### `domain-reviewer`

**Trigger:** After adding or modifying anything in `packages/domain`.

**Checks:**

- No Prisma imports
- No Fastify imports
- No side effects
- Pure functions only (or explicit effect boundaries)
- Business rules match the relevant spec
- Throws domain errors, not HTTP errors

---

### `frontend-reviewer`

**Trigger:** After implementing a React component, page, or hook.

**Checks:**

- TanStack Query for all server state (no manual `fetch`)
- TanStack Router for navigation
- No business logic in components (only in hooks or `packages/domain`)
- Lazy loading for heavy routes
- No inline styles (Tailwind classes only)

---

### `ui-reviewer`

**Trigger:** After building any UI component.

**Checks:**

- Design tokens from `packages/tokens` used (no hardcoded colors/spacing)
- shadcn/ui components used as base
- Component follows `packages/web-ui` conventions
- Dark mode works
- Responsive breakpoints covered (ADR-0008 targets)

---

### `a11y-reviewer`

**Trigger:** After building any interactive UI component.

**Checks:**

- WCAG 2.1 AA compliance
- Keyboard navigation works
- Focus management correct
- ARIA labels on interactive elements
- Color contrast ratios
- Form error associations
- Screen reader-friendly heading hierarchy

---

### `test-writer`

**Trigger:** After implementing a domain function, utility, or API route.

**Generates:** Vitest tests colocated with the source file.

**Pattern:** happy path + minimum 2 error/edge cases. No mocks for pure domain logic. `describe/it`
naming: `describe('fn') > it('returns X when Y')`.

---

### `devops-reviewer`

**Trigger:** After modifying CI/CD workflows, environment config, or deployment scripts.

**Checks:**

- No secrets hardcoded
- pnpm + node versions match across all workflow files
- Cache steps present
- Concurrency groups configured
- No `--no-verify` flags
- New env vars documented in `.env.example`

---

### `cto-advisor`

**Trigger:** On-demand, before major architectural decisions or when adding a significant new
dependency.

**Role:** Evaluates the decision against Decksmith's core values, long-term maintainability, and the
existing stack. Asks: "Is this the simplest thing that could work? Does this create circular
dependencies? What's the migration cost in 2 years?"

Does not implement — advises. Output: recommendation + trade-offs + suggested ADR title.

---

### `ux-reviewer`

**Trigger:** After writing UI components or drafting specs that involve user-facing features.

**Checks:** Component designs, user flows, interaction patterns, accessibility, visual consistency.

---

## Learning Contract

Every subagent follows this principle: when flagging an issue, explain the underlying _why_ — not
just what's wrong, but what problem it causes in practice. If the issue touches a concept the
developer may not know (N+1 queries, referential integrity, ARIA roles, bundle splitting), explain
it briefly. The goal is understanding, not just a fix.
