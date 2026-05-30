# ADR-0015: Design System Architecture — Tokens, Theming, and No-Figma Workflow

**Last Updated:** 2026-05-30  
**Status:** Active  
**Context:** Decksmith

---

## Context

Decksmith needs a design system that:

- Supports a dark theme (primary) and a light theme, switchable at runtime without a page reload
- Encodes MTG-specific visual language: mana colour tokens and mana symbol icons
- Can eventually be consumed by both `apps/web` (React/Tailwind) and `apps/mobile` (React Native)
- Can be iterated on without a dedicated designer or separate design tool

Four interrelated decisions had to be made:

1. **Where and how is the visual language defined?** (tokens strategy)
2. **How is theming implemented?** (CSS custom properties vs Tailwind `dark:` variant)
3. **How do we design without Figma?** (no-Figma workflow)
4. **How are MTG mana symbols rendered?** (Keyrune vs custom icons vs coloured circles)

> **Note:** Phase 4.0 produced documentation. `packages/tokens` and `packages/web-ui` are not yet
> built. Specific values (colour hex codes, spacing scale, typography sizes, component APIs) are
> current best thinking and will be refined during Phase 4.1 implementation. The architectural
> patterns documented here — CSS custom properties, token package, Keyrune — are stable.

---

## Current Decision

### 1. Tokens in `packages/tokens`

All design tokens are defined once in `packages/tokens` and consumed by platform packages:

- `apps/web/tailwind.config.ts` imports `decksmithPreset` from `packages/tokens/src/tailwind.ts`
- `apps/mobile` (future) reads raw token values directly from `packages/tokens/src/tokens.ts`

Token categories:

| Category   | Examples                                                                                   |
| ---------- | ------------------------------------------------------------------------------------------ |
| Semantic   | `bg`, `surface`, `surface-raised`, `border`, `text`, `text-muted`, `text-faint`            |
| Accent     | `accent`, `accent-hover`, `accent-subtle`, `accent-border`                                 |
| MTG colour | `mtg-white`, `mtg-blue`, `mtg-black`, `mtg-red`, `mtg-green`, `mtg-colorless`, `mtg-multi` |
| Typography | Font families, size scale (xs → 4xl), weights                                              |
| Spacing    | Shared spacing scale                                                                       |

MTG colour tokens are defined as a **separate group** from semantic tokens — they represent Magic's
colour identity system, not UI states. `mtg-red` ≠ `error` even though both are red hues.

### 2. CSS Custom Properties for Theming

Dark/light theme is implemented via CSS custom properties on `:root` (light) and `.dark` (dark
override), not via Tailwind's `dark:` class variant.

```css
:root {
  --color-bg: #faf9f4;
  --color-surface: #ffffff;
  --color-text: #1c1b22;
}

.dark {
  --color-bg: #0f0e17;
  --color-surface: #1a1827;
  --color-text: #e8e6f0;
}
```

Tailwind classes reference the CSS var through `decksmithPreset`:

```ts
// packages/tokens/src/tailwind.ts
colors: {
  bg: 'var(--color-bg)',
  surface: 'var(--color-surface)',
  text: 'var(--color-text)',
}
```

Components use semantic class names (`bg-bg`, `bg-surface`, `text-text-muted`). Theme switches by
toggling `.dark` on `<html>` — no page reload, no class proliferation in JSX.

### 3. No-Figma Workflow

Figma is not used as design source of truth. The design-to-code workflow is:

```
ASCII mocks (apps/docs/design/screens/)
    ↓
packages/tokens  (visual language — colours, type, spacing)
    ↓
Tailwind config  (decksmithPreset applied to apps/web)
    ↓
packages/web-ui  (shadcn/ui base + Decksmith-specific components)
    ↓
Storybook        (visual iteration + living documentation)
```

ASCII mocks in `apps/docs/design/screens/` define screen structure and layout regions. They live in
version control alongside the specs they reference. `packages/web-ui` + Storybook replace Figma for
visual component iteration.

### 4. Keyrune SVG Icons for Mana Symbols

MTG mana symbols (`{W}` `{U}` `{B}` `{R}` `{G}` `{C}` `{X}` etc.) are rendered using **Keyrune**
(`mana.andrewgioia.com`) — the official community SVG/icon font for MTG symbols.

Convention: `{W}`, `{U}`, `{B}`, `{R}`, `{G}` notation in ASCII mocks maps to `<i class="ms ms-w">`
in HTML. In React components, this will be wrapped in a `<ManaSymbol symbol="W" />` component.

WUBRG colour tokens (`mtg-white`, `mtg-blue`, etc.) are kept for background tints, text, badges, and
charts — complementary to Keyrune, not replacements.

---

## Rationale

### Why `packages/tokens` rather than values directly in `tailwind.config.ts`?

`apps/mobile` cannot use Tailwind — it needs raw token values. Centralising tokens in a shared
package prevents the web and mobile implementations from drifting apart. The same principle as
`packages/schema` for data contracts: one source, multiple consumers.

### Why CSS custom properties over Tailwind `dark:` variant?

The `dark:` variant requires every component to duplicate its classes: `bg-white dark:bg-gray-900`.
As the component library grows, this creates two problems:

1. **Verbosity**: every new component must remember both variants — a maintenance burden, not a
   one-time cost.
2. **Semantics**: `bg-gray-900` is a colour value, not a meaning. `bg-surface` is a meaning whose
   value changes with the theme. Semantic names are more readable and more robust to palette
   changes.

With CSS vars, a component uses one class (`bg-surface`). Runtime theme switching is one line:
`document.documentElement.classList.toggle('dark')`. No rebuild, no page reload.

### Why no Figma?

Figma creates a second source of truth. Design drift — where Figma shows one thing and the code does
another — is a constant maintenance tax. Every Figma change requires a code update (or vice versa),
and without a dedicated designer to enforce the sync, it breaks quickly.

For a solo/small-team project, the cost of maintaining Figma sync outweighs its benefits:

- ASCII mocks are version-controlled, co-located with specs, and reviewed in the same PR
- Storybook provides the living component gallery that Figma would otherwise be used for
- The no-Figma workflow forces decisions to be made in code, where they actually live

### Why Keyrune instead of custom coloured circles?

Every MTG player recognises `{W}` `{U}` `{B}` `{R}` `{G}` as canonical symbols — they see them on
every card they own. Coloured circles lose the iconic semantics: the white mana symbol (sun) is
immediately understood; a white circle is ambiguous and requires text labels to communicate meaning.

Keyrune uses the official WotC symbol set in SVG/CSS font form. It handles edge cases (split costs
like `{W/U}`, colourless `{C}`, `{X}`, tap `{T}`) that a custom icon set would need to solve anyway.

---

## Trade-offs

**Benefits:**

- Single token source shared across web and mobile — no duplication or drift
- Runtime theme switching with zero changes to component code
- Semantic class names (`bg-surface`) are more meaningful and more stable than colour names
- Keyrune icons are immediately recognisable to the target audience
- No external tool dependency for design iteration
- Design decisions are version-controlled and reviewed in PRs

**Costs:**

- CSS vars are slightly less discoverable in JSX than explicit `dark:` classes
- Storybook must be set up before visual component iteration is possible
- `packages/tokens` must be built before `apps/web` or `packages/web-ui` can start
- Keyrune adds a CSS/SVG asset load (mitigated by its small size and cacheability)

**Risks:**

- Token names agreed here may not match what feels natural when building components
  - **Mitigation:** names are not committed in code yet — they will be finalised during Phase 4.1
    (`packages/tokens` scaffold). ADR to be updated then.
- Without Figma, no high-fidelity mockup to show stakeholders
  - **Mitigation:** Storybook serves as the live component gallery; ASCII mocks are sufficient for
    planning at this stage

---

## Evolution History

### 2026-05-30: Initial decision

- Decided after completing Phase 4.0 design documentation (PR #16)
- ASCII mocks created for all 7 screens — documented in `apps/docs/design/screens/`
- Visual identity defined: `#0f0e17` dark bg, `#faf9f4` light bg, amber `#f59e0b` accent, Outfit
  typeface, JetBrains Mono for numbers/stats
- All individual design decisions logged in `apps/docs/design/decisions.md`
- Status: architectural patterns locked, specific values (hex, spacing, type scale) will be refined
  during Phase 4.1 implementation

---

## References

- [Design Quick Reference](../design/DESIGN.md)
- [Visual Identity](../design/identity.md)
- [Design Decisions Log](../design/decisions.md)
- [Screen Mocks](../design/screens/)
- [Keyrune icon library](https://mana.andrewgioia.com)
- [ADR-0005: Package Boundaries and Dependency Graph](./0005-package-boundaries-and-dependency-graph.md)
- [ADR-0008: Mobile-First Design](./0008-mobile-first-web-design-principles.md)
