# Architecture Decision Records

This directory contains all architecture decisions for Decksmith.

ADRs are **living documents**: they can be amended as the project evolves. Each ADR tracks its
evolution history.

---

## Active ADRs

| ID                                                        | Title                                      | Status | Date       |
| --------------------------------------------------------- | ------------------------------------------ | ------ | ---------- |
| [0001](./0001-use-fastify-as-web-framework.md)            | Use Fastify as Web Framework               | Active | 2026-01-03 |
| [0002](./0002-monorepo-with-pnpm-and-turborepo.md)        | Monorepo Structure with pnpm and Turborepo | Active | 2026-01-08 |
| [0003](./0003-typescript-strict-configuration.md)         | TypeScript Strict Mode Configuration       | Active | 2026-01-08 |
| [0004](./0004-code-quality-and-formatting-standards.md)   | Code Quality and Formatting Standards      | Active | 2026-01-08 |
| [0005](./0005-package-boundaries-and-dependency-graph.md) | Package Boundaries and Dependency Graph    | Active | 2026-01-08 |
| [0006](./0006-testing-strategy-with-vitest.md)            | Testing Strategy with Vitest and Storybook | Active | 2026-01-08 |

---

## How to Create a New ADR

### Using Claude Code (recommended)

In VSCode, open Claude Code and use the ADR creation skill:

```
/adr.create

I want to document [your decision]
```

Claude Code will guide you through the process using the template.

### Manually

1. Copy `template.md` to a new file: `XXXX-short-title.md` (use next sequential number)
2. Fill in all sections based on template structure
3. Update this README with the new entry
4. Commit with message: `docs: add ADR-XXXX [title]`

---

## How to Update an Existing ADR

In Claude Code:

```
/adr.update

Update ADR-XXXX: [describe the change]
```

ADRs are living documents. Updates should:

- Preserve evolution history (add entry in "Evolution History" section)
- Update "Last Updated" date
- Change status if needed (Active → Deprecated → Superseded)
- Never delete or rewrite history

---

## ADR Status Values

- **Draft**: Under discussion, not yet implemented
- **Active**: Current decision, implemented and in use
- **Deprecated**: No longer recommended, but not yet replaced
- **Superseded**: Replaced by a newer ADR (link to successor)
