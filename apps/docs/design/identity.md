# Visual Identity

_Updated: 2026-06-10_

---

## Mood & Direction

Decksmith is a tool for MTG players who care about their collection. The design should feel like the
hobby itself: **warm, tactile, crafted** — not like a corporate productivity app.

Reference points: MTG Arena (depth, card art, color identity) × Linear (clean, focused, fast).

The non-negotiable differentiator: **no flat corporate SaaS palette**. No pure black, no cool grey,
no blue primary CTA.

---

## What Makes This Not SaaS

1. **Warm-dark background** — purple-black tint (`#0f0e17`), not the cool grey of GitHub or the pure
   black of Linear
2. **Amber brand + violet accent** — amber (`#e8b84b`) is the brand identity color (logo, ornaments,
   dark mode buttons). Violet (`#5b4fcf`) is the light mode interactive accent. No major MTG tool
   uses either combination
3. **Cards with depth** — subtle inner shadow + amber border glow on hover
4. **Deck cards use commander artwork** as blurred background with dark gradient overlay (MTG Arena
   style)
5. **Mana symbols rendered as colored icons** — never plain text like "2UG"
6. **Subtle grain texture** on surfaces — CSS noise filter at 2–3% opacity
7. **Strong typographic hierarchy** — sections breathe, not everything at the same visual weight
8. **MTG section separators** — `─────◈─────` used as section dividers

---

## Colour Palette

### Semantic Tokens

| Token            | Dark (`.dark`) | Light (`:root`) | Usage                               |
| ---------------- | -------------- | --------------- | ----------------------------------- |
| `bg`             | `#0f0e17`      | `#faf9f4`       | Page background                     |
| `surface`        | `#1a1827`      | `#ffffff`       | Cards, panels                       |
| `surface-raised` | `#232135`      | `#f2f0e6`       | Elevated surfaces                   |
| `surface-hover`  | `#2a2840`      | `#ede9d8`       | Hover state on interactive surfaces |
| `border`         | `#2e2b47`      | `#d5d0be`       | Borders                             |
| `border-subtle`  | `#232135`      | `#e8e5d8`       | Dividers                            |
| `border-focus`   | `#e8b84b`      | `#5b4fcf`       | Focus ring                          |
| `text`           | `#f0eef8`      | `#0f0e17`       | Primary text                        |
| `text-muted`     | `#a8a2cc`      | `#524d80`       | Secondary text                      |
| `text-faint`     | `#524d80`      | `#7b75a8`       | Decorative only — fails AA          |

### Interactive Accent

Mode-specific. Dark mode: amber (warm, crafted feel). Light mode: violet (contrast on parchment).

| Token           | Dark        | Light        | Usage                             |
| --------------- | ----------- | ------------ | --------------------------------- |
| `accent`        | `#e8b84b`   | `#5b4fcf`    | Primary buttons, active states    |
| `accent-hover`  | `#c49a1a`   | `#4a3db0`    | Button hover                      |
| `accent-subtle` | amber @ 12% | violet @ 8%  | Subtle tint, selected backgrounds |
| `accent-border` | amber @ 30% | violet @ 25% | Focused borders, hover glow       |
| `accent-text`   | `#e8b84b`   | `#3d319a`    | Accent-colored text (WCAG AA ✓)   |
| `on-accent`     | `#0f0e17`   | `#ffffff`    | Text ON accent button             |

### Brand Amber (decorative only)

| Token   | Dark      | Light     | Usage                                          |
| ------- | --------- | --------- | ---------------------------------------------- |
| `brand` | `#e8b84b` | `#c49a1a` | Logo mark, ornaments, `─────◈─────` separators |

**Warning:** `brand` in light mode (`#c49a1a` on `#faf9f4`) = 3.75:1 — fails AA. Never use for
readable text. Decorative and ornamental use only (same rule as `text-faint`).

### Status Colours

| Token     | Dark      | Light     | Usage                 |
| --------- | --------- | --------- | --------------------- |
| `success` | `#22c55e` | `#22c55e` | Owned cards, coverage |
| `warning` | `#f59e0b` | `#d97706` | Partial coverage      |
| `error`   | `#ef4444` | `#ef4444` | Missing, errors       |
| `info`    | `#5b9cf6` | `#2563eb` | Informational         |

Each has a `-subtle` (tinted background) and `-text` (accessible text color) variant. See
`packages/tokens/src/semantic/colors.ts` for exact values. `info` ≠ `mtg-blue` — different semantic
meaning, never substitute one for the other.

### MTG Colour Identity (WUBRG)

Used for: deck colour indicators, mana cost symbols, colour distribution charts, filter dots.

| Colour         | Token           | Value                                |
| -------------- | --------------- | ------------------------------------ |
| White (Plains) | `mtg-white`     | `#f5f0d8` (dark) / `#c8b96e` (light) |
| Blue (Island)  | `mtg-blue`      | `#1a6eb5`                            |
| Black (Swamp)  | `mtg-black`     | `#160d22`                            |
| Red (Mountain) | `mtg-red`       | `#cc2222`                            |
| Green (Forest) | `mtg-green`     | `#006e3c`                            |
| Colorless      | `mtg-colorless` | `#8fa3b0`                            |
| Multicolour    | `mtg-multi`     | `#c9a84c`                            |

MTG colours represent the game's colour identity system — not UI states. `mtg-red` ≠ `error`.

---

## Typography

### Fonts

| Role           | Font           | Usage                                    |
| -------------- | -------------- | ---------------------------------------- |
| `font-display` | Outfit         | Headings, navigation, labels             |
| `font-body`    | Outfit         | Body text (same family, consistent feel) |
| `font-mono`    | JetBrains Mono | Stats, card counts, prices, mana costs   |

Both fonts are self-hosted from `apps/web/public/fonts/`, `font-display: optional` (no FOUT).

### Type Scale

| Token  | px  | Line height | Usage                    |
| ------ | --- | ----------- | ------------------------ |
| `xs`   | 12  | 1.5         | Badges, metadata, labels |
| `sm`   | 14  | 1.5         | Secondary body, captions |
| `base` | 16  | 1.6         | Primary body             |
| `lg`   | 18  | 1.5         | Lead text                |
| `xl`   | 20  | 1.4         | Sub-headings             |
| `2xl`  | 24  | 1.3         | Section headings         |
| `3xl`  | 30  | 1.2         | Page titles              |
| `4xl`  | 36  | 1.1         | Large headings           |

---

## Spacing

4px base grid: `4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64 / 80 / 96 / 128`

---

## Border Radius

### Semantic roles — use these in components

| Token                | Value  | Use cases                                           |
| -------------------- | ------ | --------------------------------------------------- |
| `radius-interactive` | 8px    | Buttons, inputs, selects, toggles, checkboxes       |
| `radius-surface`     | 12px   | Cards, panels, popovers, tooltips, dropdowns        |
| `radius-modal`       | 16px   | Modals, dialogs, drawers, bottom sheets             |
| `radius-badge`       | 9999px | Pills, tags, avatars, mana symbol backgrounds, dots |

**Rule:** components always use a semantic role, never a scale token directly. **Exception:**
`radius-sm` (4px) for stamp/seal elements — MTG format badges, rarity chips — with an inline
comment. These intentionally look crisp/printed, not rounded.

### Scale — reference only

| Token         | Value  |
| ------------- | ------ |
| `radius-sm`   | 4px    |
| `radius-md`   | 8px    |
| `radius-lg`   | 12px   |
| `radius-xl`   | 16px   |
| `radius-2xl`  | 24px   |
| `radius-full` | 9999px |

---

## Animation

Two-mode motion system. Direction A (micro interactions): 50–200ms, ease-out. Direction B (moments
clés): 300–500ms, ease-spring or ease-in-out.

| Token              | Value                             |
| ------------------ | --------------------------------- |
| `duration-instant` | 50ms                              |
| `duration-fast`    | 100ms                             |
| `duration-normal`  | 200ms                             |
| `duration-slow`    | 350ms                             |
| `duration-page`    | 300ms                             |
| `duration-story`   | 500ms                             |
| `ease-out`         | cubic-bezier(0, 0, 0.2, 1)        |
| `ease-spring`      | cubic-bezier(0.34, 1.56, 0.64, 1) |

`prefers-reduced-motion: reduce` resets all durations to 0ms via a media query in `tokens.css`.

---

## MTG-Specific Touches

Applied only where contextually relevant — never decorative noise.

| Element             | MTG touch                                                       |
| ------------------- | --------------------------------------------------------------- |
| Colour indicator    | Keyrune SVG icons `{W}{U}{B}{R}{G}` (official MTG symbols)      |
| Colour tints        | WUBRG tokens (`mtg-blue`, etc.) used for bg, text, tags, charts |
| Deck card           | Commander artwork blurred as background + dark gradient         |
| Mana cost           | Keyrune SVG symbols (coloured), not plain text                  |
| Format badge        | Styled stamp/seal                                               |
| Coverage indicator  | ✓ green / ⚠ amber / ✗ red — card-stamp style                    |
| Section separator   | `─────◈─────`                                                   |
| Foil card thumbnail | CSS shimmer gradient animation                                  |
| Card rarity         | Set symbol colour (common/uncommon/rare/mythic)                 |

---

## Navigation

### Desktop

Sidebar (collapsed by default, expandable on large screens):

```
┌──────┬──────────────────────────────────────────────────┐
│  ◈   │  top bar: logo + search + avatar                 │
├──────┤                                                  │
│  ⊞   │                                                  │
│  🃏  │           main content                           │
│  📦  │                                                  │
│  🔍  │                                                  │
│  ─   │                                                  │
│  ⚙   │                                                  │
└──────┴──────────────────────────────────────────────────┘

⊞  Dashboard
🃏  Decks
📦  Collection
🔍  Card Search
⚙   Settings
```

### Mobile

Bottom navigation bar (fixed):

```
┌─────────────────────────────────┐
│           content               │
├─────────────────────────────────┤
│  ⊞     🃏     📦     🔍     ⚙  │
└─────────────────────────────────┘
```

Touch targets: minimum 44px (WCAG AAA — ADR-0008).

---

## Icons

| Usage            | Library      | Notes                                            |
| ---------------- | ------------ | ------------------------------------------------ |
| UI icons         | Lucide React | Consistent with shadcn/ui, tree-shakeable        |
| MTG mana symbols | Keyrune      | CSS font / SVG sprites from mana.andrewgioia.com |
