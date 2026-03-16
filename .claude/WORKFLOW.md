# Development Workflow

Orchestration guide for every type of task in Decksmith. Follow these sequences to ensure docs,
tests, and reviews stay in sync with the code.

---

## Every Session

### Start

```
/session.start
```

Outputs a briefing: where we are, what's next, any blockers + outdated deps.

### End

```
/session.end
```

Updates ROADMAP, project-state, decisions-log, suggests commit message.

---

## Starting a New API Module

1. Read the relevant spec in `docs/specs/<feature>.md`
2. `/module.scaffold <name>` — generates routes + mapper, registers in v1-routes
3. Write domain logic in `packages/domain` if needed → `domain-reviewer`
4. `api-reviewer` — validates DTO usage, mapper, error codes, JSDoc
5. `test-writer` — generates unit tests for domain logic, integration stubs for routes
6. `/roadmap.update` when done

---

## Starting a New UI Feature

1. Read the relevant spec in `docs/specs/<feature>.md`
2. `/cto-advisor` if architecture is unclear before starting
3. Build components using `packages/web-ui` base components
4. `ux-reviewer` → `ui-reviewer` → `a11y-reviewer`
5. `frontend-reviewer` — validates TanStack Query/Router usage, no business logic in components
6. `test-writer` — generates Storybook stories or Vitest tests
7. `/roadmap.update` when done

---

## After a Prisma Schema Change

1. `db-reviewer` — validates cascade rules, indexes, naming conventions
2. Run `pnpm --filter @decksmith/db db:generate`
3. Update seed script if new models are added
4. Update `docs/context/decisions-log.md` if it's a structural change
5. If significant → `/adr.create` or `/adr.update`

---

## Adding a New Dependency

- **Significant** (Redis, BullMQ, Three.js, Expo, major framework): `/adr.create` first
- **Minor utility**: add to `docs/context/decisions-log.md`
- Always use the pnpm catalog for shared deps: `pnpm-workspace.yaml`
- Never add silently

---

## After a CI/CD or Config Change

`devops-reviewer` — validates secrets, versions, cache, concurrency, `.env.example`

---

## Spec Drift Detected

```
/spec.sync
```

Compares the spec doc to the actual implementation, flags gaps, proposes updates.

---

## Architecture Question

```
/cto-advisor
```

On-demand before any major decision. Returns recommendation + trade-offs + ADR suggestion. Does not
implement — advises.

---

## Reference

- Skills detail: `docs/skills-and-agents.md`
- ADRs: `docs/adr/README.md`
- Specs: `docs/specs/`
- Roadmap: `docs/ROADMAP.md`
- Project state: `docs/context/project-state.md`
