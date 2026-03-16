# Session Start

Orient for the current working session: where we are, what's next, any blockers, outdated deps.

---

## Process

### Step 1: Read ROADMAP

Read `apps/docs/roadmap.md`.

- Identify the last ✅ completed item
- Identify any 🔄 in-progress items — these take priority over ⬜
- Identify the first ⬜ item — this is "what's next" if nothing is in progress

### Step 2: Read project state

Read `apps/apps/docs/context/project-state.md`.

- Check environment status (DATABASE_URL, Supabase, Redis)
- Check the blockers section
- Note the current branch

### Step 3: Check outdated dependencies

Run:

```bash
pnpm outdated
```

If there are outdated packages:

- List them clearly
- Ask: "Should we update these before starting today's work?"
- If yes: update, fix any breaking changes, then continue

### Step 4: Output the briefing

Write a short paragraph (4–6 lines):

```
Last completed: [item from ROADMAP]
In progress: [🔄 items, or "none"]
Next up: [first 🔄 item, or first ⬜ item if nothing in progress]
Blockers: [from project-state.md, or "none"]
Branch: [current branch from project-state.md]
Outdated deps: [count, or "none"]
```

### Step 5: Ask about project-state

Ask: "Does `apps/apps/docs/context/project-state.md` need any updates before we start?"

If yes: update it now before proceeding.

---

## Example Output

> **Session briefing**
>
> Last completed: Database seed script with faker.js Next up: Create 5 skills (session.start,
> session.end, roadmap.update, module.scaffold, spec.sync) Blockers: No live database — Supabase
> project not created yet Branch: chore/context-system Outdated deps: none
>
> Does `project-state.md` need any updates before we start?

---

## After Command

- If deps were updated: log the updates in `apps/apps/docs/context/decisions-log.md` if significant
- Continue to the planned work
