# Design System — Quick Reference

_This file is @imported in CLAUDE.md as session context. Keep it short. Full details in the files
linked below._

> **Status:** Phase 4.0 documentation complete. `packages/tokens` and `packages/web-ui` not yet
> built. Specific values (exact colours, spacing scale, component APIs) will be refined during Phase
> 4.1 implementation — treat this as current best thinking, not locked spec.

---

## Key Values

| Token        | Dark mode | Light mode | Notes                          |
| ------------ | --------- | ---------- | ------------------------------ |
| Background   | `#0f0e17` | `#faf9f4`  | Warm purple-black / parchment  |
| Surface      | `#1a1827` | `#ffffff`  |                                |
| Accent       | `#f59e0b` | `#d97706`  | Amber — buttons, active states |
| Accent hover | `#d97706` | `#b45309`  |                                |

**Typography:** Outfit (body + display) · JetBrains Mono (numbers, prices, stats, card counts)

---

## Semantic Token Names (`packages/tokens`)

```
bg · surface · surface-raised · border · text · text-muted · text-faint
accent · accent-hover · accent-subtle · accent-border
mtg-white · mtg-blue · mtg-black · mtg-red · mtg-green · mtg-colorless · mtg-multi
```

---

## Non-Negotiable Rules

| Rule                                                       | Why                                                |
| ---------------------------------------------------------- | -------------------------------------------------- |
| Semantic tokens only — never hardcoded hex                 | Theming, consistency, single source of truth       |
| Mana symbols via Keyrune SVG (`{W}{U}{B}{R}{G}`)           | Canonical MTG icons — every player recognises them |
| Theme via `.dark` on `<html>`, not `dark:` variant         | Runtime switching, no class proliferation in JSX   |
| MTG tokens separate from semantic tokens                   | `mtg-red` ≠ `error` — different semantic meaning   |
| Tailwind consumes `decksmithPreset` from `packages/tokens` | Single token source for web + mobile               |

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
- [screens/](./screens/) — ASCII mocks: auth, deck-list, deck-builder, collection, card-search,
  card-detail, settings
- [ADR-0015](../adr/0015-design-system-architecture.md) — architectural decisions (tokens, theming,
  Keyrune, no-Figma)
