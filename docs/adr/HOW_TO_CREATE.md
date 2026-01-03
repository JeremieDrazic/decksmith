# How to Create an ADR with Claude Code

In the Claude Code chat in VSCode, say:

---

I need to create a new Architecture Decision Record.

**Topic:** [your topic here]

Please:
1. Check `docs/adr/` to find the next available number (format: 0001, 0002, etc.)
2. Read the template at `docs/adr/template.md`
3. Ask me clarifying questions about:
   - The architectural problem or context
   - Alternatives we considered (if any)
   - Trade-offs and consequences
   - How this aligns with our core values (separation of concerns, explicit contracts, clarity over cleverness)
4. Generate the ADR file in `docs/adr/XXXX-short-title.md`
5. Update `docs/adr/README.md` to include the new ADR in the table

Be concise but thorough. Ask questions instead of guessing.

---

Then just fill in the topic and paste this into Claude Code chat.
```

---

## 3. Exemple de conversation dans VSCode

**Toi dans le chat Claude Code :**
```
I need to create a new Architecture Decision Record.

Topic: Use Zod for all DTO validation across the monorepo

Please:
1. Check docs/adr/ to find the next available number
2. Read the template at docs/adr/template.md
3. Ask me clarifying questions about context, alternatives, trade-offs
4. Generate the ADR file
5. Update docs/adr/README.md

Core values to consider: separation of concerns, explicit contracts, deterministic behavior, clarity over cleverness.