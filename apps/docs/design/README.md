# Decksmith — Design System

_Created: 2026-03-30_

---

## Overview

Decksmith's design is **craft-first, not SaaS-first**. The visual identity draws from the tactile
world of physical Magic: The Gathering cards — warm materials, amber lighting, depth — not from the
flat corporate palettes of productivity tools.

The design system lives entirely in code:

```
ASCII mock (spec) → packages/tokens → Tailwind config → shadcn/ui → packages/web-ui
```

No Figma. Tokens are the single source of truth. Storybook replaces Figma for visual iteration.

---

## Files

### Identity & Architecture

- [identity.md](./identity.md) — Visual identity: palette, typography, navigation, MTG touches
- [decisions.md](./decisions.md) — Design decisions log (date, decision, rationale, alternatives)

### Screens

| Screen                            | File                                                 |
| --------------------------------- | ---------------------------------------------------- |
| Login / Register / Reset password | [screens/auth.md](./screens/auth.md)                 |
| Deck list                         | [screens/deck-list.md](./screens/deck-list.md)       |
| Deck builder                      | [screens/deck-builder.md](./screens/deck-builder.md) |
| Collection                        | [screens/collection.md](./screens/collection.md)     |
| Card search                       | [screens/card-search.md](./screens/card-search.md)   |
| Card detail                       | [screens/card-detail.md](./screens/card-detail.md)   |
| Settings                          | [screens/settings.md](./screens/settings.md)         |

Each screen file contains: desktop mock + mobile mock + interactions + components identified.

---

## Quick Reference

**Brand accent:** `#f59e0b` (amber) **Dark background:** `#0f0e17` (warm purple-black) **Light
background:** `#faf9f4` (warm off-white) **Font:** Outfit (display + body) · JetBrains Mono (stats,
prices) **Icons:** Lucide React (UI) · Keyrune (MTG mana symbols) **Theme switching:** CSS custom
properties + `.dark` class on `<html>`
