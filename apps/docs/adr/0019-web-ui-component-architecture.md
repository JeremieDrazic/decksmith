# ADR-0019: `packages/web-ui` — Component Architecture and Definition of Done

**Last Updated:** 2026-06-08 **Status:** Active **Context:** Decksmith

---

## Context

Before scaffolding `packages/web-ui`, Session C (Phase 4.0.5) aligned on what a "complete component"
means and how the package should be structured. Without this alignment, components are judged
inconsistently and the boundary between shared UI and app-specific code drifts.

---

## Current Decision

### 1. Package Structure

```
packages/web-ui/src/
  ui/           → shadcn/ui + Base UI generated components (Button, Input, Dialog…)
  components/   → Decksmith custom prop-driven components (DeckCard, ManaSymbol…)
  typography/   → Semantic type components (Heading, Body, Label, Overline)
  icons/        → Custom animated SVG icon components (BellIcon, TrashIcon…)
  index.ts      → Re-exports everything
```

Each component is colocated with its files:

```
ui/Button/
  Button.tsx
  Button.stories.tsx
  Button.mdx
  index.ts
```

**`apps/web` structure (app-specific components):**

```
apps/web/src/
  components/   → Functional components coupled to the app (Navbar, Sidebar…)
  routes/       → Pages and loaders
  store/        → Zustand UI state
```

### 2. The `packages/web-ui` vs `apps/web` Boundary

**Rule:** A component belongs in `packages/web-ui` if and only if it is **prop-driven and
app-agnostic** — it could be used in another React app without modification.

**Mental test:** _"Could this component be used in another React app without changing anything?"_
Yes → `packages/web-ui`. No → `apps/web/src/components/`.

Components in `packages/web-ui` **never** import from:

- TanStack Router (no `useNavigate`, `<Link>` with app routes)
- TanStack Query hooks (no `useUser`, `useDecks`)
- Zustand store
- `packages/api-client`
- `apps/api`

| Component                       | Location                      | Reason                |
| ------------------------------- | ----------------------------- | --------------------- |
| `<Button>`                      | `packages/web-ui/ui/`         | Pure UI, props only   |
| `<ManaSymbol symbol="W">`       | `packages/web-ui/components/` | Pure UI, props only   |
| `<DeckCard name format colors>` | `packages/web-ui/components/` | Prop-driven, reusable |
| `<Navbar>`                      | `apps/web/src/components/`    | Uses router + Zustand |
| `<Sidebar>`                     | `apps/web/src/components/`    | Uses global UI state  |
| `<CardSearchSlideOver>`         | `apps/web/src/components/`    | Uses TanStack Query   |

### 3. When to Create a Component

**Rule of three:** Don't create a component preemptively. When a pattern repeats in 3 different
contexts, extract it. Building abstractions before seeing 3 real uses produces components that don't
fit actual usage and must be refactored immediately.

### 4. Definition of Done — Two Levels

#### v1 — Utilisable

A component reaches v1 when it is safe to use in the app. It is not yet considered stable.

- [ ] Functional — all main use cases work
- [ ] TypeScript strict — explicit props, no `any`
- [ ] JSDoc on the component export and non-obvious props
- [ ] Semantic tokens only — no hardcoded values
- [ ] Every variant and state has a Story (default, hover, focus, disabled, error, loading…)
- [ ] Keyboard navigable (usable without mouse)
- [ ] Storybook `@storybook/addon-a11y` — 0 violations

#### Complet — Stable

All v1 criteria, plus:

- [ ] Play functions on key interactions
- [ ] Dark + light mode verified in Storybook
- [ ] `ComponentName.mdx` — anatomy diagram, API table, dos/don'ts, accessibility notes
- [ ] `a11y-reviewer` agent run — 0 violations
- [ ] Motion tokens used for all transitions — never arbitrary durations
- [ ] Error and loading states covered where applicable

> A component is promoted to `packages/web-ui` when it reaches v1. It is considered _stable_ when it
> is complete. Development on the app is never blocked waiting for component perfection.

### 5. Storybook MDX Documentation Structure

Each component's `.mdx` file follows this structure:

```mdx
# ComponentName

Brief description — what it is and when to use it.

## Anatomy

<Anatomy>
  <ComponentName ...props />
  <Anatomy.Label target="root">Root — semantic token usage</Anatomy.Label>
  <Anatomy.Label target="label">Label — typography token</Anatomy.Label>
</Anatomy>

## API

<ArgTypes />

## Dos and Don'ts

| Do                                                   | Don't                                      |
| ---------------------------------------------------- | ------------------------------------------ |
| Use `<Button variant="primary">` for the main action | Don't put two primary buttons side by side |
| Use `on-accent` text on amber buttons                | Don't use white text on amber — fails WCAG |

## Accessibility

Notes on keyboard interaction, ARIA roles, focus management.

## Related

Links to related components.
```

The `<Anatomy>` component is a Storybook-only utility (`.storybook/components/Anatomy.tsx`) that
renders the real component with floating annotation labels. It is never imported in `apps/web`.

### 6. Code Comments Policy

Two distinct levels — not to be confused:

- **JSDoc** (required on exports): describes the component's purpose, props, and any non-obvious
  behaviour. This is the API documentation.
- **Inline comments** (only when the WHY is non-obvious): a hidden constraint, a workaround for a
  specific bug, behaviour that would surprise a reader. If removing the comment wouldn't confuse a
  future reader, don't write it.

Do not comment _what_ code does — well-named identifiers already do that.

---

## Rationale

**Why separate `ui/` from `components/`:** `ui/` files are regenerable via `npx shadcn add` — they
are scaffolded first and customized after. `components/` files are written from scratch and
represent Decksmith's visual identity. The distinction signals intent and prevents accidentally
overwriting custom code with a shadcn regeneration.

**Why `typography/` is separate:** `<Heading>`, `<Body>`, and `<Label>` are not UI components in the
traditional sense — they are contracts on the type scale. A `<Heading level={2}>` encodes "text-2xl,
font-700, tracking-tight" in a single token. Separating them signals that raw Tailwind type classes
are never used directly in feature JSX.

**Why the prop-driven boundary matters:** It mirrors the architectural rule already in place for
packages (ADR-0005): packages don't reach into each other's concerns. A UI component that imports a
routing hook is no longer a UI component — it is a feature. Keeping this boundary makes
`packages/web-ui` independently testable and reusable.

**Why two levels of done:** A checklist with 12 required items before a component can be used
creates a bottleneck — nothing ships while components are being perfected. v1 sets a safe minimum;
"complete" sets the quality bar for stability. Components earn stability through use, not before.

---

## Trade-offs

**Benefits:**

- Clear ownership boundary — no ambiguity about where a component lives
- `packages/web-ui` is independently testable (no app coupling)
- Two-level done prevents both under-engineering and over-engineering
- MDX anatomy pattern produces living, always-accurate documentation

**Costs:**

- The `<Anatomy>` component must be built as a Storybook utility before docs can use it
- The prop-driven rule sometimes requires extracting data-fetching to a parent — slightly more
  wiring per feature

**Risks:**

- Boundary erosion over time (adding a routing import "just this once")
  - **Mitigation:** `domain-reviewer` agent pattern applied to `packages/web-ui` — any import from
    router/query/store in the package is a red flag to catch in review

---

## Evolution History

### 2026-06-08: Initial decision

- Validated during Session C (Phase 4.0.5)
- Key decisions: prop-driven boundary rule, two-level done, rule of three for component creation,
  MDX anatomy pattern, `typography/` separation, JSDoc vs inline comment policy

---

## References

- [ADR-0005: Package Boundaries](./0005-package-boundaries-and-dependency-graph.md)
- [ADR-0006: Testing Strategy — Storybook](./0006-testing-strategy-with-vitest.md)
- [ADR-0017: packages/tokens Architecture](./0017-packages-tokens-architecture.md)
- [ADR-0018: Frontend Library Stack](./0018-frontend-library-stack.md)
