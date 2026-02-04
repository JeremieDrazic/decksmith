# Card Details Page

Comprehensive card information view with prints gallery, price history, and quick actions.

---

## Overview

The card details page provides in-depth information about a Magic: The Gathering card, including
oracle text, all available prints, price history, and usage across the user's decks and collection.
The page supports both **modal overlay** (for deck building context) and **full page route** (for
sharing and discovery).

**Route:** `/cards/:oracle_id`

**Example:** `/cards/8f8f15b1-8b1e-4f8e-9b5e-1a2b3c4d5e6f` (Lightning Bolt)

---

## Features

### Navigation Triggers

**Multi-trigger approach with context-aware behavior:**

| Context              | Trigger                  | Behavior                                       |
| -------------------- | ------------------------ | ---------------------------------------------- |
| **Deck builder**     | Click card name or image | Modal overlay (preserves editing context)      |
| **Search results**   | Click card name or image | Full page route (shareable URL)                |
| **Collection grid**  | Click card image         | Modal overlay                                  |
| **Autocomplete**     | Click result             | Adds card with default print (no details page) |
| **Right-click menu** | "View Details"           | Opens in modal or page based on context        |

**Design rationale:**

- Modal in deck builder avoids disrupting flow
- Full page in search enables deep linking and sharing
- Consistent with existing collection 3D viewer UX

---

## Page Layout

### Full Page Mode (`/cards/:oracle_id`)

**Desktop Layout (2-column with sticky sidebar):**

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER                                                      │
│ [← Back to Search]  Lightning Bolt         [Share] [♥ Save] │
└─────────────────────────────────────────────────────────────┘

┌──────────────────┬────────────────────────────────────────┐
│ LEFT SIDEBAR     │ MAIN CONTENT                           │
│ (sticky)         │                                        │
├──────────────────┼────────────────────────────────────────┤
│ CARD IMAGE       │ ORACLE TEXT                            │
│ [Large 300×420]  │ Lightning Bolt deals 3 damage to any   │
│                  │ target.                                │
│ MANA COST        │                                        │
│ {R}              │ FLAVOR TEXT (italic, muted)            │
│                  │ "The spark of genius shines brightest  │
│ TYPE LINE        │ right before it consumes you."         │
│ Instant          │ — Ral Zarek                            │
│                  │                                        │
│ SET INFO         │ LEGALITIES                             │
│ [LEA] #162       │ ✓ Commander: Legal                     │
│ Common           │ ✓ Modern: Legal                        │
│ 1993             │ ✗ Standard: Not Legal                  │
│                  │ ⚠ Vintage: Restricted                  │
│ QUICK ACTIONS    │ [Show All Formats ▾]                   │
│ [+ Add to Deck]  │                                        │
│ [+ Collection]   │ PRICE HISTORY (30 days)                │
│ [♥ Wishlist]     │ ┌──────────────────────────────────┐   │
│ [Share Link]     │ │      $1200 │          ╱╲         │   │
│ [External ▾]     │ │      $1000 │         ╱  ╲        │   │
│                  │ │       $800 │        ╱    ╲       │   │
└──────────────────┤ │       $600 │   ╱╲  ╱      ╲      │   │
                   │ │       $400 │  ╱  ╲╱        ╲     │   │
                   │ │       $200 │─╱              ╲──  │   │
                   │ └──────────────────────────────────┘   │
                   │ Min: $150 | Avg: $450 | Max: $1,200   │
                   │ [USD] [EUR]                            │
                   └────────────────────────────────────────┘

PRINTS GALLERY (full width below main content)
┌─────────────────────────────────────────────────────────────┐
│ ALL PRINTS (52 editions)                                    │
│ Sort: [Newest ▾] [Price ▾] [Rarity ▾]  View: [Grid] [List] │
├─────────────────────────────────────────────────────────────┤
│ ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐ │
│ │ LEA #162   │ │ M11 #146   │ │ DOM #152   │ │ M10 #152   │ │
│ │ [Image]    │ │ [Image]    │ │ [Image]    │ │ [Image]    │ │
│ │            │ │            │ │            │ │            │ │
│ │ 1993 • Cmn │ │ 2010 • Cmn │ │ 2019 • Cmn │ │ 2009 • Cmn │ │
│ │ Non-foil   │ │ Foil/NF    │ │ Non-foil   │ │ Non-foil   │ │
│ │ $1,200     │ │ $1.50 /    │ │ $0.10      │ │ $1.25      │ │
│ │            │ │ $3.50      │ │            │ │            │ │
│ │ [SELECT]   │ │ [SELECT]   │ │ [SELECT]   │ │ [SELECT]   │ │
│ └────────────┘ └────────────┘ └────────────┘ └────────────┘ │
└─────────────────────────────────────────────────────────────┘

IN YOUR COLLECTION & DECKS (full width)
┌─────────────────────────────────────────────────────────────┐
│ YOUR USAGE                                                  │
├─────────────────────────────────────────────────────────────┤
│ DECKS (3)                                                   │
│ • Atraxa Superfriends (1× in Mainboard)                     │
│ • Mono-Red Aggro (4× in Mainboard)                          │
│ • cEDH Primer (2× in Sideboard)                             │
│                                                             │
│ COLLECTION (12 total copies, $850 total value)              │
│ • LEA #162 NM (4×) — $1,200 ea = $4,800                     │
│ • M11 #146 LP (5×) — $1.50 ea = $7.50                       │
│ • DOM #152 NM (3×) — $0.10 ea = $0.30                       │
│                                                             │
│ [View All Instances →]                                      │
└─────────────────────────────────────────────────────────────┘
```

**Mobile Layout (single column, sticky actions bar):**

```
┌───────────────────────────────────┐
│ [←] Lightning Bolt      [⋮ Menu]  │
├───────────────────────────────────┤
│ CARD IMAGE (full width)           │
│ [Large card image, pinch to zoom] │
│                                   │
│ MANA COST: {R}                    │
│ TYPE: Instant                     │
│ SET: LEA #162 (Common, 1993)      │
├───────────────────────────────────┤
│ ORACLE TEXT                       │
│ Lightning Bolt deals 3 damage...  │
│                                   │
│ FLAVOR TEXT                       │
│ "The spark of genius..."          │
├───────────────────────────────────┤
│ LEGALITIES                        │
│ ✓ Commander  ✓ Modern             │
│ ✗ Standard   ⚠ Vintage            │
├───────────────────────────────────┤
│ PRICE HISTORY                     │
│ [Smaller chart, touch-friendly]   │
├───────────────────────────────────┤
│ ALL PRINTS (52)                   │
│ [Scrollable grid, 2 columns]      │
├───────────────────────────────────┤
│ YOUR USAGE                        │
│ 3 decks, 12 collection copies     │
└───────────────────────────────────┘

STICKY BOTTOM BAR
┌───────────────────────────────────┐
│ [+ Deck] [+ Collection] [♥] [⋯]   │
└───────────────────────────────────┘
```

---

## Detailed Sections

### 1. Card Image & Basic Info (Left Sidebar)

**Card Image:**

- Source: Scryfall `image_uris.large` or `image_uris.png` (high-res)
- Size: 300×420px on desktop, full width on mobile
- Interaction: Click to open lightbox (zoom/pan)
- Lazy loading: Load on demand to improve page speed
- Fallback: Placeholder if image unavailable

**Mana Cost:**

- Display: Rendered mana symbols (SVG icons)
- Format: `{R}` → [Red mana symbol]
- Source: `Card.mana_cost`

**Type Line:**

- Format: "Instant" or "Creature — Human Wizard"
- Source: `Card.type_line`
- Localized: Uses `CardPrint.localized_type` if language ≠ English

**Set Information:**

- Set icon + code (e.g., "[LEA]")
- Rarity (Common, Uncommon, Rare, Mythic)
- Release year
- Collector number

---

### 2. Oracle Text & Flavor (Main Column)

**Oracle Text:**

- Full card rules text
- Source: `Card.oracle_text`
- Localized: Uses `CardPrint.localized_text` if available
- Formatting: Preserve line breaks, bold keywords (e.g., **Flying**, **Trample**)

**Flavor Text:**

- Italic, muted color (#666)
- Source: `CardPrint.flavor_text` (print-specific)
- Attribution: Include artist credit if available

**Oracle ID:**

- Display: Short code or full UUID (collapsible)
- Purpose: Technical reference for advanced users

---

### 3. Legalities

**Format Legality Display:**

| Format     | Status          | Visual                             |
| ---------- | --------------- | ---------------------------------- |
| Legal      | Green checkmark | ✓ Commander: Legal                 |
| Not Legal  | Red X           | ✗ Standard: Not Legal              |
| Restricted | Yellow warning  | ⚠ Vintage: Restricted (max 1 copy) |
| Banned     | Red ban icon    | 🚫 Legacy: Banned                  |

**Formats to Display (Default):**

1. Commander (EDH)
2. Modern
3. Standard
4. Pioneer
5. Vintage
6. Legacy

**Expandable Section:**

- [Show All Formats ▾] button reveals 15+ formats
- Includes: Pauper, Historic, Alchemy, Explorer, Brawl, etc.
- Source: `Card.legalities` JSONB object

---

### 4. Price History Chart

**Chart Visualization:**

- Type: Line chart (time-series)
- Library: Recharts or Chart.js (React-compatible)
- Time ranges: 7d, 30d (default), 90d, 1y
- Data source: Daily snapshots from Scryfall sync

**Data Points:**

- USD price (default)
- EUR price (toggle)
- Foil vs non-foil (separate lines or toggle)

**Summary Stats:**

- Min price (with date)
- Max price (with date)
- Average price
- Current price
- Volatility indicator (% change over period)

**Interaction:**

- Hover: Show exact price + date tooltip
- Click data point: Jump to that print edition
- Toggle currency: Switch between USD/EUR

**Performance:**

- Cache chart data (5-minute TTL)
- Lazy load: Render only when scrolled into view
- Responsive: Adjust chart size for mobile

---

### 5. Prints Gallery

**Layout:**

- **Grid view (default):** Uniform card grid, 4 columns on desktop, 2 on mobile
- **List view:** Table with columns (Set, Rarity, Price, Foil, Actions)

**Grid Card Display:**

```
┌────────────────┐
│  [Card Image]  │  ← 63×88mm aspect ratio
│  (150×210px)   │
│                │
│ LEA #162       │  ← Set code + number
│ Common         │  ← Rarity
│ 1993           │  ← Release year
│ Non-foil       │  ← Foil availability
│ $1,200         │  ← Price (USD or EUR)
│                │
│ [SELECT]       │  ← Action button
└────────────────┘
```

**Sort Options:**

- Newest first (release date DESC)
- Oldest first (release date ASC)
- Price: Low to High
- Price: High to Low
- Alphabetical (set name)
- Rarity (Mythic → Common)

**Filter Options:**

- Foil availability (Foil only, Non-foil only, Both)
- Rarity (Common, Uncommon, Rare, Mythic)
- Set type (Core, Expansion, Masters, Promo)
- Price range (slider: $0 - $max)

**Interaction:**

- Click card image: Preview full image
- Click [SELECT]: Add to deck/collection with this print
- Hover: Show price trend sparkline

**Lazy Loading:**

- Initial load: First 12 prints
- Infinite scroll: Load 12 more on scroll
- Performance: Virtualized scrolling for 100+ prints

---

### 6. Deck & Collection Usage

**Purpose:**

- Show user's ownership and usage context
- Quick navigation to related decks/collection entries

**Decks Section:**

```
DECKS (3)
• Atraxa Superfriends (1× in Mainboard) [View Deck →]
• Mono-Red Aggro (4× in Mainboard) [View Deck →]
• cEDH Primer (2× in Sideboard) [View Deck →]
```

**Display:**

- Deck name (clickable link to `/decks/:deckId`)
- Quantity in deck
- Section (Mainboard, Sideboard, Command Zone, Maybeboard)

**Collection Section:**

```
COLLECTION (12 total copies, $850 total value)
• LEA #162 NM (4×) — $1,200 ea = $4,800
• M11 #146 LP (5×) — $1.50 ea = $7.50
• DOM #152 NM (3×) — $0.10 ea = $0.30

[View All Instances →]
```

**Display:**

- Set code + collector number
- Condition (NM, LP, MP, HP, DMG)
- Quantity
- Unit price × quantity = subtotal
- Total value across all copies

**Empty State:**

- "Not in your decks yet" → [+ Add to Deck] CTA
- "Not in your collection yet" → [+ Add to Collection] CTA

---

### 7. Quick Actions

**Primary Actions (always visible):**

| Action            | Icon | Behavior                                      |
| ----------------- | ---- | --------------------------------------------- |
| Add to Deck       | `+`  | Opens deck selector modal                     |
| Add to Collection | `+`  | Opens collection entry form                   |
| Wishlist          | `♥`  | Toggle wishlist status (saves card for later) |
| Share             | `↗`  | Copy shareable link to clipboard              |

**Secondary Actions (dropdown menu):**

- Open in Scryfall (external link)
- Open in TCGplayer (external link)
- View on EDHREC (Commander stats)
- Compare prices (aggregate price comparison)
- Download image (high-res PNG)
- Report issue (incorrect data)

**Add to Deck Flow:**

1. Click [+ Add to Deck]
2. Modal appears:
   ```
   ┌─────────────────────────────────┐
   │ Add to Deck                     │
   ├─────────────────────────────────┤
   │ Select Deck:                    │
   │ [Atraxa Superfriends ▾]         │
   │                                 │
   │ Section:                        │
   │ [Mainboard ▾]                   │
   │                                 │
   │ Quantity: [1]                   │
   │                                 │
   │ Print: [LEA #162 ▾]             │
   │ (uses default print selection   │
   │  from user preferences)         │
   │                                 │
   │ [Cancel] [Add to Deck]          │
   └─────────────────────────────────┘
   ```
3. Click [Add to Deck] → Card added
4. Toast notification: "Added 1× Lightning Bolt to Atraxa Superfriends"

**Add to Collection Flow:**

1. Click [+ Add to Collection]
2. Modal appears:
   ```
   ┌─────────────────────────────────┐
   │ Add to Collection               │
   ├─────────────────────────────────┤
   │ Print: [LEA #162 ▾]             │
   │                                 │
   │ Quantity: [1]                   │
   │                                 │
   │ Condition:                      │
   │ ◉ NM  ○ LP  ○ MP  ○ HP  ○ DMG   │
   │                                 │
   │ ☐ Foil                          │
   │                                 │
   │ Purchase Price: $____ (optional)│
   │                                 │
   │ [Cancel] [Add to Collection]    │
   └─────────────────────────────────┘
   ```
3. Click [Add to Collection] → Entry created
4. Toast notification: "Added 1× Lightning Bolt (LEA) to collection"

**Share Link:**

- Copies URL to clipboard: `https://decksmith.app/cards/:oracle_id`
- Toast: "Link copied!"
- Open Graph meta tags for social preview:
  ```html
  <meta property="og:title" content="Lightning Bolt - MTG Card" />
  <meta property="og:description" content="Instant - {R} - Deals 3 damage to any target" />
  <meta property="og:image" content="[Scryfall image URL]" />
  ```

---

### 8. Keyboard Shortcuts

**Navigation:**

- `A` — Add to deck
- `C` — Add to collection
- `W` — Toggle wishlist
- `S` — Share link
- `ESC` — Close modal / go back
- `←/→` — Previous/next print in gallery
- `↑/↓` — Scroll page

**Accessibility:**

- Focus indicators visible (blue outline)
- Tab navigation works throughout page
- Screen reader friendly (aria-labels on icons)
- Image alt text: "Lightning Bolt (LEA #162)"

---

## Modal Mode (Deck Building Context)

**Trigger:**

- User clicks card name/image while in deck builder or collection view

**Layout (Overlay):**

```
┌─────────────────────────────────────────────────────────────┐
│                     [Backdrop: 50% opacity black]           │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Lightning Bolt                         [✕ Close]     │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │ ┌────────────┬───────────────────────────────────┐   │  │
│  │ │ [Image]    │ ORACLE TEXT                       │   │  │
│  │ │            │ Lightning Bolt deals 3 damage...  │   │  │
│  │ │ {R}        │                                   │   │  │
│  │ │ Instant    │ LEGALITIES                        │   │  │
│  │ │            │ ✓ Commander  ✓ Modern             │   │  │
│  │ │ LEA #162   │ ✗ Standard   ⚠ Vintage            │   │  │
│  │ └────────────┴───────────────────────────────────┘   │  │
│  │                                                      │  │
│  │ ALL PRINTS (52 editions)                            │  │
│  │ [Scrollable grid, 3 columns]                        │  │
│  │                                                      │  │
│  │ [+ Add to Deck] [+ Add to Collection] [♥ Wishlist]  │  │
│  │                                                      │  │
│  │ [View Full Details →]                               │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Features:**

- Focused content (image + text + prints)
- No price history chart (keeps modal lightweight)
- No deck/collection usage (contextual redundancy)
- Quick actions: Add to deck, Add to collection, Wishlist
- Link to full page: [View Full Details →]

**Interaction:**

- `ESC` or click backdrop to close
- Focus trap (tab cycles within modal)
- Scroll within modal (body scroll disabled)
- Responsive: Full screen on mobile (slide-up animation)

---

## API Endpoints

### `GET /api/cards/:oracle_id`

**Description:** Get card details with all prints.

**Response:**

```json
{
  "oracle_id": "uuid",
  "name": "Lightning Bolt",
  "mana_cost": "{R}",
  "type_line": "Instant",
  "oracle_text": "Lightning Bolt deals 3 damage to any target.",
  "flavor_text": "\"The spark of genius shines brightest...\"",
  "colors": ["R"],
  "cmc": 1,
  "legalities": {
    "commander": "legal",
    "modern": "legal",
    "standard": "not_legal",
    "vintage": "restricted",
    "legacy": "legal",
    "pioneer": "legal"
  },
  "scryfall_uri": "https://scryfall.com/card/...",
  "prints": [
    {
      "scryfall_id": "uuid",
      "set_code": "LEA",
      "set_name": "Limited Edition Alpha",
      "collector_number": "162",
      "rarity": "common",
      "released_at": "1993-08-05",
      "image_uris": {
        "small": "https://...",
        "normal": "https://...",
        "large": "https://...",
        "png": "https://..."
      },
      "foil": false,
      "nonfoil": true,
      "prices": {
        "usd": "1200.00",
        "usd_foil": null,
        "eur": "1100.00",
        "eur_foil": null
      },
      "language": "en"
    }
  ],
  "price_history": [
    {
      "date": "2026-01-01",
      "usd": "1150.00",
      "usd_foil": null,
      "eur": "1050.00",
      "eur_foil": null
    }
  ],
  "usage": {
    "decks": [
      {
        "deck_id": "uuid",
        "deck_name": "Atraxa Superfriends",
        "quantity": 1,
        "section": "mainboard"
      }
    ],
    "collection": {
      "total_copies": 12,
      "total_value_usd": 850.0,
      "entries": [
        {
          "set_code": "LEA",
          "collector_number": "162",
          "condition": "NM",
          "quantity": 4,
          "unit_price_usd": "1200.00",
          "subtotal_usd": "4800.00"
        }
      ]
    }
  }
}
```

### `GET /api/cards/:oracle_id/price-history`

**Description:** Get historical price data for chart.

**Query Params:**

- `range`: "7d", "30d" (default), "90d", "1y"
- `currency`: "usd" (default), "eur"

**Response:**

```json
{
  "oracle_id": "uuid",
  "range": "30d",
  "currency": "usd",
  "data": [
    { "date": "2026-01-01", "price": 1150.0 },
    { "date": "2026-01-02", "price": 1175.0 }
  ],
  "summary": {
    "min": 150.0,
    "max": 1200.0,
    "avg": 450.0,
    "current": 1200.0,
    "volatility": 0.25
  }
}
```

---

## Business Rules

1. **Default Print Selection:**
   - When opening card details, show print based on `UserPreferences.default_print_selection`
   - Options: `latest` (default), `cheapest`, `original`
   - Fallback: Latest if preference unavailable

2. **Price History Data:**
   - Store daily snapshots during Scryfall sync
   - Retention: 1 year of history (365 days)
   - Chart caching: 5-minute TTL

3. **Lazy Loading:**
   - Card image: Lazy load on viewport entry
   - Prints gallery: Initial 12, infinite scroll for more
   - Price chart: Load only when scrolled into view

4. **Shareable URLs:**
   - Pattern: `/cards/:oracle_id?from=search&q=lightning`
   - Open Graph meta tags for social preview
   - SEO-friendly: Server-side render card name in `<title>`

5. **Modal vs Full Page:**
   - Modal: Deck builder, collection views
   - Full page: Search results, direct links, shared URLs
   - Component reuse: Same component, different layout prop

6. **Keyboard Navigation:**
   - Full keyboard support (tab, arrow keys, shortcuts)
   - Modal focus trap (ESC to close)
   - Accessibility: WCAG AA compliant

7. **Mobile Optimization:**
   - Sticky bottom action bar
   - Touch-friendly buttons (min 44×44px)
   - Single column layout
   - Pinch-to-zoom on card image

---

## Performance Targets

| Metric                | Target  | Notes                                  |
| --------------------- | ------- | -------------------------------------- |
| Initial page load     | < 1.5s  | Including card image                   |
| Price chart render    | < 300ms | Cached data, lightweight chart library |
| Prints gallery scroll | 60 FPS  | Virtualized scrolling for 100+ prints  |
| Modal open animation  | < 200ms | Smooth fade-in transition              |
| Image lazy load       | < 500ms | Per image on scroll                    |

---

## Accessibility

- **Keyboard Navigation:** Full tab navigation, arrow keys for prints
- **Screen Reader:** Aria-labels on all icons and buttons
- **Color Contrast:** WCAG AA minimum (4.5:1 for text)
- **Focus Indicators:** Visible blue outline on focus
- **Image Alt Text:** Descriptive (e.g., "Lightning Bolt card from Limited Edition Alpha")
- **Modal Focus Trap:** Focus stays within modal when open
- **Skip Links:** "Skip to main content" for screen readers

---

## UI Patterns

### Card Image Lightbox

```
┌─────────────────────────────────────────────────────────────┐
│                    [Full-screen backdrop]                   │
│                                                             │
│              ┌──────────────────────────┐                   │
│              │                          │                   │
│              │   [Large Card Image]     │  [✕ Close]        │
│              │   (zoom, pan enabled)    │                   │
│              │                          │                   │
│              └──────────────────────────┘                   │
│                                                             │
│              [◄ Prev Print] [Next Print ►]                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Print Comparison View (Optional Future Feature)

```
┌─────────────────────────────────────────────────────────────┐
│ COMPARE PRINTS                                   [✕ Close]  │
├─────────────────────────────────────────────────────────────┤
│ ┌──────────────┬──────────────┬──────────────┐             │
│ │   LEA #162   │   M11 #146   │   DOM #152   │             │
│ │  [Image]     │  [Image]     │  [Image]     │             │
│ │              │              │              │             │
│ │ $1,200       │ $1.50        │ $0.10        │             │
│ │ 1993         │ 2010         │ 2019         │             │
│ │ Non-foil     │ Foil/NF      │ Non-foil     │             │
│ │              │              │              │             │
│ │ [SELECT]     │ [SELECT]     │ [SELECT]     │             │
│ └──────────────┴──────────────┴──────────────┘             │
└─────────────────────────────────────────────────────────────┘
```

---

## Mobile Considerations

### Mobile Web (320-767px)

**Modal Behavior:**

- **Full-screen modal**: Slides up from bottom (not centered overlay)
- **Swipe-to-dismiss**: Swipe down to close modal (iOS/Android standard)
- **Header**: Fixed at top with back button (arrow) and close button (X)

**Layout (Single Column):**

- **Card image**: Full-width (320px), centered
- **Card name**: Large (24px font)
- **Mana cost**: Icons below name (large, 32px)
- **Oracle text**: Full-width, readable (16px font, 1.5 line-height)
- **Sections scroll**: Scroll vertically through oracle text → legalities → prints → usage

**Prints Gallery:**

- **2-column grid** (not 4-column)
- **Tap to select**: Tap print thumbnail → Expands to show details (set, price, foil/nonfoil)
- **No hover**: No hover-to-preview (use tap instead)
- **Large touch targets**: Each print card is 44px minimum height

**Price History:**

- **Simplified chart**: Line graph with 30-day history (horizontal scroll if needed)
- **Touch interactions**: Tap data point → Show tooltip with exact price
- **Currency toggle**: Tap [USD] [EUR] buttons (44px touch targets)

**Quick Actions:**

- **Bottom sheet**: "Add to Deck", "Add to Collection", "Share"
- **Large buttons**: 56px height (easy to tap)
- **Sheet slides up**: Tap action button → Sheet with options

**Legalities:**

- **Collapsible sections**: Tap "Show All Formats" → Expands full list
- **Essential formats first**: Standard, Modern, Commander (others collapsed)

**Touch Interactions:**

- All buttons: 44px minimum
- Swipe-to-dismiss modal: Standard gesture
- Pull to refresh (optional): Refresh prices

**Performance Targets:**

- Card details load: < 300ms (oracle data cached)
- Prints gallery load: < 500ms (lazy load images)
- Price chart render: < 200ms (client-side calculation)

**Offline Behavior:**

- Requires internet (card data and prices need API)
- Error if offline: "No internet. Card details require connection."

### Tablet (768-1023px)

**Slide-over modal** (not full-screen):

- Modal takes 60% of screen width
- Background content visible (dimmed)
- Swipe or tap outside to close

**Two-column layout**:

- Left: Card image, mana cost, type
- Right: Oracle text, legalities, actions

### Future Native Mobile

**Offline Support:**

- Full card database in SQLite (oracle text, legalities)
- Prices update when online (stale prices shown if offline)
- "Last updated 2 days ago" indicator

**Platform Features:**

- **Share via system sheet**: Share card link (WhatsApp, Discord, etc.)
- **Deep linking**: `decksmith://cards/:oracle_id` opens card in app
- **3D card viewer**: ARKit (iOS) / ARCore (Android) for 3D rotation (future enhancement)

**Domain Logic Reuse:**

- Legality checks (`isLegalIn Format`, `isBanned`) in `packages/domain` work on web and native
- Price calculations shared

### Related ADRs

- [ADR-0008: Mobile-First Web Design Principles](../adr/0008-mobile-first-web-design-principles.md)
  — Modal behavior, touch targets
- [ADR-0009: Responsive Feature Strategy](../adr/0009-responsive-feature-strategy.md) — Full-screen
  modal pattern
- [ADR-0010: Link Sharing & Meta Tags](../adr/0010-link-sharing-meta-tags.md) — Deep linking for
  cards

---

## Related Specs

- [Data Model](./data-model.md) — Card, CardPrint schemas
- [Card Search](./card-search.md) — Search and autocomplete
- [Deck Management](./deck-management.md) — Add to deck flow
- [Collection](./collection.md) — Add to collection flow
- [User Preferences](./user-preferences.md) — Default print selection
- [Pricing](./pricing.md) — Price history data
