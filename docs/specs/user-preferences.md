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

**Multi-Language Card Support:**
Decksmith stores card data in multiple languages locally (English + French) and displays cards based on the user's language preference. This affects:
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
   - `theme: 'system'`

2. **Language affects API responses:**
   - Validation errors translated server-side
   - Example: `"Quantity must be ≥ 1"` → `"La quantité doit être ≥ 1"`
   - Card data localized based on user preference
   - Example: `/api/cards/search?q=bolt` returns `{ name: "Éclair" }` for French users, `{ name: "Lightning Bolt" }` for English users

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

## Related Specs

- [Data Model](./data-model.md) — UserPreferences schema
- [Collection](./collection.md) — Collection view config
- [PDF Generation](./pdf-generation.md) — Units in PDF config