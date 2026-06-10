# Design System — Quick Reference

_This file is @imported in CLAUDE.md as session context. Keep it short. Full details in the files
linked below._

> **Status:** `packages/tokens` complete — Session A values + violet/brand additions (ADR-0017).
> `packages/web-ui` not yet scaffolded — Phase 4.5.

---

## Key Values

| Token          | Dark mode | Light mode | Notes                                                         |
| -------------- | --------- | ---------- | ------------------------------------------------------------- |
| Background     | `#0f0e17` | `#faf9f4`  | Warm purple-black / parchment                                 |
| Surface        | `#1a1827` | `#ffffff`  |                                                               |
| Surface raised | `#232135` | `#f2f0e6`  |                                                               |
| Accent         | `#e8b84b` | `#5b4fcf`  | Amber (dark) / Violet (light) — buttons, active states        |
| Accent hover   | `#c49a1a` | `#4a3db0`  |                                                               |
| Accent text    | `#e8b84b` | `#3d319a`  | Colored text — passes WCAG AA in both modes                   |
| On accent      | `#0f0e17` | `#ffffff`  | Text ON accent button — dark on amber, white on violet        |
| Brand          | `#e8b84b` | `#c49a1a`  | Amber — decorative only (logo, ornaments, dividers)           |
| Text           | `#f0eef8` | `#0f0e17`  |                                                               |
| Text muted     | `#a8a2cc` | `#524d80`  |                                                               |
| Text faint     | `#524d80` | `#7b75a8`  | Décoratif uniquement — ne pas utiliser pour contenu essentiel |

**Typography:** Outfit 400/500/600/700/800 (display + body) · JetBrains Mono 400/500/600 (nombres,
prix, stats) · Self-hosted, `font-display: optional`

---

## Semantic Token Names (`packages/tokens`)

```
bg · surface · surface-raised · surface-hover · border · border-subtle · border-focus
text · text-muted · text-faint
accent · accent-hover · accent-subtle · accent-border · accent-text · on-accent · brand
mtg-white · mtg-blue · mtg-black · mtg-red · mtg-green · mtg-colorless · mtg-multi
error · error-subtle · error-text
success · success-subtle · success-text
warning · warning-subtle · warning-text
info · info-subtle · info-text
shadow-sm · shadow-md · shadow-lg · shadow-accent
z-base · z-raised · z-dropdown · z-sticky · z-overlay · z-modal · z-toast · z-tooltip
radius-interactive · radius-surface · radius-modal · radius-badge
```

> `info` ≠ `mtg-blue` — neutral UI state vs MTG color identity, never substitute one for the other.

---

## Token Architecture (`packages/tokens`)

```
primitives/  → constantes TS (hex, px, ms)
semantic/    → rôles (bg, surface, accent…)
web/         → tokens.css avec @theme { … } pour Tailwind v4
native/      → objets JS plats pour React Native (Phase 14)
```

Tailwind v4 lit `@theme` et génère les classes utilitaires automatiquement — pas de preset JS.

---

## Motion System

| Mode             | Durée     | Easing        | Usage                                            |
| ---------------- | --------- | ------------- | ------------------------------------------------ |
| Micro (A)        | 50–200ms  | `ease-out`    | hover, focus, toggle, click feedback             |
| Moments clés (B) | 300–500ms | `ease-spring` | modal, drawer, ajout de carte, ouverture builder |
| Navigation       | 300ms     | `ease-in-out` | transitions de route                             |

---

## Non-Negotiable Rules

| Rule                                                                 | Why                                                                                                        |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Semantic tokens only — never hardcoded hex                           | Theming, consistency, single source of truth                                                               |
| Mana symbols via Keyrune SVG (`{W}{U}{B}{R}{G}`)                     | Canonical MTG icons — every player recognises them                                                         |
| Theme via `.dark` on `<html>`, not `dark:` variant                   | Runtime switching, no class proliferation in JSX                                                           |
| MTG tokens separate from semantic tokens                             | `mtg-red` ≠ `error` — different semantic meaning                                                           |
| `on-accent` is mode-specific — dark on amber, white on violet        | Contrast-driven: white on `#e8b84b` = 1.8:1 (fails); dark on `#5b4fcf` = 1.1:1 (fails)                     |
| `brand` (amber) is decorative only in light mode                     | Interactive accent is violet — amber reserved for ornamental use                                           |
| `brand` text fails AA in light mode (`#c49a1a` on `#faf9f4` ≈ 2.9:1) | Dark mode is fine (9.8:1) but light mode fails — treat like `text-faint`, never for readable content       |
| `text-faint` for decoration only                                     | 2.5:1 ratio — fails AA for readable content                                                                |
| Raw Tailwind type classes never in feature JSX                       | Encapsulated in `<Heading>`, `<Body>`, `<Label>`                                                           |
| Semantic radius tokens in components — never scale tokens directly   | `radius-interactive` / `radius-surface` / `radius-modal` / `radius-badge` — one rule per context, no drift |
| Exception: `radius-sm` for stamp/seal elements only                  | MTG format badges, rarity chips — requires inline comment                                                  |
| Design system section required in Storybook                          | Living style guide, always in sync with tokens                                                             |

---

## Search Patterns (3 distinct contexts)

| Trigger               | Pattern           | Behaviour                                    |
| --------------------- | ----------------- | -------------------------------------------- |
| Header search bar     | Popover/spotlight | Grouped results: CARTES / DECKS / COLLECTION |
| Sidebar search icon   | Page `/search`    | Full filters, advanced search                |
| Deck builder card add | Slide-over        | Keeps deck context visible                   |

---

## Navigation Patterns

- **Desktop:** Collapsed icon sidebar (expandable) — persistent left rail
- **Mobile:** Bottom navigation bar — 4–5 icons, no text labels

---

## Full Documentation

- [identity.md](./identity.md) — full palette, typography scale, MTG touches
- [decisions.md](./decisions.md) — all design decisions with rationale
- [token-preview.html](./token-preview.html) — preview visuel des tokens (ouvrir dans le navigateur)
- [screens/](./screens/) — ASCII mocks: auth, deck-list, deck-builder, collection, card-search,
  card-detail, settings
- [ADR-0015](../adr/0015-design-system-architecture.md) — architectural decisions (tokens, theming,
  Keyrune, no-Figma)
- [ADR-0017](../adr/0017-packages-tokens-architecture.md) — implémentation de `packages/tokens`
  (valeurs finales, hiérarchie, motion, contraste)
