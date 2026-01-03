# ADR-XXXX: [TITLE]

**Last Updated:** [DATE]  
**Status:** Draft  
**Context:** Decksmith

---

## Context

[Describe the architectural problem or question this ADR addresses]

## Current Decision

[State the decision clearly and unambiguously]

## Rationale

[Explain why this decision makes sense given the project's values: 
- separation of concerns
- explicit data contracts
- deterministic behavior
- maintainability
- clarity over cleverness]

## Trade-offs

**Benefits:**
- [What we gain]

**Costs:**
- [What we lose or accept]

**Risks:**
- [What could go wrong]

## Evolution History

### [DATE]: Initial decision
- [Summary of the decision]

## References

- [Links to specs, discussions, or external docs]
```

### b) Prompt pour Claude Code

Quand tu veux générer un ADR, tu dirais quelque chose comme :
```
I need to document an architecture decision.

Topic: [e.g., "Use Zod for all DTO validation"]

Please:
1. Read .claude/adr-template.md
2. Check docs/adr/ for the next available number
3. Create a new ADR file following the template
4. Fill in all sections based on our conversation
5. Update docs/adr/README.md with the new entry
6. Respect the project values (see project context)

Ask me clarifying questions if needed before writing.