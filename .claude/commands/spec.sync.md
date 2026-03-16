# Spec Sync

Compare a spec document against the actual implementation. Flag gaps and propose updates.

Specs are aspirational documents. Code is the ground truth. This command aligns them.

---

## Process

### Step 1: Ask which spec to review

Ask: "Which spec should we sync? (e.g., `collection`, `deck-management`, `user-auth`)"

List available specs by reading `docs/specs/` if the user is unsure.

### Step 2: Read the spec

Read `docs/specs/<name>.md` in full.

Extract:

- All described endpoints (method + path)
- All described data fields and types
- All described business rules and validations
- Any mentioned UI behaviors or flows

### Step 3: Read the implementation

Based on the spec, identify and read the relevant implementation files:

- `apps/api/src/modules/<name>/` — routes and mapper
- `packages/schema/src/<name>/` — Zod schemas / DTOs
- `packages/domain/<name>.ts` — domain logic (if it exists)
- `packages/db/prisma/schema.prisma` — relevant models

### Step 4: Compare spec vs implementation

For each item in the spec, determine its status:

- ✅ **Implemented**: exists in code, matches spec
- 🔄 **Partial**: started but incomplete
- ⬜ **Not started**: mentioned in spec, no code yet
- ⚠️ **Diverged**: code exists but differs from spec (spec is likely outdated)
- ❌ **Missing from spec**: code exists but spec doesn't mention it

### Step 5: Propose updates

Based on the gaps found, propose one of:

**A) Update the spec** (when the implementation is intentionally different):

- Show the specific line(s) to change
- Explain why the implementation diverged

**B) Add to the ROADMAP** (when spec items aren't implemented yet):

- Confirm whether they belong in the current phase or a future one
- Don't silently add them — ask the user first

**C) Flag for discussion** (when it's unclear which is correct):

- Present both versions and ask the user to decide

---

## Output Format

```
## Spec Sync: <name>

### ✅ Implemented (matches spec)
- [item]

### 🔄 Partial
- [item]: [what's missing]

### ⬜ Not started (in spec, no code)
- [item]

### ⚠️ Diverged (code differs from spec)
- [item]: spec says X, code does Y

### ❌ Missing from spec (code exists, spec silent)
- [item]

---

## Proposed Actions
1. [Update spec line X to reflect actual behavior]
2. [Add Y to ROADMAP Phase Z — confirm?]
3. [Discuss: spec says X, implementation says Y — which is correct?]
```

---

## Example Interaction

User: `/spec.sync`

You: "Which spec should we sync?"

User: "collection"

You: [reads docs/specs/collection.md, reads apps/api/src/modules/collection/,
packages/schema/src/collection/, packages/domain/]

> ## Spec Sync: collection
>
> ### ✅ Implemented
>
> - GET /api/v1/collection — list entries
>
> ### ⬜ Not started
>
> - POST /api/v1/collection/folders — folder CRUD
> - Tags attach/detach
>
> ### ⚠️ Diverged
>
> - Spec mentions `condition` field as required. Current DTO has it optional.
>
> ## Proposed Actions
>
> 1. Update spec: mark `condition` as optional to match DTO
> 2. Add folder CRUD to ROADMAP Phase 5.1 — confirm?

---

## Special Cases

### Spec doesn't exist yet

If `docs/specs/<name>.md` doesn't exist:

> "No spec found. Would you like to create one based on the existing implementation? This is called
> a 'reverse spec' — useful when code was written spec-first mentally but never documented."

### Implementation doesn't exist yet

If there's no code at all for the spec:

> "No implementation found. This spec is entirely aspirational. The relevant ROADMAP items are:
> [list]. No sync needed — implementation comes first."

### Large spec with many gaps

If there are many ⬜ items, don't create a flood of ROADMAP changes. Instead:

> "I found [N] unimplemented items. Rather than adding them all now, I'll note the most critical
> gaps. Should I add them to the ROADMAP as a batch?"

---

## After Command

- Any spec updates: write them directly to the spec file
- Any ROADMAP additions: only after user confirms
- Significant divergence discovered → consider `/adr.update` if the divergence was intentional
