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

Updates ROADMAP, project-state, decisions-log, suggests commit message. Includes a retention check
(2–3 questions on concepts introduced — see the collab retro 2026-07-25).

---

## Pair-Programming Zones (collab retro 2026-07-25)

Who types the code depends on the zone — explanation depth is always full. See `.claude/PROFILE.md`
§ Mode pair-programming:

- **High-learning** (`packages/domain`, `packages/services`, `packages/scryfall`, auth, DB schema):
  Jérémie writes, Claude designs/guides/reviews.
- **Ship-first** (devops, tooling, config, repetitive UI): Claude writes.

---

## Starting a New API Module

1. Read the relevant spec in `apps/docs/specs/<feature>.md`
2. `/module.scaffold <name>` — generates routes + mapper, registers in v1-routes
3. Write domain logic in `packages/domain` if needed (high-learning zone — Jérémie writes)
4. Tests are written in the same session as the implementation (CLAUDE.md testing rule)
5. Optional second pass, on demand: `domain-reviewer`, `api-reviewer`, `test-writer`
6. `/roadmap.update` when done

---

## Starting a New UI Feature

1. Read the relevant spec in `apps/docs/specs/<feature>.md`
2. `/cto-advisor` if architecture is unclear before starting
3. Build components using `packages/web-ui` base components
4. Storybook stories + Vitest tests written with the implementation
5. Optional second pass, on demand: `ux-reviewer`, `ui-reviewer`, `a11y-reviewer`,
   `frontend-reviewer`
6. `/roadmap.update` when done

---

## After a Prisma Schema Change

1. `db-reviewer` — validates cascade rules, indexes, naming conventions
2. Run `pnpm --filter @decksmith/db db:generate`
3. Update seed script if new models are added
4. Update `apps/docs/context/decisions-log.md` if it's a structural change
5. If significant → `/adr.create` or `/adr.update`

---

## Adding a New Dependency

- **Significant** (Redis, BullMQ, Three.js, Expo, major framework): `/adr.create` first
- **Minor utility**: add to `apps/docs/context/decisions-log.md`
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

- Skills detail: `apps/docs/skills-and-agents.md`
- ADRs: `apps/docs/adr/index.md`
- Specs: `apps/docs/specs/`
- Roadmap: `apps/docs/roadmap.md`
- Project state: `apps/docs/context/project-state.md`
- Retrospectives: `apps/docs/context/retrospectives/`
