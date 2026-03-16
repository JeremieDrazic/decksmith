# Roadmap Update

Update ROADMAP item statuses without a full session-end ritual.

Use this mid-session when an item is done or newly in progress.

---

## Statuses

```
✅ Done       — fully complete
🔄 In progress — started, not yet done
⬜ Not started — not touched yet
```

---

## Process

### Step 1: Ask what to update

Ask: "Which items did we complete or start?"

Accept any of:

- The exact checkbox text (e.g., "Database seed script with faker.js")
- A short description that matches an item
- A phase number (e.g., "all of Phase 0")
- A status change description (e.g., "api-reviewer is in progress")

### Step 2: Read the ROADMAP

Read `docs/ROADMAP.md`.

Find all matching items. If unsure of a match, show the candidate and confirm before changing it.

### Step 3: Update statuses

For each confirmed item:

- **Completed** → change `⬜` or `🔄` to `✅`
- **Started** → change `⬜` to `🔄`
- **Reverted** → change `✅` or `🔄` back to `⬜` (if user made a mistake)

If all items in a phase are ✅: note this to the user — "Phase X is now fully complete."

Write the updated file.

### Step 4: Show a summary

```
Updated:
✅ [item 1]
🔄 [item 2] (in progress)

[Phase X is now complete.]

Next up: [first 🔄 or ⬜ item]
```

---

## Example Interaction

User: `/roadmap.update`

You: "Which items did we complete or start?"

User: "Finished the seed script. Started the env example."

You: [reads ROADMAP, finds matches, updates statuses]

> Updated: ✅ Database seed script with faker.js 🔄 `.env.example` (in progress)
>
> Next up: Finish `.env.example`

---

## Special Cases

### Marking a whole phase complete

If the user says "all of Phase 0", mark every remaining item in that phase as ✅. Show the full list
of what changed.

### Item not found

If no match is found, say so and ask for clarification. Never create new ROADMAP items without an
explicit decision.

### Accidental mark

If the user realizes a status was set incorrectly, revert it to the correct status.

---

## After Command

No further action required. Use `/session.end` at the end of the session for the full wrap-up.
