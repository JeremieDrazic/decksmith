# Architecture Decision Records

This directory contains all architecture decisions for Decksmith.

ADRs are **living documents**: they can be amended as the project evolves.
Each ADR tracks its evolution history.

---

## How to Create a New ADR

See [HOW_TO_CREATE.md](./HOW_TO_CREATE.md) for instructions on using Claude Code to generate ADRs.

---

## Core Principles

All architectural decisions should respect Decksmith's core values:
- **Separation of concerns**: Clean boundaries between layers
- **Explicit data contracts**: No implicit coupling
- **Deterministic behavior**: Predictable, testable systems
- **Maintainability**: Code that can be understood and changed
- **Clarity over cleverness**: Boring solutions over clever ones

---

## Active ADRs

| # | Title | Last Updated | Status |
|---|-------|--------------|--------|
| [0001](./0001-use-fastify-as-web-framework.md) | Use Fastify as Web Framework for apps/api | 2026-01-01 | Active |

## Deprecated

_None yet_

---

## ADR Statuses

- **Draft**: Under discussion, not yet implemented
- **Active**: Accepted and currently in force
- **Deprecated**: No longer applicable, superseded by another ADR
```

### c) `docs/adr/HOW_TO_CREATE.md`

(Le contenu que j'ai donné plus haut)

---

## 5. Workflow optimisé dans VSCode

### Pour créer un ADR

1. **Ouvre le chat Claude Code** dans VSCode
2. **Copie-colle** le prompt template de `HOW_TO_CREATE.md`
3. **Remplace** `[your topic here]` par ton sujet
4. **Lance** → Claude Code pose des questions → Tu réponds → ADR créé

### Pour amender un ADR existant

Dans le chat Claude Code :
```
I need to update ADR-0003 (Use Zod for validation).

Change: We've decided to also use Zod schemas for Prisma input validation in the API layer.

Please:
1. Read the current ADR at docs/adr/0003-use-zod-for-validation.md
2. Add an entry to the Evolution History section
3. Update the "Current Decision" or "Rationale" if needed
4. Update "Last Updated" to today's date

Ask me if you need clarification on the change.
```

### Pour créer une Spec (GitHub Spec Kit style)

Dans le chat Claude Code :
```
I need to create a feature spec for "Deck Export to PDF".

Please:
1. Check docs/specs/features/ for existing specs to match the format
2. Create docs/specs/features/deck-export-pdf.md
3. Include sections: Summary, Motivation, Goals, Non-Goals, Design, API Changes, References
4. Reference relevant ADRs (e.g., ADR-0005 about worker for PDF generation)

Ask me questions to fill in the details.