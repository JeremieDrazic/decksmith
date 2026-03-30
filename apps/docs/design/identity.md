# Visual Identity

_Updated: 2026-03-30_

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
2. **Amber accent** — `#f59e0b`, used by no major MTG tool (Moxfield, Archidekt = blue/purple)
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

| Token            | Dark (`.dark`) | Light (`:root`) | Usage                |
| ---------------- | -------------- | --------------- | -------------------- |
| `bg`             | `#0f0e17`      | `#faf9f4`       | Page background      |
| `bg-subtle`      | `#161523`      | `#f0efe8`       | Alternate background |
| `surface`        | `#1c1b2e`      | `#ffffff`       | Cards, panels        |
| `surface-raised` | `#252338`      | `#f5f4ed`       | Elevated surfaces    |
| `border`         | `#2e2c42`      | `#e2e0d8`       | Borders              |
| `border-subtle`  | `#242234`      | `#eceae2`       | Dividers             |
| `text`           | `#e8e6f0`      | `#1a1826`       | Primary text         |
| `text-muted`     | `#7a7890`      | `#6b6880`       | Secondary text       |
| `text-faint`     | `#4a4860`      | `#9896a8`       | Placeholders, hints  |

### Brand Accent — Amber

| Token           | Value       | Usage                            |
| --------------- | ----------- | -------------------------------- |
| `accent`        | `#f59e0b`   | Primary buttons, active states   |
| `accent-hover`  | `#d97706`   | Button hover                     |
| `accent-subtle` | `#f59e0b18` | Subtle background tint           |
| `accent-border` | `#f59e0b40` | Focused borders, card hover glow |

### Semantic Colours

| Token     | Value     | Usage                 |
| --------- | --------- | --------------------- |
| `success` | `#22c55e` | Owned cards, coverage |
| `warning` | `#f59e0b` | Partial coverage      |
| `error`   | `#ef4444` | Missing, errors       |
| `info`    | `#3b82f6` | Informational         |

### MTG Colour Identity (WUBRG)

Used for: deck colour indicators, mana cost symbols, colour distribution charts, filter dots.

| Colour         | Token           | Value     | Tinted bg   |
| -------------- | --------------- | --------- | ----------- |
| White (Plains) | `mtg-white`     | `#f5e6c8` | `#f5e6c812` |
| Blue (Island)  | `mtg-blue`      | `#3b82f6` | `#3b82f612` |
| Black (Swamp)  | `mtg-black`     | `#a855f7` | `#a855f712` |
| Red (Mountain) | `mtg-red`       | `#ef4444` | `#ef444412` |
| Green (Forest) | `mtg-green`     | `#22c55e` | `#22c55e12` |
| Colorless      | `mtg-colorless` | `#94a3b8` | `#94a3b812` |
| Multicolour    | `mtg-multi`     | `#f59e0b` | `#f59e0b12` |

---

## Typography

### Fonts

| Role           | Font           | Usage                                    |
| -------------- | -------------- | ---------------------------------------- |
| `font-display` | Outfit         | Headings, navigation, labels             |
| `font-body`    | Outfit         | Body text (same family, consistent feel) |
| `font-mono`    | JetBrains Mono | Stats, card counts, prices, mana costs   |

Both fonts are served via Google Fonts.

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

| Token  | Value  | Usage                  |
| ------ | ------ | ---------------------- |
| `sm`   | 4px    | Badges, small elements |
| `md`   | 8px    | Buttons, inputs        |
| `lg`   | 12px   | Cards                  |
| `xl`   | 16px   | Large cards, panels    |
| `full` | 9999px | Pills, avatars         |

---

## Animation

| Token           | Value                             |
| --------------- | --------------------------------- |
| `duration-fast` | 100ms                             |
| `duration-base` | 200ms                             |
| `duration-slow` | 350ms                             |
| `ease-out`      | ease-out                          |
| `ease-spring`   | cubic-bezier(0.34, 1.56, 0.64, 1) |

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
