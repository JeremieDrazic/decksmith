# Decksmith Design System

A complete UI kit and design system for **Decksmith** — a personal Magic: The Gathering
deck-building and collection tool with a focus on craft, structure, and iteration. The system is
built to feel like the hobby itself: **warm, tactile, crafted** — _MTG Arena × Linear_, never a flat
corporate SaaS.

> **Sources.** This system was reconstructed from the Decksmith monorepo:
>
> - Repo: https://github.com/JeremieDrazic/decksmith
> - Design tokens: `packages/tokens/src/web/tokens.css` (Tailwind v4 `@theme`, translated here to
>   plain CSS custom properties so any consumer can use them)
> - Design docs: `apps/docs/design/` — `identity.md`, `DESIGN.md`, `decisions.md`, and the ASCII
>   screen mocks under `screens/` (auth, deck-list, deck-builder, collection, card-search, …)
>
> At capture time the repo's `packages/web-ui` was scaffolded but had **no component source yet**,
> so every component here is an original build that faithfully implements the documented tokens,
> rules, and screen specs. Explore the repo to go deeper or to reconcile with future component code.

---

## Index — what's in this project

| Path                     | What                                                                                                          |
| ------------------------ | ------------------------------------------------------------------------------------------------------------- |
| `styles.css`             | Global entry point — `@import` manifest only. Consumers link this one file.                                   |
| `tokens/`                | `colors.css` · `typography.css` · `spacing.css` · `radius.css` · `motion.css` · `fonts.css` · `base.css`      |
| `guidelines/`            | Foundation specimen cards (Colors, Type, Spacing, Brand) for the Design System tab                            |
| `components/core/`       | Button, IconButton, Badge, Avatar, Card, Input, Select, Switch, Checkbox, Heading, Body, Label                |
| `components/feedback/`   | Dialog, Toast, Tooltip                                                                                        |
| `components/mtg/`        | Mana, ManaCost, ColorIdentity, FormatBadge, RarityDot, CoverageStamp, CardThumb, DeckCard, ManaCurve, StatRow |
| `ui_kits/decksmith-web/` | Interactive recreation: login → dashboard, deck list, deck builder, collection, card search                   |
| `assets/`                | `logomark.svg` (amber ◈ diamond mark)                                                                         |
| `SKILL.md`               | Agent-Skill manifest for use in Claude Code                                                                   |

Theme switching is driven by a **`.dark` class on `<html>`** — light is the `:root` default
(parchment), dark adds the class (warm purple-black). Never a Tailwind `dark:` variant.

---

## Content fundamentals — how Decksmith writes

Decksmith's voice is that of a **craftsperson's workbench**, not a marketing site. The product
README sets the tone: _"building decks deliberately"_, _"print correctness over convenience"_,
_"craft"_.

- **Tone:** calm, precise, hobbyist-warm. It respects the player's intelligence and their
  collection. Confident but never hype-y. "Build decks deliberately." "Where your collection stands
  today."
- **Person:** addresses the user directly as **you** ("your collection", "Filter my decks"), and the
  app speaks in the first person for the user's own things ("My decks", "My collection").
- **Casing:** **Sentence case** for headings, labels, and buttons ("New deck", "My decks", "Card
  search") — not Title Case. Mono labels/eyebrows are UPPERCASE with wide tracking (e.g.
  `COMMANDER`, `MANA CURVE`).
- **Numbers are first-class.** Card counts, prices, coverage %, CMC, quantities — always JetBrains
  Mono. Prices show currency (`142 €`, `$1,284`). Coverage shows a stamp (`✓ 87%`).
- **MTG literacy assumed.** Uses real terms: Commander, CMC/mana value, color identity, WUBRG,
  mythic, proxy sheet, Scryfall. Mana costs render as **symbols**, never `"2UB"`.
- **No emoji.** The only glyphs used decoratively are the brand diamond **◈** and the MTG separator
  `─────◈─────`. Status uses crisp stamps `✓ ⚠ ✗`.
- **Microcopy examples:** "Build decks deliberately." · "Forgot password?" · "Add cards" · "need"
  (missing-card tag) · "Imported 38 cards from text" · "Coverage dropped below 70%".

---

## Visual foundations

**Mood.** Warm-dark, depth, color identity, craft. The differentiators: a **warm purple-black**
background (`#0f0e17`, never pure black or cool grey), an **amber brand + violet accent** pairing no
other MTG tool uses, and cards with real **tactile depth**.

**Color.** Two families that never mix: **semantic** tokens (bg, surface, accent, status…) and **MTG
color identity** (WUBRG). The interactive accent is _mode-specific by design_ — **amber in dark**
(warm, crafted), **violet in light** (contrast on parchment). `on-accent` flips to match (dark text
on amber, white on violet). Brand amber is **decorative only** — it fails AA on parchment, so it's
reserved for the logo, ornaments, and separators. `text-faint` is decoration only (fails AA).

**Type.** A single family for UI — **Outfit** (400–800) for display and body, kept consistent so the
interface feels unified — with **JetBrains Mono** (400–600) for every number, price, stat, and
label. Display headings tighten tracking (`-0.02em`); mono labels widen it (`+0.04em`) and
uppercase.

**Spacing.** Strict 4px grid (4 → 128). Sections breathe; not everything sits at the same visual
weight — strong hierarchy is a core principle.

**Corners & cards.** Semantic radius roles only: interactive 8px, surface 12px, modal 16px, badge
full. **Exception:** 4px stamp corners for format badges, rarity chips, and coverage stamps — these
read as crisp/printed, not rounded. Cards = `surface` fill, subtle border, inner highlight
(`shadow-inset`) for depth, and on hover they **lift 2px with an amber/violet accent glow**.

**Imagery & texture.** Deck cards use **commander artwork blurred as a background** under a dark
bottom-up gradient (MTG Arena style); when real Scryfall art isn't available a **color-identity
gradient** stands in (derived from WUBRG). Surfaces carry a **subtle SVG grain** at 2–3% opacity for
a printed, tactile feel. Imagery skews **warm and saturated**, never cold or flat.

**Borders & shadows.** Hairline `border-subtle` for dividers, `border` for definition,
`border-focus` (amber/violet) for focus rings. Components use semantic shadow roles — never the raw
scale: `shadow-popover` (tooltips/dropdowns), `shadow-card` (cards/panels/menus), `shadow-overlay`
(modals/drawers). `shadow-accent` is the mode-specific hover glow (violet light, amber dark).
Standard card hover: `shadow-card + shadow-accent`. Scale tokens (`shadow-sm/md/lg`) exist as a
reference only.

**Motion.** Two modes. **Micro** (50–200ms, `ease-out`): hover, focus, toggle, press. **Key
moments** (300–500ms, `ease-spring`): modal/drawer/slide-over open, card add, builder. Navigation is
300ms `ease-in-out`. **Hover** lifts + glows; **press** nudges down 1px. All durations collapse to
0ms under `prefers-reduced-motion`.

---

## Iconography

- **UI icons — Lucide.** The product standardizes on Lucide (pairs with shadcn). The UI kit ships a
  small set of Lucide-style stroke icons (24×24, stroke 2, round joins) inline in
  `ui_kits/decksmith-web/icons.jsx` — dashboard, decks (layers), collection, search, settings
  (gear), plus, grid/list, filter, chevron, bell, edit, box, warning, trash, copy, more. To go
  further, add Lucide from CDN or `lucide-react` in production.
- **MTG mana & set symbols — open-source icon fonts by Andrew Gioia.** Loaded from CDN in
  `tokens/fonts.css`: **mana-font** (`.ms .ms-w …`) for WUBRG + generic mana pips, and **keyrune**
  (`.ss …`) for set/rarity symbols. These are the canonical MTG glyphs — the `Mana` component
  renders them on WUBRG-tinted pills. **Never** colored circles or plain text for mana.
- **Brand glyphs.** The diamond **◈** (logo mark, `assets/logomark.svg`) and the section separator
  `─────◈─────`. No emoji anywhere.

---

## Usage

```html
<!-- 1. one stylesheet, .dark on <html> for dark mode -->
<html class="dark">
  <link rel="stylesheet" href="styles.css" />

  <!-- 2. the compiled bundle exposes every component on the namespace -->
  <script src="_ds_bundle.js"></script>
  <script type="text/babel">
    const { Button, DeckCard, ManaCost } = window.DecksmithDesignSystem_0a9b95;
  </script>
</html>
```

All component styling reads CSS custom properties, so flipping `.dark` re-themes everything with no
prop changes. Compose primitives — never re-implement a Button inside a screen.

---

## Caveats & substitutions

- **Fonts load from Google Fonts**, not bundled binaries — the production app self-hosts Outfit &
  JetBrains Mono from `apps/web/public/fonts/`. Swap `tokens/fonts.css` `@import`s for local
  `@font-face` rules if you have the licensed `.woff2` files.
- **Mana/Keyrune** are loaded from jsDelivr CDN. (html-to-image screenshots can't capture icon-font
  glyphs, but they render correctly in a real browser / the Design System tab.)
- **No real card art.** Deck and card placeholders use color-identity gradients; pass an `art` URL
  (e.g. from Scryfall) to `DeckCard` / `CardThumb` for real imagery.
- Components are original builds matching the documented tokens & specs, since the repo's `web-ui`
  package had no source at capture time.
