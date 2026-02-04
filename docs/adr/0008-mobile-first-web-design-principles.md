# ADR-0008: Mobile-First Web Design Principles

**Last Updated:** 2026-01-11 **Status:** Active **Context:** Decksmith

---

## Context

Decksmith's web application must deliver a **premium user experience on both mobile and desktop**.
With 60%+ of web traffic coming from mobile devices, mobile cannot be an afterthought—it must be a
first-class citizen.

**Key challenges:**

1. **Touch interactions**: Deck building requires precise interactions (adding cards, adjusting
   quantities, organizing)—must work seamlessly with touch on small screens
2. **Screen real estate**: Complex features (deck editor, card search with filters, print sheet
   builder) must adapt to 320px mobile screens without sacrificing usability
3. **Performance**: Mobile devices have slower networks and less processing power—image loading and
   API responses must be optimized
4. **Future cross-platform**: A React Native mobile app is planned—web architecture must support
   shared logic without duplication

**Critical constraint from CLAUDE.md:**

- **Domain logic only in `packages/domain`** (pure functions, no I/O)
- **`apps/web` cannot use `db`, `domain`, `scryfall`, `pdf`** (client-server boundary)

This ADR defines **responsive breakpoints**, **touch interaction standards**, **offline strategy**,
and **performance targets** for mobile web.

---

## Current Decision

We adopt a **mobile-first responsive design** strategy for the web application with the following
principles:

### 1. Responsive Breakpoints

**Three-tier breakpoint system:**

| Breakpoint  | Range      | Target Devices         | Layout Strategy                                  |
| ----------- | ---------- | ---------------------- | ------------------------------------------------ |
| **Mobile**  | 320-767px  | Phones                 | Single column, full-screen modals, bottom sheets |
| **Tablet**  | 768-1023px | Tablets, small laptops | Two-column layouts, slide-over panels            |
| **Desktop** | 1024px+    | Laptops, monitors      | Multi-column, sidebars, drag-and-drop            |

**CSS approach:**

```css
/* Mobile-first: Base styles target 320px+ */
.card-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* 2 columns on mobile */
  gap: 0.5rem;
}

/* Tablet: Add complexity */
@media (min-width: 768px) {
  .card-grid {
    grid-template-columns: repeat(3, 1fr); /* 3 columns */
    gap: 1rem;
  }
}

/* Desktop: Full layout */
@media (min-width: 1024px) {
  .card-grid {
    grid-template-columns: repeat(4, 1fr); /* 4 columns */
    gap: 1.5rem;
  }
}
```

**Rationale:** Mobile-first CSS forces us to design for constraints first, then progressively
enhance for larger screens (align with **"Clarity over cleverness"**).

### 2. Touch Interaction Standards

**Minimum touch target sizes (WCAG AAA compliance):**

- **Buttons/links:** 44px × 44px minimum (iOS/Android standard)
- **Form inputs:** 44px height minimum (prevents iOS zoom on focus)
- **Swipeable elements:** 48px height (comfortable swipe gesture)
- **Base font size:** 16px (prevents iOS auto-zoom on input focus)

**Touch gesture patterns:**

| Action            | Desktop             | Mobile Web                                         |
| ----------------- | ------------------- | -------------------------------------------------- |
| Add card to deck  | Click               | Tap card → bottom sheet "Add to Deck"              |
| Remove card       | Hover → click X     | Swipe left → delete button                         |
| Edit quantity     | Inline number input | Tap → modal with +/- buttons (large touch targets) |
| View card details | Click thumbnail     | Tap thumbnail → full-screen modal                  |
| Navigate filters  | Sidebar checkboxes  | Bottom sheet with grouped filters                  |

**Rationale:** Touch gestures must feel natural (swipe-to-delete is iOS/Android standard). Avoid
hover-dependent interactions on mobile (align with **"Premium UX"** requirement).

### 3. Offline Strategy

**Web application (mobile + desktop): Online-only initially**

**Decision:**

- Web app requires internet connection
- No offline deck building or card browsing on web
- API calls fail gracefully with error messages ("No internet connection")

**Rationale:**

1. **Reduces complexity:** Offline-first requires sync strategy, conflict resolution, local database
   (IndexedDB), cache invalidation—significant engineering overhead
2. **User expectations:** Users expect web apps to require internet (unlike native mobile apps)
3. **MVP focus:** Online-only gets us to market faster without sacrificing core functionality
4. **Future-proof architecture:** `packages/domain` is designed offline-ready (pure functions, no
   I/O), so offline support can be added later without refactoring

**Domain layer design for future offline support:**

```typescript
// ✅ GOOD: Pure function in packages/domain
export function validateDeckFormat(deck: DeckDTO, format: FormatDTO): ValidationResult {
  // Pure logic, no API calls, no database
  // Works offline if given deck + format data
  return {
    isValid: deck.cards.every((card) => format.legalCards.includes(card.id)),
    errors: [
      /* ... */
    ],
  };
}

// ❌ BAD: Impure function (API call)
export async function validateDeckFormat(deckId: string): Promise<ValidationResult> {
  const deck = await fetch(`/api/decks/${deckId}`); // ❌ I/O in domain
  // ...
}
```

**Key principle:** Domain logic operates on **DTOs from `packages/schema`**, never directly on API
responses or database models (align with **ADR-0005: Package Boundaries**).

**Future native mobile:** Will implement full offline-first with local database (SQLite), background
sync, conflict resolution (spec'd in future ADR).

### 4. Performance Targets

**Mobile web performance targets:**

| Metric                  | Target                         | Rationale                          |
| ----------------------- | ------------------------------ | ---------------------------------- |
| **Initial page load**   | < 2s on 4G                     | First impression is critical       |
| **API response time**   | < 500ms (p95)                  | Perceived as instant               |
| **Card search results** | < 300ms                        | Real-time feel                     |
| **Image loading**       | Progressive (thumbnail → full) | Avoid layout shift, save bandwidth |
| **Deck list render**    | < 100ms for 60 cards           | Smooth scrolling                   |

**Image optimization strategy:**

```typescript
// Use Scryfall's multiple image sizes
interface CardImageDTO {
  small: string    // ~146x204px (~10 KB) - Thumbnail
  normal: string   // ~488x680px (~100 KB) - Default
  large: string    // ~672x936px (~200 KB) - High-res
  png: string      // ~1500x2100px (~1 MB) - Print quality
}

// Mobile web: Load small first, upgrade to normal on tap
<img
  src={card.imageUris.small}
  data-full-src={card.imageUris.normal}
  loading="lazy" // Native lazy loading
  onClick={loadFullImage}
/>
```

**Lazy loading:**

- Use Intersection Observer API for card grids (load images as user scrolls)
- Virtual scrolling for large collections (1000+ cards) with `react-window` or
  `@tanstack/react-virtual`

**Debouncing:**

- Search input: 300ms debounce (avoid API spam)
- Filter changes: 500ms debounce (batch multiple filter changes)

**Rationale:** Mobile networks are slower and more expensive (align with **"Performance targets"**
in specs).

### 5. Navigation & Routing

**Same routes across mobile/desktop (no separate mobile routes):**

```
/decks              → Deck list
/decks/:id          → View deck
/decks/:id/edit     → Edit deck
/cards              → Card search
/collection         → Collection management
/print              → Print sheet builder
```

**Responsive UI patterns (same route, different layout):**

| Route        | Desktop                        | Mobile Web                            |
| ------------ | ------------------------------ | ------------------------------------- |
| `/decks`     | Table with columns             | Card list with summaries              |
| `/decks/:id` | Sidebar + main content         | Full-screen with bottom tabs          |
| `/cards`     | Sidebar filters + grid         | Full-screen search with sheet filters |
| `/print`     | Visual builder (drag-and-drop) | Text-based "print job creator"        |

**Rationale:** Same routes simplify mental model, improve SEO, enable deep linking for future native
app (align with **"Clarity over cleverness"**).

---

## Rationale

### Why Mobile-First Fits Decksmith's Values

1. **Separation of concerns:**
   - Responsive CSS in `packages/web-ui` (presentation layer)
   - Domain logic in `packages/domain` (platform-agnostic)
   - Clear boundary between layout and logic

2. **Deterministic behavior:**
   - Pure functions in domain layer work identically on mobile/desktop/native
   - No device-specific business logic (only UI variations)

3. **Minimal coupling:**
   - Mobile web and desktop web share same components (`packages/web-ui`)
   - Future native app shares domain logic (`packages/domain`) and DTOs (`packages/schema`)
   - No duplication of validation, calculations, or business rules

4. **Clarity over cleverness:**
   - Mobile-first CSS is simpler to reason about (base → enhancement, not overrides)
   - Touch interactions follow platform conventions (iOS/Android patterns)
   - Progressive image loading is standard web practice (not custom solution)

### Why Online-Only for Web Initially

**Offline-first is complex:**

- Requires local database (IndexedDB or WebSQL)
- Sync strategy: Optimistic UI updates, conflict resolution, queue failed mutations
- Cache invalidation: When to fetch fresh data vs use stale cache
- Storage limits: Browsers have quotas (50MB-1GB varies by browser)

**Offline-first is most valuable on native mobile:**

- Users expect native apps to work offline (subway, airplane)
- React Native has better offline primitives (SQLite, AsyncStorage)
- Longer sessions (building decks on commute, at tournament)

**Web users expect internet:**

- Web apps typically require connection (Gmail, Spotify web, etc.)
- Offline web is still "nice to have," not expected

**Verdict:** Defer offline to native mobile, keep web online-only for MVP (can add later if user
feedback demands it).

### Why These Breakpoints

**320px minimum:**

- iPhone SE (375px) and older Android phones (360px) are smallest common devices
- Supporting 320px ensures compatibility with nearly all mobile devices

**768px tablet threshold:**

- Standard breakpoint (iPad portrait is 768px)
- Matches Tailwind's `md` breakpoint (developer familiarity)

**1024px desktop threshold:**

- Most laptops are 1280px+ width (comfortable for multi-column layouts)
- Matches Tailwind's `lg` breakpoint

---

## Trade-offs

**Benefits:**

- **Premium mobile UX:** 60%+ of users get first-class experience (not "mobile version")
- **Future-proof architecture:** Domain layer ready for offline support (pure functions)
- **Cross-platform code reuse:** Domain logic + DTOs shared between web and future native app
- **Accessibility:** 44px touch targets meet WCAG AAA standards (align with **"Premium UX"**)
- **Performance:** Progressive image loading saves bandwidth on mobile networks
- **SEO:** Same routes for mobile/desktop improve search rankings (no `/m/` subdomain)

**Costs:**

- **Design complexity:** Must design every feature for mobile, tablet, desktop (3x layout work)
- **CSS maintenance:** Responsive CSS requires careful breakpoint management
- **Testing overhead:** Must test on multiple devices (iPhone, Android, tablet, desktop)
- **No offline on web:** Users without internet cannot use app (acceptable for MVP)

**Risks:**

- **Feature creep:** Designers may want different features on mobile vs desktop (violates "same
  routes" principle)
  - **Mitigation:** Feature parity matrix (ADR-0009) defines what's available where
- **Performance regressions:** Mobile performance targets may be missed without monitoring
  - **Mitigation:** Add performance budgets to CI (Lighthouse CI, bundle size limits)
- **Touch interaction bugs:** Gestures may conflict (swipe-to-delete vs horizontal scroll)
  - **Mitigation:** Use battle-tested libraries (`react-swipeable`, `framer-motion`)

---

## Evolution History

### 2026-01-11: Initial decision

- Defined mobile-first responsive design strategy (320px, 768px, 1024px breakpoints)
- Established touch interaction standards (44px minimum, WCAG AAA)
- Decided online-only for web initially (offline deferred to native mobile)
- Designed domain layer for future offline support (pure functions, no I/O)
- Set performance targets (< 2s page load, < 500ms API, progressive images)

---

## References

- [CLAUDE.md](../../CLAUDE.md) - Architectural values (Separation of concerns, Deterministic
  behavior)
- [WCAG AAA Touch Target Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html) -
  44px minimum
- [Responsive Web Design (Ethan Marcotte)](https://alistapart.com/article/responsive-web-design/) -
  Mobile-first CSS
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/layout) -
  Touch targets
- [Material Design Touch Targets](https://m3.material.io/foundations/accessible-design/accessibility-basics#28032e45-c598-450c-b355-f9fe737b1cd8) -
  48dp minimum
- Related ADRs:
  - ADR-0005 (Package boundaries: Domain layer design)
  - ADR-0009 (Responsive feature strategy: Feature parity matrix)
  - ADR-0010 (Link sharing: Deep linking for native app)
- Related specs:
  - All 12 feature specs will reference this ADR for mobile considerations
