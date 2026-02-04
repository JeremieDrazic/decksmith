# User Preferences

Per-user settings for language, units, currency, theme, and UI customization.

---

## Features

### Language

- **English (en):** Default
- **French (fr):** Full UI translation + card localization

**Affects:**

- UI labels, buttons, validation messages
- API error responses (i18n)
- Date/time formatting
- **Card names and oracle text** (see [card-search.md](./card-search.md) for details)
  - Card search results display localized names (e.g., "Éclair" instead of "Lightning Bolt")
  - Deck lists show cards in selected language
  - Collection displays use localized card data
  - **Fallback:** If translation unavailable, displays English name

**Multi-Language Card Support:** Decksmith stores card data in multiple languages locally (English +
French) and displays cards based on the user's language preference. This affects:

- Card autocomplete search results
- Deck card lists
- Collection views
- Any UI component displaying card names or oracle text

**Example:**

- User with `language: 'fr'` sees "Éclair" when searching for Lightning Bolt
- User with `language: 'en'` sees "Lightning Bolt"
- If French translation missing, both users see "Lightning Bolt" (English fallback)

### Units

- **Metric (mm/cm):** Default for card dimensions, PDF margins
- **Imperial (inches):** Converts display only (backend stores mm)

**Affects:**

- PDF configuration UI
- Card dimension displays (63×88mm vs 2.5×3.5in)

### Currency

- **USD (TCGplayer):** Default
- **EUR (Cardmarket):** Converted via exchange rate API

**Affects:**

- Price displays in collection/decks
- Collection valuation dashboard

### Default Print Selection

- **Latest edition:** Default to newest printing by release date (default)
- **Cheapest available:** Default to lowest price in user's currency
- **Original edition:** Default to first printing (Alpha/Beta for old cards)

**Affects:**

- Which print is automatically selected when adding a card to deck/collection
- Avoids interrupting build flow with print selection modal
- User can change print anytime by clicking set icon next to card

### Theme

- **Light**
- **Dark**
- **System:** Auto-detect OS preference

**Implementation:** CSS custom properties + `prefers-color-scheme` media query

### Collection View Config (JSONB)

Stored in `UserPreferences.collection_view_config`:

```json
{
  "view_mode": "grid",
  "visible_columns": ["image", "name", "set", "quantity", "price"],
  "sort_field": "name",
  "sort_order": "asc"
}
```

### Notification Preferences (JSONB)

```json
{
  "pdf_ready_email": true,
  "feature_announcements": false
}
```

---

## Business Rules

1. **Created automatically on signup** with defaults:
   - `language: 'en'`
   - `units: 'mm'`
   - `default_currency: 'usd'`
   - `default_print_selection: 'latest'`
   - `theme: 'system'`

2. **Language affects API responses:**
   - Validation errors translated server-side
   - Example: `"Quantity must be ≥ 1"` → `"La quantité doit être ≥ 1"`
   - Card data localized based on user preference
   - Example: `/api/cards/search?q=bolt` returns `{ name: "Éclair" }` for French users,
     `{ name: "Lightning Bolt" }` for English users

3. **Units only affect display:**
   - Backend always stores mm
   - Frontend converts on read: `63mm → 2.5in`

4. **Collection view config saved automatically:**
   - No "Save" button
   - Updates on column reorder/hide

---

## API Endpoints

### `GET /api/preferences`

Returns current user preferences.

### `PATCH /api/preferences`

Update preferences.

**Request Body:**

```json
{
  "language": "fr",
  "units": "inches",
  "default_currency": "eur",
  "theme": "dark"
}
```

---

## UI Patterns

**Settings Page Structure:**

```
┌──────────────────────────────┐
│ Settings                     │
├──────────────────────────────┤
│ Language & Region            │
│  ◉ English  ○ French         │
│  ◉ Metric (mm)  ○ Imperial   │
│  ◉ USD  ○ EUR                │
│──────────────────────────────│
│ Card Preferences             │
│  Default Print Selection:    │
│  ◉ Latest edition            │
│  ○ Cheapest available        │
│  ○ Original edition          │
│──────────────────────────────│
│ Display                      │
│  Theme: [System ▾]           │
│──────────────────────────────│
│ Notifications                │
│  ☑ Email when PDF ready      │
│  ☐ Feature announcements     │
└──────────────────────────────┘
```

**Live preview:**

- Changing theme applies immediately (no save button)
- Language switch triggers page reload

---

## Mobile Considerations

### Mobile Web (320-767px)

**Settings UI:**

- **Grouped sections**: Collapsible sections (Language, Appearance, Defaults, Units)
- **Full-screen page**: Settings take full screen (not sidebar)
- **Large toggles**: Theme toggle, units toggle (44px touch targets)
- **Dropdowns**: Language, currency, print selection (56px row height)

**Touch Interactions:**

- All toggle switches: 44px minimum
- Dropdown menus: Large touch targets
- Swipe down to refresh (reloads preferences from API)

**Theme Toggle:**

- **Instant apply**: Theme changes immediately (no save button)
- **Persistence**: Saved to `UserPreferences` table (syncs across devices)

**Language Picker:**

- **Tap to change**: Opens bottom sheet with language options
- **Page reload**: After selection (language affects UI strings)

**Performance Targets:**

- Settings load: < 200ms
- Preference update: < 300ms (API save)
- Theme switch: < 100ms (CSS variable swap)

### Tablet (768-1023px)

**Sidebar + main content**: Settings sidebar with content area (like desktop)

### Future Native Mobile

**Platform Features:**

- **System preferences**: Sync with device theme (light/dark)
- **Local storage**: Preferences cached locally, sync when online
- **Notifications settings**: Push notification preferences (in-app)

**Domain Logic Reuse:**

- Preference validation in `packages/domain` (e.g., validate units, currency)

### Related ADRs

- [ADR-0008: Mobile-First Web Design Principles](../adr/0008-mobile-first-web-design-principles.md)
  — Touch targets
- [ADR-0009: Responsive Feature Strategy](../adr/0009-responsive-feature-strategy.md) — Settings
  layout

---

## Related Specs

- [Data Model](./data-model.md) — UserPreferences schema
- [Collection](./collection.md) — Collection view config
- [PDF Generation](./pdf-generation.md) — Units in PDF config
