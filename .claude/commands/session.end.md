# Session End

Close out a working session: update all living docs, log decisions, suggest a commit.

---

## Process

### Step 1: Ask what was completed or started

Ask: "What did we complete or start today?"

Wait for the user's answer. Use it to drive the rest of the steps.

### Step 2: Update ROADMAP checkboxes

Read `apps/docs/roadmap.md`.

For each item the user mentioned:

- **Completed** → change `⬜` or `🔄` to `✅`
- **Started but not finished** → change `⬜` to `🔄`
- If all items in a phase are now ✅, note that the phase is complete

Write the updated file.

### Step 3: Update project-state.md

Read `apps/apps/docs/context/project-state.md`.

Update:

- **Environment** table: reflect any new vars configured
- **What's Working**: tick off newly working items
- **What's NOT Working / Blockers**: remove resolved blockers, add new ones
- **Current Branch**: update if it changed
- **_Updated_ date**: today's date

Write the updated file.

### Step 4: Log micro-decisions

Ask: "Were any small decisions made that aren't in an ADR?"

Examples of things that belong here:

- A specific package chosen over another
- A config option set a certain way
- A pattern adopted that isn't obvious from the code

If yes: append to `apps/apps/docs/context/decisions-log.md` using this format:

```markdown
## [YYYY-MM-DD] — [Short decision title]

**Context:** Why was this decision needed? **Decision:** What was decided? **Impact:** Which files /
packages / behavior changed?

---
```

Place the new entry at the **top** (newest-first order).

### Step 5: Suggest a commit message

Run:

```bash
git status
git diff --stat
```

Based on what changed, suggest a commit message following the project's convention:

```
<type>(<scope>): <short description>
```

Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `ci`

Example: `chore(claude): add session skills and subagents`

Ask: "Should I commit now?"

### Step 6: Output the wrap-up

```
Session wrapped.
Completed: [list]
In progress: [list, if any]
Next session starts at: [first 🔄 or ⬜ item in ROADMAP]
```

---

## Example Output

> **Session wrap-up**
>
> Completed: session.start, session.end, roadmap.update, module.scaffold, spec.sync skills In
> progress: api-reviewer subagent (started, not finished)
>
> ROADMAP updated. project-state.md updated.
>
> Suggested commit: `chore(claude): add 5 session management skills`
>
> Next session starts at: Finish api-reviewer + remaining 8 subagents

---

## After Command

- Commit if the user confirms
- The next `/session.start` will read the updated ROADMAP and project-state automatically
