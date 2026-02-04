# Decksmith Product Specifications

## Product Vision

Decksmith is a focused, well-engineered workflow for Magic: The Gathering players who want to:

1. **Manage their card collection** with precision (specific editions, conditions, foil variants)
2. **Build and validate decks** across all MTG formats (Commander, Standard, Modern, etc.)
3. **Generate high-quality proxy sheets** for playtesting before purchasing cards

Unlike bloated all-in-one platforms, Decksmith prioritizes **clarity, configurability, and print
quality** over feature sprawl.

---

## Core Features

### Collection Management

- Track specific card editions with variants (foil/non-foil, condition tracking)
- Configurable inventory views (grid/table, custom columns, saved filters)
- User-defined tags and custom fields (e.g., physical location, trade status)
- Price tracking (TCGplayer USD, Cardmarket EUR) with collection valuation
- **3D card viewer** with rotation, zoom, and animated foil effects

### Deck Building

- **Configurable deck sections** (not hardcoded zones) with format templates
- Format validation (singleton, color identity, banlists via Scryfall)
- Coverage system: see which deck cards you own vs. need to proxy
- Deck statistics (mana curve, color distribution, average CMC)
- Deck cost calculator (total price to build with real cards)

### Scryfall Integration

- Daily bulk data sync (100k+ cards cached locally)
- Fast full-text search with autocomplete
- Advanced filters (color, CMC, rarity, set, legality)
- Price data included (updated daily)

### Proxy PDF Generation

- **Highly configurable** layouts (paper format, grid, margins, cut lines, DPI)
- Inspired by proxxied.com advanced options
- Worker-based async generation (BullMQ + Redis job queue)
- Live preview before generating
- Support for double-sided printing (card backs)

### Craft Guide

- Educational content: equipment recommendations, step-by-step tutorials
- Print quality tips, troubleshooting common issues
- Future: community-submitted reviews and tips

---

## Glossary

### Magic: The Gathering Terms

**Oracle ID** Unique identifier for a card's rules identity. Cards with the same Oracle ID have
identical gameplay rules, regardless of edition or artwork (e.g., all printings of "Lightning Bolt"
share the same Oracle ID).

**Card Print** A specific edition/variant of a card. Example: "Lightning Bolt from Alpha (foil)" is
a different print than "Lightning Bolt from M11 (non-foil)".

**Set Code** Three-letter abbreviation for a Magic set (e.g., LEA = Limited Edition Alpha, M11 =
Magic 2011).

**Collector Number** Unique number identifying a card's position within its set (e.g., 162/249).

**Foil** Holographic card variant with prismatic shine. Typically more valuable than non-foil
counterparts.

**Color Identity** In Commander format, the set of colors a card contributes to a deck (based on
mana symbols in cost and text box). Decks can only include cards matching their commander's color
identity.

**Singleton** Deck-building rule requiring max 1 copy of each card (except basic lands). Used in
Commander and other casual formats.

**Banlist** Format-specific list of cards that are illegal to play (too powerful or problematic).
Maintained by Wizards of the Coast and the Commander Rules Committee.

**CMC (Converted Mana Cost)** Total mana cost of a card (e.g., a card costing {2}{U}{U} has CMC 4).

### Application Terms

**Collection Entry** A user's owned card in their collection. Includes quantity, condition, foil
status, and optional custom fields.

**Condition** Physical state of a card: NM (Near Mint), LP (Lightly Played), MP (Moderately Played),
HP (Heavily Played), DMG (Damaged).

**Coverage** Percentage of a deck's cards that exist in the user's collection. Example: "You own
42/60 cards (70% coverage)".

**Deck Section** User-defined zone within a deck (e.g., "Mainboard", "Command Zone", "Ramp",
"Removal"). Sections can have validation rules (max cards, singleton, color restrictions).

**Proxy** Printed reproduction of a Magic card used for playtesting. Not legal in sanctioned
tournaments but widely accepted in casual play.

**Bleed Area** Extra margin around card edges (typically 3mm) to account for trimming imperfections
during cutting. Ensures critical content doesn't get cut off.

**Safe Zone** Inner margin (typically 5mm) where important text/icons should be placed to avoid
being obscured by sleeves or trim variations.

**DPI (Dots Per Inch)** Print resolution. Higher DPI = sharper images but larger file sizes.
Standard for proxies: 300 DPI. Professional: 600-1200 DPI.

---

## Non-Goals (MVP Scope)

To maintain focus and avoid feature creep, Decksmith **explicitly does not**:

- ❌ **Tournament organization** (pairings, standings, etc.)
- ❌ **Gameplay tracking** (life totals, match history)
- ❌ **Social features** (forums, messaging, friend lists)
- ❌ **Trade marketplace** (buying/selling cards)
- ❌ **Price speculation tools** (price history charts, market trends)
- ❌ **Card grading/authentication** (PSA-style condition verification)
- ❌ **Multi-user collaboration** (shared decks, real-time editing)

These features may be considered post-MVP based on user demand.

---

## Target Users

1. **Competitive playtesters** who need to proxy expensive decks before committing to purchases
2. **Casual Commander players** managing large collections and multiple decks
3. **Budget-conscious players** who want high-quality proxies for kitchen-table Magic
4. **Collectors** tracking specific editions, conditions, and valuations

---

## Success Metrics

### MVP Goals

- Users can manage a 1000+ card collection with custom organization
- Users can build a 100-card Commander deck with full validation in < 15 minutes
- Users can generate a print-ready PDF (60 cards, 300 DPI) in < 60 seconds
- 3D card viewer loads in < 2 seconds on desktop

### Quality Bars

- All prices updated daily (< 24h staleness)
- Search autocomplete responds in < 200ms
- PDF generation success rate > 95% (retry failures automatically)
- Zero downtime during Scryfall bulk sync

---

## Architecture Principles

**See [CLAUDE.md](/CLAUDE.md) for detailed architectural rules.**

Key principles:

- Separation of concerns (API ≠ domain logic)
- Explicit data contracts (DTOs from `packages/schema`)
- Deterministic behavior (no hidden side effects)
- Minimal coupling, minimal magic

---

## Related Documentation

- **Architecture Decision Records:** [docs/adr](/docs/adr)
- **Data Model:** [data-model.md](./data-model.md)
- **Feature Specs:**
  - [Collection Management](./collection.md)
  - [Deck Management](./deck-management.md)
  - [Card Search (Scryfall)](./card-search.md)
  - [PDF Generation](./pdf-generation.md)
  - [Pricing](./pricing.md)
  - [User Preferences](./user-preferences.md)
  - [User Auth](./user-auth.md)
  - [Craft Guide](./craft-guide.md)
