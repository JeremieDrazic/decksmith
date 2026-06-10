# ADR-0017: `packages/tokens` — Implementation Architecture

**Last Updated:** 2026-06-10 **Status:** Active **Context:** Decksmith

---

## Context

ADR-0015 established the strategic design system decisions (tokens package, CSS custom properties,
no-Figma). This ADR documents the **implementation architecture** of `packages/tokens` — the
concrete decisions made during Session A (Phase 4.0.5) after visually validating the design system
in a browser-rendered token preview.

Decisions made here:

1. Token hierarchy (2-layer vs 3-layer)
2. Output format for web (Tailwind v4 CSS) and mobile (JS objects)
3. Specific finalized token values (colours, typography, spacing, motion)
4. Contrast compliance strategy (WCAG AA)
5. Motion philosophy (two-mode system)
6. Design system section in Storybook
7. Style Dictionary deferred

---

## Current Decision

### 1. 2-Layer Token Hierarchy

We use a 2-layer system: **primitives → semantic**. No component-level tokens at this stage.

```
packages/tokens/src/
  primitives/    → raw TypeScript constants (hex values, px values, durations)
  semantic/      → maps primitives to roles (bg, surface, accent…)
  web/           → CSS file consumed by apps/web via @import
  native/        → flat JS objects for apps/mobile (Phase 14)
  index.ts       → re-exports everything
```

Component tokens (e.g. `card-bg`, `btn-primary-bg`) are introduced on-demand if a pattern repeats
across 3+ components — never preemptively.

**Why 2-layer and not 3:** 3-layer systems serve large teams with hundreds of stable components.
Before having any components, component tokens create overhead without benefit. The rule "3
repetitions before abstracting" applies here as everywhere.

### 2. Dual Output Format — No Style Dictionary (yet)

`packages/tokens` outputs two formats from the same TypeScript source:

| Output                | File              | Consumer                 |
| --------------------- | ----------------- | ------------------------ |
| CSS custom properties | `web/tokens.css`  | `apps/web` via `@import` |
| JS flat objects       | `native/index.ts` | `apps/mobile` (Phase 14) |

**Web — Tailwind v4 `@theme`:**

```css
/* packages/tokens/src/web/tokens.css */
@import 'tailwindcss';

@theme {
  --color-bg: #0f0e17;
  --color-surface: #1a1827;
  --color-accent: #e8b84b;
  /* … */
}
```

Tailwind v4 reads `@theme` and generates utility classes (`bg-bg`, `text-accent`, etc.)
automatically. No JavaScript preset object needed — unlike Tailwind v3.

**Mobile — flat JS objects:**

```ts
/* packages/tokens/src/native/index.ts */
export const tokens = {
  color: {
    bg: '#0f0e17',
    surface: '#1a1827',
    accent: '#e8b84b',
  },
  // …
};
```

**Style Dictionary** (source → multi-target transforms) is explicitly deferred to Phase 14 (ADR to
be created then). The export-dual approach is sufficient for phases 4–13.

### 3. Finalised Token Values

#### Colours — Semantic (dark / light)

| Token            | Dark                     | Light                   |
| ---------------- | ------------------------ | ----------------------- | --------------------------------------------------------------- |
| `bg`             | `#0f0e17`                | `#faf9f4`               |
| `surface`        | `#1a1827`                | `#ffffff`               |
| `surface-raised` | `#232135`                | `#f2f0e6`               |
| `border`         | `#2e2b47`                | `#d5d0be`               |
| `border-subtle`  | `#232135`                | `#e8e5d8`               |
| `text`           | `#f0eef8`                | `#0f0e17`               |
| `text-muted`     | `#a8a2cc`                | `#524d80`               |
| `text-faint`     | `#524d80`                | `#7b75a8`               |
| `accent`         | `#e8b84b`                | `#5b4fcf`               | Dark: amber · Light: violet                                     |
| `accent-hover`   | `#c49a1a`                | `#4a3db0`               |                                                                 |
| `accent-subtle`  | `rgba(232,184,75, 0.12)` | `rgba(91,79,207, 0.08)` |                                                                 |
| `accent-border`  | `rgba(232,184,75, 0.3)`  | `rgba(91,79,207, 0.25)` |                                                                 |
| `accent-text`    | `#e8b84b`                | `#3d319a`               | Darker in light mode — WCAG AA ✅                               |
| `on-accent`      | `#0f0e17`                | `#ffffff`               | Mode-specific: dark on amber, white on violet                   |
| `brand`          | `#e8b84b`                | `#c49a1a`               | Decorative only — logo, ornaments, separators                   |
| `surface-hover`  | `#2a2840`                | `#ede9d8`               | Interactive surface on hover                                    |
| `border-focus`   | `#e8b84b`                | `#5b4fcf`               | Focus ring — matches accent per mode                            |
| `error`          | `#ef4444`                | `#ef4444`               |                                                                 |
| `error-subtle`   | `rgba(239,68,68,0.12)`   | `rgba(239,68,68,0.08)`  | Error field background                                          |
| `error-text`     | `#ef4444`                | `#b91c1c`               | Error message text — WCAG AA ✅                                 |
| `success`        | `#22c55e`                | `#22c55e`               |                                                                 |
| `success-subtle` | `rgba(34,197,94,0.12)`   | `rgba(34,197,94,0.08)`  |                                                                 |
| `success-text`   | `#22c55e`                | `#15803d`               | WCAG AA ✅                                                      |
| `warning`        | `#f59e0b`                | `#d97706`               | Distinct from `accent` (`#e8b84b` golden — `warning` is orange) |
| `warning-subtle` | `rgba(245,158,11,0.12)`  | `rgba(217,119,6,0.08)`  |                                                                 |
| `warning-text`   | `#f59e0b`                | `#92400e`               | WCAG AA ✅                                                      |
| `info`           | `#5b9cf6`                | `#2563eb`               | **Never substitute `mtg-blue` — different semantic meaning**    |
| `info-subtle`    | `rgba(91,156,246,0.12)`  | `rgba(37,99,235,0.08)`  |                                                                 |
| `info-text`      | `#5b9cf6`                | `#1d4ed8`               | WCAG AA ✅                                                      |

`accent-text` is darker in light mode (`#3d319a`) to pass WCAG AA on parchment. `on-accent` is
mode-specific: dark text on amber button (luminance ~0.52, white would fail at 1.8:1), white text on
violet button (violet has luminance ~0.072, white passes at 5.4:1). `warning` (`#f59e0b`) and
`accent` dark (`#e8b84b`) are both amber-family but serve different purposes. `info` is a neutral UI
blue — never use `mtg-blue` in its place. `brand` is amber in both modes — decorative only, no
interactive role; in light mode it fails AA for text use (3.75:1).

#### Colours — WUBRG

| Token           | Value                                |
| --------------- | ------------------------------------ |
| `mtg-white`     | `#f5f0d8` (dark) / `#c8b96e` (light) |
| `mtg-blue`      | `#1a6eb5`                            |
| `mtg-black`     | `#160d22`                            |
| `mtg-red`       | `#cc2222`                            |
| `mtg-green`     | `#006e3c`                            |
| `mtg-colorless` | `#8fa3b0`                            |
| `mtg-multi`     | `#c9a84c`                            |

WUBRG tokens represent MTG colour identity — not UI states. `mtg-red` ≠ `error`.

#### Typography

- **Display + body:** Outfit — weights 400, 500, 600, 700, 800 (`--font-display`, `--font-body`)
- **Numbers, prices, stats:** JetBrains Mono — weights 400, 500, 600 (`--font-mono`)
- **Scale:** fluid clamp() via Utopia formula (320px → 1280px), xs → 6xl. `Heading` exposes xl →
  4xl; 5xl/6xl are tokens-only for exceptional cases (hero sections) via `className` override.
- **Line heights:** paired with type scale — tighten as size increases (display text needs less
  breathing room than body copy)

| Size | Leading |
| ---- | ------- |
| xs   | 1.5     |
| sm   | 1.5     |
| base | 1.6     |
| lg   | 1.5     |
| xl   | 1.4     |
| 2xl  | 1.3     |
| 3xl  | 1.2     |
| 4xl  | 1.1     |

- **Letter spacing:** `--tracking-tight: -0.02em` (headings) · `--tracking-normal: 0em` ·
  `--tracking-wide: 0.04em` (labels, overlines)
- **Loading:** self-hosted from `apps/web/public/fonts/`, `font-display: optional` (no FOUT)
- **Rule:** raw Tailwind type classes never appear in feature JSX — encapsulated in semantic
  components (`<Heading>`, `<Body>`, `<Label>`) — finalized in Session C (Phase 4.0.5)

#### Spacing

Standard Tailwind scale: `space-1` (4px) → `space-24` (96px). Gaps: 1, 2, 3, 4, 5, 6, 8, 10, 12, 16,
20, 24.

#### Border Radius

**Scale (reference):** `radius-sm` (4px) · `radius-md` (8px) · `radius-lg` (12px) · `radius-xl`
(16px) · `radius-2xl` (24px) · `radius-full` (9999px)

**Semantic roles (use in components):**

| Token                | Value  | Use cases                               |
| -------------------- | ------ | --------------------------------------- |
| `radius-interactive` | 8px    | Buttons, inputs, selects, toggles       |
| `radius-surface`     | 12px   | Cards, panels, popovers, dropdowns      |
| `radius-modal`       | 16px   | Modals, dialogs, drawers, bottom sheets |
| `radius-badge`       | 9999px | Pills, tags, avatars, mana indicators   |

**Rule:** Components always use a semantic role, never a scale token directly. Exception:
`radius-sm` (4px) for stamp/seal elements (MTG format badges, rarity chips) with an inline comment —
these intentionally feel printed/crisp.

#### Motion — Two-Mode Philosophy

| Mode                       | Duration  | Easing                        | Trigger                              |
| -------------------------- | --------- | ----------------------------- | ------------------------------------ |
| Micro (Direction A)        | 50–200ms  | `ease-out`                    | hover, focus, toggle, click feedback |
| Moments clés (Direction B) | 300–500ms | `ease-spring` / `ease-in-out` | modal, drawer, page nav, card add    |

```
--duration-instant: 50ms    /* click ripple */
--duration-fast:   100ms    /* hover, focus ring */
--duration-normal: 200ms    /* dropdown, tooltip */
--duration-slow:   350ms    /* modal, drawer */
--duration-page:   300ms    /* route navigation */
--duration-story:  500ms    /* ajout de carte, deck open */

--ease-out:    cubic-bezier(0, 0, 0.2, 1)
--ease-in:     cubic-bezier(0.4, 0, 1, 1)
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1)
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1)
```

#### Shadows

```
--shadow-sm:     0 1px 3px rgba(0,0,0,0.4)
--shadow-md:     0 4px 12px rgba(0,0,0,0.5)
--shadow-lg:     0 8px 24px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)
--shadow-accent: 0 0 16px rgba(232,184,75,0.2)   /* focus/active glow */
```

#### Z-Index Scale

```
--z-base:    0    /* contenu de base */
--z-raised:  10   /* cards en hover */
--z-dropdown: 100 /* menus, popovers */
--z-sticky:  200  /* header, sidebar */
--z-overlay: 300  /* backdrop modal */
--z-modal:   400  /* modals, dialogs */
--z-toast:   500  /* notifications */
--z-tooltip: 600  /* tooltips */
```

### 4. WCAG AA Contrast Rules

Critical pairings verified:

| Pair                                                  | Ratio   | Status | Rule                     |
| ----------------------------------------------------- | ------- | ------ | ------------------------ |
| `text` on `bg`                                        | 16.7:1  | ✅     | Corps, titres            |
| `text-muted` on `surface`                             | 7.2:1   | ✅     | Descriptions             |
| `on-accent` (`#0f0e17`) on `accent` dark (`#e8b84b`)  | 10.4:1  | ✅     | Button text (dark)       |
| `on-accent` (`#ffffff`) on `accent` light (`#5b4fcf`) | 5.4:1   | ✅     | Button text (light)      |
| `accent-text` (`#e8b84b`) on `bg` dark                | ~9.8:1  | ✅     | Links, prices (dark)     |
| `accent-text` (`#3d319a`) on `bg` light               | ~8.7:1  | ✅     | Links, prices (light)    |
| `error-text` (`#b91c1c`) on `bg` light                | ~9.4:1  | ✅     | Error messages (light)   |
| `success-text` (`#15803d`) on `bg` light              | ~7.0:1  | ✅     | Success messages (light) |
| `warning-text` (`#92400e`) on `bg` light              | ~10.4:1 | ✅     | Warning messages (light) |
| `info-text` (`#5b9cf6`) on `bg` dark                  | ~7.5:1  | ✅     | Info messages (dark)     |
| `info-text` (`#1d4ed8`) on `bg` light                 | ~6.4:1  | ✅     | Info messages (light)    |
| `text-faint` on `bg`                                  | 2.5:1   | ❌     | Decorative only          |

**Rule:** `text-faint` must never be used for essential readable content — overlines, separators,
and decorative section labels only. Any content the user must be able to read uses `text-muted` or
`text` minimum.

**Rule:** `brand` in light mode (`#c49a1a` on `#faf9f4` ≈ 2.9:1) fails AA for text — decorative
only, same restriction as `text-faint`. Dark mode is fine (9.8:1 on `#0f0e17`).

**Rule:** `on-accent` is mode-specific — `#0f0e17` on amber (dark), `#ffffff` on violet (light).
Never use white text on the amber button.

### 5. Design System Section in Storybook

The global Storybook instance (defined in ADR-0006) already includes
`packages/tokens/src/**/*.stories.@(ts|tsx)` in its stories glob.

The tokens package **must include a dedicated Design System section** in Storybook with stories for:

- Color palette (semantic + primitives + WUBRG), with pass/fail contrast ratios displayed
- Typography scale (Outfit + JetBrains Mono, all sizes and weights)
- Spacing and border radius scale (visual representation)
- Motion catalog (easing + duration demos, interactive hover)
- Shadow scale
- Z-index reference

This section serves as the living documentation of the design language — the equivalent of a style
guide, version-controlled and always in sync with the actual tokens.

---

## Rationale

**Why 2-layer over 3-layer:** Decksmith has no components yet. Component tokens require stable
components to abstract from — building the abstraction before the patterns exist leads to tokens
that don't match actual usage and must be refactored immediately.

**Why dual output over Style Dictionary:** Style Dictionary adds build pipeline complexity at a
stage where the tokens package doesn't exist yet. Export dual is 20 lines of TypeScript with no new
dependencies. The migration to Style Dictionary at Phase 14 is a well-understood, bounded task.

**Why Tailwind v4 `@theme` over a JS preset:** Tailwind v4's CSS-first configuration is simpler,
more explicit, and aligns with browser native CSS. A JS preset object requires a build step and
indirection; a CSS file with `@theme` is directly readable and debuggable.

**Why fluid type (clamp) over fixed breakpoints:** Fixed breakpoints require typography overrides at
every responsive breakpoint, spreading type decisions across many classes. Fluid type scales
continuously between viewport boundaries — one value, no overrides. The Utopia tool generates the
clamp formulas from two parameters (min/max viewport, min/max size) — deterministic and
reproducible.

**Why self-hosted fonts with `font-display: optional`:** Google Fonts introduces a third-party
network dependency, GDPR considerations, and potential FOUT. `font-display: optional` eliminates the
flash entirely: if the font is cached it appears; if not, the fallback is used without substitution.
No visual instability.

---

## Trade-offs

**Benefits:**

- Simple, no new build dependencies — TypeScript + CSS only
- Dual output is transparent and easy to audit
- Tailwind v4 `@theme` is readable and debuggable
- Storybook section gives instant visual feedback during development
- Contrast rules prevent accessibility regressions
- Motion system is explicit and consistently applied

**Costs:**

- Manual dual-output maintenance until Phase 14 (web + native stay in sync manually)
- Fluid type values must be generated via Utopia before Phase 4.1 scaffold
- `font-display: optional` means first-time visitors may see fallback font briefly

**Risks:**

- Token values may need adjustment once components are built in `packages/web-ui`
  - **Mitigation:** values are CSS vars — change once, applies everywhere; no component refactor
- Primitive scale may grow uncontrolled over time
  - **Mitigation:** new primitives require justification — semantic tokens always reference an
    existing primitive

---

## Evolution History

### 2026-06-10: Semantic radius roles added

Four semantic radius roles added to `@theme` in `tokens.css`:

- `radius-interactive` (8px / 0.5rem) — buttons, inputs, selects, toggles
- `radius-surface` (12px / 0.75rem) — cards, panels, popovers, dropdowns
- `radius-modal` (16px / 1rem) — modals, dialogs, drawers
- `radius-badge` (9999px) — pills, tags, avatars, mana indicators

Rule: components use semantic roles, never scale tokens directly. Exception: `radius-sm` (4px) for
stamp/seal elements (MTG format badges, rarity chips) with an inline comment.

Scale tokens (`radius-sm` through `radius-full`) remain in `@theme` as reference values — they
define the scale but are not intended for direct use in components.

### 2026-06-10: Violet as light mode accent + brand token + primitive renaming

- **Light mode accent changed**: `accent` light is now violet (`#5b4fcf`), not amber. Reason: amber
  (`#c49a1a`) on parchment (`#faf9f4`) = 3.75:1 — fails WCAG AA for interactive elements. Violet is
  from the same purple family as existing muted text, more saturated. New contrast: `#5b4fcf` on
  `#faf9f4` = 5.2:1 (AA ✓), white `on-accent` on violet = 5.4:1 (AA ✓).

- **`brand` token added**: amber is preserved as a decorative-only token (`brand`). Light:
  `#c49a1a`, dark: `#e8b84b`. Fails AA in light mode for text (3.75:1) — decorative use only (logo,
  ornaments, `─────◈─────` separators). Dark mode is AAA (9.8:1).

- **`on-accent` split**: was a single `#0f0e17`. Now mode-specific: `#ffffff` on violet (light),
  `#0f0e17` on amber (dark). Both pass AA.

- **`shadow-accent` made dynamic**: moved from static `@theme` (hardcoded amber glow) to
  `:root`/`.dark` blocks — violet glow in light, amber glow in dark.

- **`color-scheme` added**: `:root { color-scheme: light }` and `.dark { color-scheme: dark }` —
  ensures native browser UI elements (scrollbars, form controls) respect the active theme.

- **`prefers-reduced-motion` added**: `@media (prefers-reduced-motion: reduce)` block resets all
  `--duration-*` tokens to `0ms`. Components read duration tokens — no per-component override
  needed.

- **Primitive naming refactored**: removed all `dark*` / `light*` mode-prefix naming from
  primitives. New naming scheme uses pure color descriptors:
  - `ink*` scale (950→50) for dark purple backgrounds, surfaces, text
  - `cream*` scale (0→400) for warm light backgrounds
  - `amber400`/`amber500`/`amber600`/`amber700` for the amber family
  - `violet500`/`violet600`/`violet700` for the violet family
  - `mtgWhiteCream` / `mtgWhiteGold` replacing `mtgWhiteDark` / `mtgWhiteLight`
  - Status alphas as `error12`/`error08` etc. (opacity-named, not mode-named) The semantic layer
    still carries the mode distinction — primitives are pure color values.

### 2026-06-08: Interactive and status tokens added

Added during session.end review — tokens missing from initial Session A pass:

- `surface-hover` — interactive surface state (hover on card, list item, menu item)
- `border-focus` — accessibility focus ring (same value as `accent`, separate token for intent)
- Full triplets for all status states: `error-subtle` + `error-text`, `success-subtle` +
  `success-text`, `warning` + `warning-subtle` + `warning-text`, `info` + `info-subtle` +
  `info-text`
- Rule added: `info` ≠ `mtg-blue` — different semantic meaning, never substitute
- Rule added: `warning` (`#f59e0b` orange-amber) ≠ `accent` (`#e8b84b` golden) — visually similar
  family but distinct purposes
- All new light-mode text variants verified WCAG AA

### 2026-06-08: Initial decision

- Decided during Session A (Phase 4.0.5) — visual validation in `token-preview.html`
- Shifted accent color from Tailwind amber-500 (`#f59e0b`) to golden `#e8b84b` — more doré, less
  orange
- Introduced `on-accent` and `accent-text` tokens for contrast compliance
- Motion system: Direction A (micro, 50–200ms) + Direction B (moments clés, 300–500ms)
- Dual output format selected; Style Dictionary deferred to Phase 14
- Tailwind v4 `@theme` CSS file confirmed as web output format
- Typography: fluid type (clamp via Utopia) confirmed; fixed breakpoints rejected
- Storybook design system section requirement added

---

## References

- [ADR-0015: Design System Architecture](./0015-design-system-architecture.md)
- [ADR-0006: Testing Strategy — Storybook](./0006-testing-strategy-with-vitest.md)
- [Token Preview](../design/token-preview.html)
- [Utopia fluid type scale generator](https://utopia.fyi)
- [Tailwind v4 CSS-first config](https://tailwindcss.com/docs/v4-upgrade)
- [ADR for Style Dictionary (Phase 14)](./0014-mobile-setup.md) — to be created
