# ADR-0009: Responsive Feature Strategy

**Last Updated:** 2026-01-11 **Status:** Active **Context:** Decksmith

---

## Context

ADR-0008 established mobile-first design principles (breakpoints, touch targets, performance). This
ADR defines **which features are available on mobile web vs desktop web**, and **how user
interactions adapt** across devices.

**Key challenge:** Balancing **feature parity** (all features available everywhere) with **device
constraints** (small screens, touch inputs, mobile performance).

**Critical requirements:**

1. **Premium UX on both mobile and desktop** (no "mobile version" compromises)
2. **Same routes** across devices (e.g., `/decks/:id` works on mobile and desktop)
3. **Touch-friendly interactions** (no hover-dependent features on mobile)
4. **Performance** (mobile networks are slower, save bandwidth)

**Question:** Should all features be identical on mobile and desktop, or should some features be
simplified/optimized for mobile?

---

## Current Decision

We adopt a **feature parity with adaptive UX** strategy:

- **Same features available** on mobile and desktop (no "desktop-only" or "mobile-only" features)
- **Different UX patterns** where device constraints require it (e.g., drag-and-drop on desktop →
  tap-to-add on mobile)
- **Simplified interfaces** on mobile where full complexity doesn't fit (e.g., full stats dashboard
  → key metrics)
- **Same backend API** (no mobile-specific endpoints)

### Feature Parity Matrix

| Feature                   | Desktop Web (1024px+)                        | Mobile Web (320-767px)                                   | Native Mobile (Future)             |
| ------------------------- | -------------------------------------------- | -------------------------------------------------------- | ---------------------------------- |
| **Deck browsing**         | Table view (sortable columns)                | Card list view (collapsible sections)                    | Card list + swipe gestures         |
| **Deck editing**          | Full editor (sidebar + grid)                 | Simplified editor (full-screen search)                   | Full editor + offline sync         |
| **Card search**           | Sidebar filters + grid                       | Full-screen search with bottom sheet filters             | Full-screen + saved filters        |
| **Print sheet creation**  | Visual builder (drag, resize, arrange)       | Text-based "print job creator" (card list + settings)    | Visual builder with touch gestures |
| **Print sheet preview**   | PDF preview (embedded)                       | Text preview + download button                           | PDF preview with pinch-zoom        |
| **PDF management**        | Full CRUD (create, view, edit, delete)       | View + download only (no editing)                        | Full CRUD + share via system       |
| **Statistics**            | Full dashboard (charts, tables, trends)      | Essential stats only (card count, mana curve, top cards) | Full dashboard (optimized charts)  |
| **Collection management** | Grid (4 cols) + filters + bulk actions       | Grid (2 cols) + filters + swipe actions                  | Grid + camera import + offline     |
| **Card details**          | Modal with tabs (details, pricing, legality) | Full-screen modal with scroll sections                   | Full-screen with swipe-to-dismiss  |
| **User auth**             | Modal with OAuth buttons (horizontal)        | Full-screen with OAuth buttons (vertical stack)          | Native OAuth + biometric login     |
| **Pricing charts**        | Full historical charts (line graphs)         | Current prices only (simplified table)                   | Full charts (touch-optimized)      |
| **User preferences**      | Settings page with sidebar nav               | Settings page with grouped sections                      | Native settings screen             |
| **AI recommendations**    | Show all 10 recommendations inline           | Show 3 recommendations + "View more" button              | Show 10 with infinite scroll       |

**Key principle:** Features are **available everywhere**, but **UX adapts** to device capabilities
(align with **"Premium UX on both mobile and desktop"**).

---

## UX Patterns by Feature

### 1. Deck Building

**Desktop (1024px+):**

```
┌────────────────────────────────────────────┐
│ [Search: "Lightning Bolt"]  [Filters ▼]    │
├──────────────┬─────────────────────────────┤
│ Card Results │ Current Deck                │
│              │                             │
│ ┌────┐ ┌────┐│ Creatures (12)             │
│ │Card│ │Card││ - 4x Goblin Guide          │
│ └────┘ └────┘│ - 4x Monastery Swiftspear  │
│              │                             │
│ [Drag to add]│ Spells (24)                │
│              │ - 4x Lightning Bolt ← ✕     │
│              │   [Qty: 4 ▼]               │
└──────────────┴─────────────────────────────┘
```

**Interaction:**

- Drag card from results → deck area to add
- Hover over card → show X button to remove
- Inline quantity input (keyboard entry)
- Sidebar filters (always visible)

**Mobile (320-767px):**

```
┌────────────────────────────┐
│ [🔍 Search]  [Filters]     │
├────────────────────────────┤
│ ┌────┐ ┌────┐             │
│ │Card│ │Card│ ← Tap to add│
│ └────┘ └────┘             │
│                            │
│ [Current Deck: 36 cards]   │
│ ▼ Creatures (12)           │
│   4x Goblin Guide  [Edit]  │
│   ← Swipe left to delete   │
└────────────────────────────┘
```

**Interaction:**

- Tap card → bottom sheet "Add to Deck" (with quantity picker)
- Swipe card left → show delete button
- Tap card in deck → modal with +/- quantity buttons (44px touch targets)
- Filters in bottom sheet (tap "Filters" → sheet slides up)

**Rationale:** Drag-and-drop requires hover (not available on touch). Tap + bottom sheet is
iOS/Android standard pattern (align with **ADR-0008: Touch interactions**).

---

### 2. Card Search & Filtering

**Desktop (1024px+):**

```
┌────────────────────────────────────────────┐
│ Search: [Lightning Bolt________] [Search] │
├──────────────┬─────────────────────────────┤
│ Filters      │ Results (127 cards)         │
│              │                             │
│ ☑ White      │ ┌────┐ ┌────┐ ┌────┐ ┌────┐│
│ ☑ Blue       │ │Card│ │Card│ │Card│ │Card││
│ ☐ Black      │ └────┘ └────┘ └────┘ └────┘│
│              │                             │
│ ▼ Advanced   │ [Load more]                │
│   CMC: [0-7] │                             │
│   Rarity: All│                             │
└──────────────┴─────────────────────────────┘
```

**Interaction:**

- Sidebar filters (always visible)
- Checkboxes for colors (WUBRG)
- Advanced filters collapsible (but still in sidebar)
- Real-time filtering (debounced 300ms)

**Mobile (320-767px):**

```
┌────────────────────────────┐
│ [Search____________] [🔍]  │
│ [⚪ W] [🔵 U] [⚫ B] [🔴 R] [🟢 G] │
│ [Creature ▼] [More Filters]│
├────────────────────────────┤
│ ┌────┐ ┌────┐             │
│ │Card│ │Card│             │
│ └────┘ └────┘             │
│                            │
│ [Load more]                │
└────────────────────────────┘

[Tap "More Filters" → Bottom sheet]
┌────────────────────────────┐
│ Advanced Filters     [Done]│
├────────────────────────────┤
│ CMC Range: [0] to [7]      │
│ Rarity: [All ▼]           │
│ Set: [Any ▼]              │
│ Legality: [Standard ▼]    │
└────────────────────────────┘
```

**Interaction:**

- Basic filters always visible (colors, card type)
- Advanced filters in bottom sheet ("More Filters" button)
- Filter state persists to localStorage (across sessions)
- Search text input cleared on navigation (fresh search each time)

**Rationale:** Mobile screens can't fit 20+ filters. Two-tier approach (basic always visible,
advanced collapsible) balances discoverability and screen space (align with **"Premium UX"**).

---

### 3. Print Sheet Builder

**Desktop (1024px+):**

```
┌────────────────────────────────────────────┐
│ Print Sheet Builder                        │
├──────────────┬─────────────────────────────┤
│ Settings     │ Preview (A4)                │
│              │                             │
│ Paper: A4 ▼  │ ┌─┬─┬─┐                    │
│ Grid: 3x3 ▼  │ │█│█│█│ ← Drag cards here  │
│ DPI: 300 ▼   │ ├─┼─┼─┤                    │
│              │ │█│█│█│                    │
│ [Cards]      │ └─┴─┴─┘                    │
│ ┌────┐       │                             │
│ │Card│       │ [Generate PDF]             │
│ └────┘       │                             │
└──────────────┴─────────────────────────────┘
```

**Interaction:**

- Visual builder (drag cards to grid positions)
- Resize cards, adjust spacing
- Real-time preview (canvas rendering)
- Generate PDF button → worker job (see ADR-0007)

**Mobile (320-767px):**

```
┌────────────────────────────┐
│ Create Print Job     [Done]│
├────────────────────────────┤
│ Deck: [My Goblin Deck ▼]   │
│                            │
│ Paper Size: [A4 ▼]        │
│ Cards per page: [9 ▼]     │
│ Quality: [High (300 DPI) ▼]│
│                            │
│ ▼ Cards (36 selected)      │
│   ☑ 4x Lightning Bolt      │
│   ☑ 4x Goblin Guide        │
│   ☑ 3x Mountain            │
│   [Select All] [Clear]     │
│                            │
│ Preview:                   │
│ "4x Lightning Bolt,        │
│  4x Goblin Guide,          │
│  3x Mountain, ..."         │
│                            │
│ [Generate PDF] ← 44px tall │
└────────────────────────────┘
```

**Interaction:**

- No visual builder (drag-and-drop doesn't work well on touch)
- Text-based "print job creator" (select cards, settings)
- Text preview ("4x Lightning Bolt, 4x Goblin Guide...")
- Generate PDF button → worker job → download link
- User downloads PDF, previews on mobile or saves for desktop printing

**Rationale:** Visual layout on 320px screen is painful. Desktop has mouse precision for
positioning. Mobile focuses on **creating the print job**, not **visual layout** (align with
**"Clarity over cleverness"**).

---

### 4. PDF Management

**Desktop (1024px+):**

- Full CRUD (create, view, edit settings, delete)
- Table view of all generated PDFs (filename, date, size, status)
- Inline actions (re-generate, download, delete)

**Mobile (320-767px):**

- View + download only (no editing settings)
- Card list view (PDF name, date, size)
- Tap to download (opens in browser, user saves)
- Delete via swipe-left gesture

**Rationale:** PDF editing requires visual builder (desktop-optimized). Mobile users primarily need
to **download and share** PDFs, not edit them (align with **"Minimal complexity"**).

---

### 5. Statistics

**Desktop (1024px+):**

```
┌────────────────────────────────────────────┐
│ Deck Statistics                            │
├────────────────────────────────────────────┤
│ ┌──────────────┐ ┌──────────────┐         │
│ │ Mana Curve   │ │ Card Types   │         │
│ │   ▂▅█▅▂     │ │  Creatures: 40% │       │
│ └──────────────┘ └──────────────┘         │
│                                            │
│ Ramp Analysis:  8 sources (Good)          │
│ Draw Analysis:  4 sources (Low)           │
│ Removal:        12 cards (High)           │
│                                            │
│ Top Cards:                                 │
│ - Lightning Bolt (4x)                     │
│ - Goblin Guide (4x)                       │
└────────────────────────────────────────────┘
```

**Mobile (320-767px):**

```
┌────────────────────────────┐
│ Deck Stats                 │
├────────────────────────────┤
│ Cards: 60  Avg CMC: 2.1    │
│                            │
│ ▼ Mana Curve               │
│   ▂▅█▅▂                   │
│                            │
│ ▼ Card Types               │
│   Creatures: 24 (40%)      │
│   Spells: 32 (53%)         │
│   Lands: 24 (40%)          │
│                            │
│ [View Full Stats] ← Link  │
└────────────────────────────┘
```

**Interaction:**

- Mobile shows **essential stats only** (card count, mana curve, type breakdown)
- "View Full Stats" button links to full desktop-optimized view (opens in scrollable modal)
- Collapsible sections (tap to expand)

**Rationale:** Full stats dashboard with charts doesn't fit on 320px screen without horizontal
scrolling (poor UX). Mobile shows **key metrics**, desktop shows **full analysis** (align with
**"Premium UX"**).

---

## Filter Persistence Strategy

**Decision:** Persist filter state to localStorage (not backend).

**Implementation:**

```typescript
// packages/web-ui/src/hooks/usePersistedFilters.ts
import { useLocalStorage } from '@decksmith/web-ui/hooks';

export function useCardSearchFilters() {
  const [filters, setFilters] = useLocalStorage('card-search-filters', {
    colors: [],
    types: [],
    cmc: [0, 20],
    rarity: 'all',
    // ... other filters
  });

  return [filters, setFilters];
}
```

**Persistence rules:**

| Filter Type           | Persist? | Rationale                                        |
| --------------------- | -------- | ------------------------------------------------ |
| **Color filters**     | ✅ Yes   | User likely searches same colors repeatedly      |
| **Card type**         | ✅ Yes   | User may focus on creatures, spells, etc.        |
| **CMC range**         | ✅ Yes   | User may filter by mana cost frequently          |
| **Rarity**            | ✅ Yes   | User may want rare-only or common-only           |
| **Search text input** | ❌ No    | Each search is new (clear on navigation)         |
| **Set filter**        | ✅ Yes   | User may focus on specific set                   |
| **Legality filter**   | ✅ Yes   | User plays specific format (Standard, Commander) |

**Cross-device behavior:**

- User applies filters on mobile → switches to desktop → sees same filters
- This is **good UX** (consistent experience), not confusing

**Rationale:** Persistent filters improve mobile UX (no re-filtering every session). LocalStorage
avoids backend complexity (align with **"Minimal coupling"**).

---

## Image Loading Strategy

**Decision:** Progressive loading with lazy loading (Intersection Observer).

**Implementation:**

```typescript
// packages/web-ui/src/components/CardImage.tsx
export function CardImage({ card }: { card: CardDTO }) {
  const [src, setSrc] = useState(card.imageUris.small) // Thumbnail first
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true)
        observer.disconnect()
      }
    })

    observer.observe(imageRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (isVisible) {
      const img = new Image()
      img.src = card.imageUris.normal // Preload full image
      img.onload = () => setSrc(card.imageUris.normal) // Swap when loaded
    }
  }, [isVisible])

  return (
    <img
      ref={imageRef}
      src={src}
      alt={card.name}
      loading="lazy"
    />
  )
}
```

**Image sizes (Scryfall provides):**

| Size     | Dimensions  | File Size | Use Case                       |
| -------- | ----------- | --------- | ------------------------------ |
| `small`  | 146x204px   | ~10 KB    | Thumbnail (initial load)       |
| `normal` | 488x680px   | ~100 KB   | Default view (desktop grid)    |
| `large`  | 672x936px   | ~200 KB   | High-res (zoomed view)         |
| `png`    | 1500x2100px | ~1 MB     | Print quality (PDF generation) |

**Strategy:**

1. Load `small` first (fast, ~10 KB)
2. When card scrolls into view (Intersection Observer) → preload `normal`
3. Swap to `normal` when loaded (smooth transition)
4. On tap/click → load `large` in modal (if user wants high-res)

**Rationale:** Saves bandwidth on mobile (load small images first, upgrade on-demand). Avoids layout
shift (images have fixed aspect ratio). Aligns with **ADR-0008: Performance targets** (< 2s page
load).

---

## Rationale

### Why Feature Parity with Adaptive UX

**Alternative 1: Identical UX everywhere**

- **Pro:** Consistent experience (no confusion)
- **Con:** Desktop UX suffers (e.g., no drag-and-drop because mobile can't do it)
- **Con:** Mobile UX suffers (e.g., tiny touch targets, horizontal scrolling)

**Verdict:** ❌ Rejected. Forces lowest-common-denominator UX (align with **"Premium UX on both
mobile and desktop"**).

**Alternative 2: Separate mobile and desktop features**

- **Pro:** Each platform optimized (mobile-only features, desktop-only features)
- **Con:** Confusing (users switch devices, expect same features)
- **Con:** More code (duplicate implementations)

**Verdict:** ❌ Rejected. Violates **"Same routes"** principle (align with **ADR-0008: Navigation &
Routing**).

**Alternative 3: Feature parity with adaptive UX (chosen)**

- **Pro:** Same features available everywhere (no "desktop-only" surprises)
- **Pro:** UX optimized for device (drag-and-drop on desktop, tap on mobile)
- **Pro:** Same routes (e.g., `/print` works on mobile and desktop)
- **Con:** More design work (must design for mobile, tablet, desktop)

**Verdict:** ✅ Chosen. Balances feature availability with device optimization (align with
**"Premium UX"** and **"Clarity over cleverness"**).

### Why Simplified Features on Mobile

**Example: Print sheet builder**

- **Desktop:** Visual builder is powerful, precise (mouse drag-and-drop)
- **Mobile:** Visual builder is painful (touch drag-and-drop on 320px screen)
- **Solution:** Text-based creator on mobile (select cards + settings), visual builder on desktop

**This is not "removing features"—it's "adapting UX":**

- Mobile users can still create print jobs (feature available)
- Mobile users get optimized UX (text-based creator is faster on mobile than drag-and-drop)
- Same backend API (no mobile-specific endpoints)

**This aligns with:**

- **"Premium UX on both mobile and desktop"** (each platform gets best UX)
- **"Minimal complexity"** (don't force complex drag-and-drop on touch)
- **"Clarity over cleverness"** (text creator is simpler than responsive drag-and-drop)

---

## Trade-offs

**Benefits:**

- **Premium UX on all devices:** Mobile users don't feel like second-class citizens
- **Feature parity:** All features available everywhere (no "desktop-only" surprises)
- **Same routes:** Simpler mental model, better SEO, deep linking for native app
- **Optimized interactions:** Drag-and-drop on desktop, tap on mobile (platform conventions)
- **Persistent filters:** Mobile users don't re-filter every session (improved UX)
- **Progressive images:** Saves bandwidth on mobile networks (align with **ADR-0008: Performance**)

**Costs:**

- **Design complexity:** Must design every feature for mobile, tablet, desktop (3x layout work)
- **Testing overhead:** Must test on multiple devices (iPhone, Android, tablet, desktop)
- **Conditional rendering:** Code must adapt UI patterns (more complexity)
- **Documentation:** Designers/developers must understand feature matrix (learning curve)

**Risks:**

- **Feature drift:** Designers may want to add mobile-only or desktop-only features (violates
  feature parity)
  - **Mitigation:** Feature matrix in this ADR is the single source of truth (no exceptions without
    ADR update)
- **Inconsistent UX:** Different interactions on mobile vs desktop may confuse users
  - **Mitigation:** Follow platform conventions (swipe-to-delete on mobile is iOS/Android standard)
- **Performance regressions:** Progressive images may fail (slow network, large images)
  - **Mitigation:** Add fallback (show placeholder if image fails to load)

---

## Evolution History

### 2026-01-11: Initial decision

- Defined feature parity matrix (same features, adaptive UX)
- Established UX patterns for deck building, card search, print sheets, stats
- Decided filter persistence (localStorage, not backend)
- Defined progressive image loading (small → normal → large)
- Established simplified features on mobile (print sheet text creator, essential stats)

---

## References

- [ADR-0008: Mobile-First Web Design Principles](./0008-mobile-first-web-design-principles.md) -
  Breakpoints, touch targets, performance
- CLAUDE.md - Architectural values (Premium UX, Clarity over cleverness)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/) -
  Touch interaction patterns
- [Material Design](https://m3.material.io/) - Bottom sheets, swipe gestures
- [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) -
  Lazy loading images
- Related specs:
  - `deck-management.md` - Deck building UX patterns
  - `card-search.md` - Search & filtering UX patterns
  - `pdf-generation.md` - Print sheet builder UX patterns
  - `collection-management.md` - Collection grid UX patterns
