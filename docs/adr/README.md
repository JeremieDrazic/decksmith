# Architecture Decision Records

This directory contains all architecture decisions for Decksmith.

ADRs are **living documents**: they can be amended as the project evolves.
Each ADR tracks its evolution history.

---

## How to Create a New ADR

### Using Claude Code (recommended)

In VSCode, open Claude Code and use:

    @.claude/commands/adr/create-adr.md
    
    I want to document [your decision]

Claude Code will guide you through the process.

### Manually

1. Copy `template.md` to a new file: `XXXX-short-title.md` (use next sequential number)
2. Fill in all sections
3. Update this README with the new entry

---

## How to Update an Existing ADR

In Claude Code:

    @.claude/commands/adr/update-adr.md
    
    Update ADR-XXXX: [describe the change]

---

## Core Principles

[... reste du README ...]
```

---

## Commande pour nettoyer

Tu peux demander à Claude Code de faire le nettoyage :
```
Supprime docs/adr/HOW_TO_CREATE.md et mets à jour docs/adr/README.md pour référencer les commandes Claude Code (.claude/commands/adr/) au lieu de HOW_TO_CREATE.md.