---
name: decksmith-design
description: Use this skill to generate well-branded interfaces and assets for Decksmith — an MTG deck-building and collection app — for production or throwaway prototypes/mocks. Contains essential design guidelines, color & type tokens, fonts, assets, and a full UI kit of React components (core, feedback, and MTG-specific: mana symbols, deck cards, format stamps, mana curves).
user-invocable: true
---

Read the `readme.md` file within this skill, then explore the other available files. For wiring it
into a real codebase or for the two consumption modes, read `INTEGRATION.md`.

- **Tokens & styles:** `styles.css` (the one entry point) → `tokens/*.css`. Theme via a `.dark`
  class on `<html>`; light is the default. Never hardcode hex — use the CSS custom properties. For
  production/offline, swap the CDN fonts for `tokens/fonts-local.css` (see
  `assets/fonts/README.md`).
- **Components:** `components/core/`, `components/feedback/`, `components/mtg/`. Each has a `.jsx`
  source, a `.d.ts` props contract, and a directory card HTML. Two ways to use them:
  - _Mocks / static HTML_ → load `_ds_bundle.js` and read off the namespace:
    `const { Button, DeckCard, ManaCost } = window.DecksmithDesignSystem_0a9b95`.
  - _Production React_ → `import { Button } from './components/core/Button.jsx'` directly (the
    `.d.ts` give you types). Don't ship the bundle in a real app.
- **Full screens:** `ui_kits/decksmith-web/` is an interactive recreation (login, dashboard, deck
  list, deck builder, collection, card search) — read it to match real product layout & copy.

Hard rules that make output look like Decksmith: warm purple-black bg (never pure black/cool grey);
amber brand + mode-specific accent (amber in dark, violet in light); mana rendered as **Keyrune/mana
symbols**, never colored circles or plain text; MTG color tokens (`mtg-red`) are separate from
semantic tokens (`error`); 4px stamp corners for format/rarity badges; sentence-case copy; JetBrains
Mono for all numbers; no emoji.

If creating visual artifacts (slides, mocks, throwaway prototypes), copy the assets you need out and
produce static HTML files for the user to view. If working on production code, copy assets and read
the rules here to become an expert in designing with this brand.

If the user invokes this skill without other guidance, ask what they want to build, ask a few
clarifying questions, and act as an expert designer who outputs HTML artifacts _or_ production code,
depending on the need.
