# Collection Management

Manage your Magic: The Gathering card inventory with specific editions, variants, conditions, pricing, and a 3D card viewer.

---

## Features Overview

- Track specific card prints (set, collector number, foil/non-foil)
- Condition tracking (Near Mint → Damaged)
- User-defined tags and custom fields (e.g., physical location, notes)
- Configurable inventory views (grid/table, custom columns, saved filters)
- Price tracking with collection valuation (TCGplayer USD, Cardmarket EUR)
- Bulk import/export (CSV)
- **3D card viewer** with rotation, zoom, and animated foil effects

---

## User Stories

### Adding Cards

**As a collector, I want to add a specific card print to my collection so I can track my inventory.**

1. Click "Add to Collection" button
2. Search for card (autocomplete, min 2 chars)
3. Select specific print from list (set icon, collector number)
4. Set quantity, condition (NM/LP/MP/HP/DMG), foil/non-foil
5. Optionally add custom fields (e.g., "Location: Binder 3, Page 12")
6. Save → Card appears in inventory

**Validation:**
- Quantity must be ≥ 1
- Cannot add duplicate `(card_print, foil, condition)` entry (update existing instead)

---

### Bulk Import

**As a user importing my collection from another app, I want to upload a CSV so I don't manually enter 1000+ cards.**

1. Click "Import CSV" button
2. Upload file with format:
   ```csv
   set_code,collector_number,quantity,condition,is_foil
   LEA,162,2,NM,true
   M11,146,4,LP,false
   ```
3. System matches cards by `(set_code, collector_number)`
4. Preview import with warnings (unmatched cards, duplicates)
5. Confirm → Cards added to collection

**Error Handling:**
- Unmatched cards: Show "Not found in Scryfall database"
- Duplicate entries: Merge quantities or skip

---

### Inventory Views

**As a user with a large collection, I want to customize how I view my inventory so I can find cards quickly.**

**Grid View:**
- Card image thumbnails (150×210px)
- Set icon badge overlay
- Quantity badge (top-right corner)
- Foil indicator (rainbow border)
- Price overlay (bottom)

**Table View:**
| Column | Description | Sortable | Filterable |
|--------|-------------|----------|------------|
| Image | Thumbnail | No | No |
| Name | Card name | Yes | Yes (autocomplete) |
| Set | Set code + icon | Yes | Yes (multi-select) |
| Quantity | # copies | Yes | Yes (range) |
| Condition | NM/LP/MP/HP/DMG | Yes | Yes (multi-select) |
| Foil | ✓ or ✗ | Yes | Yes (checkbox) |
| Price | USD or EUR | Yes | Yes (range slider) |
| Tags | User tags (pills) | No | Yes (multi-select) |
| Custom Fields | User-defined (JSONB) | No | No |

**Configurable Columns:**
- Drag-to-reorder columns
- Show/hide columns via settings menu
- Preferences saved automatically to `UserPreferences.collection_view_config`

---

### Saved Views

**As a trader, I want to save filtered views so I can quickly access my "For Trade" cards.**

1. Apply filters (e.g., tags contains "For Trade", condition = NM, price > $10)
2. Click "Save View" → Name it "Trade Binder"
3. View appears in dropdown menu
4. Click "Trade Binder" → Filters reapply instantly

**Saved View Schema (JSONB):**
```json
{
  "name": "Trade Binder",
  "filters": {
    "tags": ["For Trade"],
    "condition": ["NM"],
    "price_min": 10
  },
  "sort": {"field": "price", "order": "desc"},
  "view_mode": "grid"
}
```

---

### Condition Tracking

**Condition Definitions:**

| Code | Name | Description |
|------|------|-------------|
| **NM** | Near Mint | Appears unplayed, minimal wear |
| **LP** | Lightly Played | Minor edge wear, slight scratches |
| **MP** | Moderately Played | Noticeable wear, some whitening |
| **HP** | Heavily Played | Heavy wear, creases, but no tears |
| **DMG** | Damaged | Major creases, tears, water damage |

**Price Impact:**
- NM = 100% market price
- LP ≈ 85% (estimated, no Scryfall data)
- MP ≈ 65%
- HP ≈ 50%
- DMG ≈ 30%

---

### Tagging System

**As a user, I want to organize my collection with custom tags so I can group cards by purpose.**

**Default Tags (suggested on first use):**
- "Staples" (blue)
- "For Trade" (green)
- "Reserved List" (gold)
- "High Value" (red)

**Tag Management:**
1. Create tag: Name + color picker (hex)
2. Apply to cards: Select multiple → "Add Tag" → Choose from dropdown
3. Filter by tag: Sidebar multi-select checkboxes

**Business Rules:**
- Tags scoped per user (not global)
- Tag type = `collection` (separate from deck tags)
- Unique per `(user_id, name, type)`

---

### Price Tracking

**As an investor, I want to see my collection value so I can track appreciation.**

**Collection Valuation:**
- Total value = SUM(quantity × price × condition_multiplier)
- Foil uses `usd_foil` or `eur_foil` price
- Missing prices (null) = excluded from total

**Dashboard Widget:**
```
┌─────────────────────────────────┐
│ Collection Value                │
│ $12,345.67 USD  /  €10,987.54   │
│ Last updated: 6 hours ago       │
│ ────────────────────────────    │
│ Top 5 Cards by Value:           │
│ 1. Black Lotus [LEA] - $8,500   │
│ 2. Mox Sapphire [LEA] - $2,300  │
│ ...                             │
└─────────────────────────────────┘
```

**Breakdown View (click widget):**
- Pie chart: Value by set
- Bar chart: Value by rarity
- Table: Top 20 most valuable cards

**Price Staleness:**
- Show warning if `prices_updated_at` > 24h ago
- "Prices may be outdated. Last sync: 2 days ago"

---

### Custom Fields

**As a collector, I want to add custom metadata to cards so I can track physical location and acquisition details.**

**Example Custom Fields (JSONB):**
```json
{
  "physical_location": "Binder 3, Page 12",
  "acquired_from": "Local Game Store",
  "acquired_date": "2024-05-15",
  "purchase_price": 45.00,
  "notes": "Signed by artist at Grand Prix"
}
```

**UI Patterns:**
- Click "+ Add Field" → Key-value input
- Autocomplete suggests previous keys (e.g., "physical_location")
- Fields shown in table view (optional column)
- No schema validation (user defines structure)

---

## 3D Card Viewer

**As a user, I want to inspect cards in 3D with foil effects so I can appreciate artwork and verify details.**

### Features

1. **Full 3D rotation**
   - Mouse drag: Rotate card in 3D space
   - Touch gestures: Swipe to rotate (mobile)
   - Auto-rotate mode (optional): Slowly spins card

2. **Zoom & Pan**
   - Mouse scroll / pinch-zoom: Zoom into artwork
   - Shift+drag / two-finger drag: Pan around card
   - Double-click / double-tap: Reset to default view

3. **Foil shader effects**
   - Holographic rainbow gradient overlay
   - Light reflection shifts based on rotation angle
   - Specular highlights (metallic shine)
   - Toggle ON/OFF to compare foil vs non-foil visually

4. **Inspect mode**
   - Click specific areas (artwork, text box, mana cost) → Zoom to that region
   - Hotspots for common areas (title, type line, rules text)

5. **Performance optimization**
   - Lazy-load: Viewer only renders when modal opened (not in grid view)
   - High-res image cached in browser (reduce Scryfall API calls)
   - WebGL fallback: Static 2D image if WebGL unsupported (old browsers)

---

### Technical Implementation

**3D Library Options:**

| Library | Pros | Cons |
|---------|------|------|
| **Three.js** | Full control, mature, extensive docs | Manual setup, verbose code |
| **React Three Fiber (R3F)** | React-friendly, declarative, easier integration | Abstraction layer, learning curve |

**Recommendation:** React Three Fiber (better fit for React SPA)

**Card Model:**
- Plane mesh (flat rectangle, 63×88mm aspect ratio)
- Texture: Scryfall high-res image (`image_uris.large` or `image_uris.png`)
- Normal map (optional): Simulates foil texture depth

**Foil Shader (GLSL):**
```glsl
// Pseudo-code for holographic effect
vec2 uv = vUv;
vec3 normal = texture2D(normalMap, uv).rgb;
vec3 viewDir = normalize(cameraPos - worldPos);

// Rainbow gradient based on view angle
float angle = dot(normal, viewDir);
vec3 rainbow = hsv2rgb(vec3(angle * 0.5 + time * 0.1, 0.8, 1.0));

// Specular highlight
float specular = pow(max(dot(reflect(lightDir, normal), viewDir), 0.0), 32.0);

// Combine: base texture + rainbow + specular
gl_FragColor = texture2D(cardTexture, uv) * (1.0 + rainbow * 0.3) + specular * 0.5;
```

**Controls (OrbitControls):**
- Rotation limits: -30° to +30° (prevent flipping card upside-down)
- Zoom limits: 0.5x to 3x
- Auto-rotate speed: 10°/second

---

### UI Patterns

**Activation:**
- Grid/Table view: Click card image → "View in 3D" button appears
- Alternative: Right-click → "View in 3D" context menu

**Modal Layout:**
```
┌─────────────────────────────────────────────┐
│ [X Close]              Lightning Bolt [LEA] │
│                                             │
│          ┌─────────────────┐                │
│          │                 │                │
│          │   3D Canvas     │                │
│          │   (WebGL)       │                │
│          │                 │                │
│          └─────────────────┘                │
│                                             │
│  [Foil ON/OFF]  [Reset View]  [Auto-Rotate]│
│                                             │
│  Controls Hint:                             │
│  • Drag to rotate • Scroll to zoom          │
│  • Shift+drag to pan                        │
└─────────────────────────────────────────────┘
```

**Loading State:**
- Show spinner while high-res image downloads
- "Loading 3D model..." text
- Fallback: If > 5s, show static 2D image with "3D viewer unavailable"

**Keyboard Shortcuts:**
- `ESC`: Close modal
- `Space`: Toggle auto-rotate
- `R`: Reset view
- `F`: Toggle foil effect

**Mobile Optimizations:**
- Fullscreen modal (no padding)
- Larger tap targets (44×44px buttons)
- Gesture hints overlay (show on first open)

---

### Business Rules

1. **3D viewer only loads when clicked** (performance optimization)
   - Not preloaded in grid view (avoid rendering 100+ 3D models)
   - Modal mount triggers Three.js scene initialization

2. **Foil effect only for foil cards**
   - If `CollectionEntry.is_foil = false`, foil toggle is disabled
   - Non-foil cards show message: "This is a non-foil print"

3. **WebGL fallback**
   - Check `WebGLRenderingContext` support on mount
   - If unsupported: Show static 2D image + message "Your browser doesn't support 3D viewer. Upgrade to a modern browser."

4. **Image caching**
   - Service Worker caches Scryfall images (7-day TTL)
   - Reduces bandwidth, improves load times

5. **Error handling**
   - Image 404 (missing on Scryfall): Show placeholder "Image unavailable"
   - WebGL crash: Log error, fallback to 2D

---

### Libraries & Dependencies

**NPM Packages:**
```json
{
  "three": "^0.160.0",
  "@react-three/fiber": "^8.15.0",
  "@react-three/drei": "^9.92.0"
}
```

**drei** provides:
- `OrbitControls` component (camera rotation)
- `useTexture` hook (load images)
- `Html` component (overlay UI on 3D canvas)

**Example Component Structure:**
```tsx
// apps/web/src/components/3d-viewer/CardViewer3D.tsx
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useTexture } from '@react-three/drei'

function CardMesh({ imageUrl, isFoil }) {
  const texture = useTexture(imageUrl)

  return (
    <mesh>
      <planeGeometry args={[63, 88]} />
      <meshStandardMaterial
        map={texture}
        {...(isFoil && { /* foil shader props */ })}
      />
    </mesh>
  )
}

export function CardViewer3D({ cardPrint, isFoil }) {
  return (
    <Canvas camera={{ position: [0, 0, 150] }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} />
      <CardMesh
        imageUrl={cardPrint.image_uris.large}
        isFoil={isFoil}
      />
      <OrbitControls
        maxPolarAngle={Math.PI / 3}
        minPolarAngle={Math.PI / 3}
      />
    </Canvas>
  )
}
```

---

## API Endpoints

### `GET /api/collection`

**Description:** List user's collection with filters/sort/pagination.

**Query Params:**
- `page` (int): Page number (default 1)
- `limit` (int): Items per page (default 50, max 200)
- `sort` (string): Sort field (e.g., "name", "price", "quantity")
- `order` (string): "asc" or "desc"
- `filter_tags` (string[]): Tag IDs (OR logic)
- `filter_condition` (string[]): Conditions (e.g., ["NM", "LP"])
- `filter_foil` (boolean): Foil only

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "card_print": {
        "id": "uuid",
        "name": "Lightning Bolt",
        "set_code": "LEA",
        "collector_number": "162",
        "image_uris": {...},
        "prices": {
          "usd": "1200.00",
          "usd_foil": "1800.00"
        }
      },
      "quantity": 2,
      "condition": "NM",
      "is_foil": true,
      "custom_fields": {"location": "Binder 3"},
      "tags": [{"name": "Staples", "color": "#3B82F6"}]
    }
  ],
  "total": 1234,
  "page": 1,
  "limit": 50
}
```

---

### `POST /api/collection`

**Description:** Add card to collection.

**Request Body:**
```json
{
  "card_print_id": "uuid",
  "quantity": 2,
  "condition": "NM",
  "is_foil": true,
  "custom_fields": {"location": "Binder 3"},
  "tag_ids": ["tag-uuid-1", "tag-uuid-2"]
}
```

**Response:** `201 Created` + CollectionEntry object

**Validation:**
- `quantity` ≥ 1
- If duplicate `(user_id, card_print_id, is_foil, condition)` exists: Return `409 Conflict`

---

### `PATCH /api/collection/:id`

**Description:** Update collection entry (quantity, tags, custom fields).

**Request Body:**
```json
{
  "quantity": 3,
  "custom_fields": {"location": "Binder 4"},
  "tag_ids": ["new-tag-uuid"]
}
```

**Response:** `200 OK` + Updated CollectionEntry

---

### `DELETE /api/collection/:id`

**Description:** Remove card from collection.

**Response:** `204 No Content`

---

### `POST /api/collection/bulk-import`

**Description:** Import CSV of cards.

**Request Body:** `multipart/form-data` with CSV file

**Response:**
```json
{
  "imported": 98,
  "skipped": 2,
  "errors": [
    {"row": 42, "reason": "Card not found: set=XYZ, number=999"}
  ]
}
```

---

## Database Queries

### Collection Inventory (Grid/Table)

```sql
SELECT
  ce.id,
  ce.quantity,
  ce.condition,
  ce.is_foil,
  ce.custom_fields,
  cp.name,
  cp.set_code,
  cp.image_uris,
  cp.prices,
  cp.prices_updated_at,
  ARRAY_AGG(t.name) AS tags
FROM collection_entries ce
JOIN card_prints cp ON ce.card_print_id = cp.id
LEFT JOIN collection_entry_tags cet ON ce.id = cet.collection_entry_id
LEFT JOIN tags t ON cet.tag_id = t.id
WHERE ce.user_id = $1
GROUP BY ce.id, cp.id
ORDER BY cp.name ASC
LIMIT 50 OFFSET 0;
```

---

### Collection Valuation

```sql
SELECT
  SUM(
    ce.quantity *
    CAST(
      CASE
        WHEN ce.is_foil THEN COALESCE(cp.prices->>'usd_foil', '0')
        ELSE COALESCE(cp.prices->>'usd', '0')
      END AS NUMERIC
    )
  ) AS total_value
FROM collection_entries ce
JOIN card_prints cp ON ce.card_print_id = cp.id
WHERE ce.user_id = $1;
```

---

## Related Specs

- [Data Model](./data-model.md) — CollectionEntry, CardPrint schemas
- [Pricing](./pricing.md) — Price sync, currency conversion
- [Card Search](./card-search.md) — Autocomplete for adding cards
- [User Preferences](./user-preferences.md) — Collection view config
