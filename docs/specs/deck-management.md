# Deck Management

Build and validate Magic: The Gathering decks with configurable sections, format templates, and coverage tracking.

---

## Features Overview

- CRUD operations for decks
- **Configurable sections** (not hardcoded zones) with format templates
- Format validation (singleton, color identity, banlists)
- Coverage system (which cards you own vs. need to proxy)
- Deck statistics (mana curve, color distribution, CMC)
- Deck cost calculator (total price with real cards)
- User-managed tags for organization

---

## User Stories

### Creating a Deck

**As a Commander player, I want to create a new deck with pre-configured sections so I can start building quickly.**

1. Click "New Deck" button
2. Enter deck name (e.g., "Atraxa Superfriends")
3. Select format from dropdown:
   - Commander
   - Standard
   - Modern
   - Pioneer
   - Limited
   - Casual
4. System auto-creates sections based on format:
   - **Commander:** Command Zone (0), Mainboard (1), Maybeboard (2)
   - **Constructed (60):** Mainboard (0), Sideboard (1), Maybeboard (2)
   - **Limited:** Mainboard (0), Sideboard (1)
   - **Casual:** Mainboard (0)

**Default validation rules applied:**
- Commander Mainboard: `{max_cards: 100, singleton: true, color_identity: ["W","U","B","G"]}`
- Constructed Sideboard: `{max_cards: 15}`

---

### Configurable Sections

**As a deck builder, I want to organize my deck into custom sections so I can categorize cards by role (Ramp, Removal, Win Cons).**

**Section Management:**
1. Click "+ Add Section" button
2. Enter section name (e.g., "Ramp", "Card Draw", "Removal")
3. Optionally set validation rules:
   - Max cards: Integer (e.g., 15 for "Ramp")
   - Singleton: Boolean (enforce max 1 copy)
   - Color restrictions: Array (e.g., ["G"] for green ramp only)
4. Drag sections to reorder (changes `position` field)
5. Right-click section → Rename or Delete

**Business Rules:**
- User can delete ALL default sections (free-form mode)
- Can't delete section if it contains cards (must move cards first)
- Position auto-adjusts on delete (no gaps)

---

### Adding Cards to Deck

**As a user, I want to add specific card prints to my deck so I can track exactly which versions I'm using.**

**Add Card Flow:**
1. Click "+ Add Card" in section
2. Search autocomplete (min 2 chars, debounced)
3. Select card from dropdown
4. If multiple prints exist, choose edition:
   - Show set icon + collector number
   - Display prices (USD/EUR)
5. Set quantity (default 1)
6. Card added to section at bottom position

**Drag-and-Drop:**
- Drag card between sections → Moves card
- Drag card within section → Reorders position
- Visual feedback: Ghost card follows cursor

**Validation on Add:**
- Check section rules (max_cards, singleton, color_identity)
- If violation: Show error, prevent add
- Example: "Cannot add Lightning Bolt (red) to this section (color_identity: [W,U])"

---

### Format Validation

**Format-Specific Rules:**

#### Commander
- **Mainboard:** Exactly 100 cards (singleton, except basic lands)
- **Command Zone:** 1-2 cards (commander, partner, or companion)
- **Color Identity:** All cards must match commander's color identity
  - Example: Atraxa (WUBG) can include any white/blue/black/green cards
  - Example: Lightning Bolt (R) is illegal in Atraxa deck
- **Banlist:** Check `card.legalities.commander` (warn if "banned")

#### Constructed (60-card formats)
- **Mainboard:** 60+ cards
- **Sideboard:** 0-15 cards
- **Max 4 copies** per card (except basic lands)
- **Banlist:** Check `card.legalities.{standard|modern|pioneer}`

#### Limited
- **Mainboard:** 40+ cards
- **Sideboard:** Unlimited
- **No copy limit**
- **No banlist**

#### Casual
- **No validation** (anything goes)

---

### Coverage Indicator

**As a player, I want to see which deck cards I own vs. need to proxy so I can plan purchases.**

**Coverage Calculation:**
```sql
SELECT
  dc.card_print_id,
  dc.quantity AS needed,
  COALESCE(SUM(ce.quantity), 0) AS owned
FROM deck_cards dc
LEFT JOIN collection_entries ce
  ON ce.card_print_id = dc.card_print_id
  AND ce.user_id = $user_id
WHERE dc.section_id IN (SELECT id FROM deck_sections WHERE deck_id = $deck_id)
GROUP BY dc.card_print_id, dc.quantity;
```

**Coverage Percentage:**
```
owned_cards = COUNT(DISTINCT card_print_id WHERE owned > 0)
total_cards = COUNT(DISTINCT card_print_id)
coverage = (owned_cards / total_cards) * 100
```

**Per-Card Indicators:**
- ✓ (green): `owned >= needed` (fully owned)
- ⚠ (yellow): `owned > 0 AND owned < needed` (partial, e.g., own 2/4 copies)
- ✗ (red): `owned = 0` (missing, need to proxy)

**UI Display:**
```
┌─────────────────────────────────┐
│ Atraxa Superfriends             │
│ Coverage: 42/60 cards (70%)     │
│ ────────────────────────────    │
│ Mainboard (60)                  │
│   ✓ Sol Ring [C14]         1    │
│   ⚠ Lightning Bolt [M11]   4/2  │ ← Own 2, need 4
│   ✗ Mana Crypt [EMA]       1    │
└─────────────────────────────────┘
```

---

### Deck Statistics

**Mana Curve:**
- Bar chart: CMC (0-7+) vs. Card count
- Helps identify mana distribution

**Color Distribution:**
- Pie chart: % of cards per color (W/U/B/R/G/C)
- Breakdown: Colored mana symbols in costs

**Card Types:**
- Creatures: 25
- Instants: 12
- Sorceries: 8
- Enchantments: 10
- Artifacts: 5
- Planeswalkers: 3
- Lands: 37

**Average CMC:**
- Total CMC / Total non-land cards
- Example: "Average CMC: 3.2"

---

### Deck Cost Calculator

**As a budget player, I want to see how much it costs to build my deck with real cards so I can decide what to proxy.**

**Calculation:**
```
deck_cost = SUM(
  card_quantity ×
  CASE
    WHEN card_print.prices->>preferred_currency IS NOT NULL
      THEN CAST(card_print.prices->>preferred_currency AS NUMERIC)
    ELSE 0
  END
)
```

**Per-Section Breakdown:**
- Mainboard: $234.56
- Sideboard: $45.00
- Command Zone: $120.00
- **Total:** $399.56

**Missing Cards Cost:**
- Calculate cost of cards NOT in collection
- "You need $180 more to complete this deck"

**Currency Toggle:**
- USD (TCGplayer) or EUR (Cardmarket)
- Respects `UserPreferences.default_currency`

---

### Tagging System

**As an organizer, I want to tag decks by theme so I can filter my collection.**

**Default Tag Suggestions:**
- "Competitive" (red)
- "Budget" (green)
- "Casual" (blue)
- "Needs Testing" (yellow)

**Tag Application:**
1. Click "Add Tag" on deck header
2. Select existing tag or create new (name + color)
3. Tags displayed as colored pills
4. Filter deck list by tag (sidebar checkboxes)

**Business Rules:**
- Tag type = `deck` (separate from collection tags)
- Unique per `(user_id, name, type)`

---

## Configurable Section Templates

### Format: Commander

**Default Sections:**
```json
[
  {
    "name": "Command Zone",
    "position": 0,
    "validation_rules": {
      "max_cards": 2,
      "singleton": true
    }
  },
  {
    "name": "Mainboard",
    "position": 1,
    "validation_rules": {
      "max_cards": 100,
      "singleton": true,
      "color_identity": ["W", "U", "B", "G"] // Extracted from commander
    }
  },
  {
    "name": "Maybeboard",
    "position": 2,
    "validation_rules": null // No limits
  }
]
```

**Validation Logic:**
1. Check total mainboard count = 100
2. Check all mainboard cards are singleton (except basic lands)
3. Check color identity matches commander
4. Check banlist: `card.legalities.commander !== "banned"`

---

### Format: Constructed (60)

**Default Sections:**
```json
[
  {
    "name": "Mainboard",
    "position": 0,
    "validation_rules": {
      "min_cards": 60
    }
  },
  {
    "name": "Sideboard",
    "position": 1,
    "validation_rules": {
      "max_cards": 15
    }
  },
  {
    "name": "Maybeboard",
    "position": 2,
    "validation_rules": null
  }
]
```

**Validation Logic:**
1. Check mainboard ≥ 60 cards
2. Check sideboard ≤ 15 cards
3. Check max 4 copies per card (across mainboard + sideboard)
4. Check banlist for selected format (standard/modern/pioneer)

---

### Format: Free-Form

**No default sections** — User starts with empty deck and creates custom sections.

**Use Cases:**
- Theme decks (organize by "Ramp", "Removal", "Win Cons")
- Cube drafting (organize by CMC or color)
- Testing configurations

---

## API Endpoints

### `GET /api/decks`

**Description:** List user's decks with filters/sort.

**Query Params:**
- `page`, `limit`: Pagination
- `sort`: "name", "created_at", "updated_at"
- `order`: "asc", "desc"
- `filter_tags`: Tag IDs (OR logic)
- `filter_format`: Format enum

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Atraxa Superfriends",
      "format": "commander",
      "is_public": false,
      "tags": [{"name": "Competitive", "color": "#EF4444"}],
      "card_count": 100,
      "coverage": 70,
      "total_cost": 399.56,
      "created_at": "2024-01-15T10:00:00Z"
    }
  ],
  "total": 5,
  "page": 1
}
```

---

### `POST /api/decks`

**Description:** Create new deck with format template.

**Request Body:**
```json
{
  "name": "Atraxa Superfriends",
  "format": "commander",
  "description": "Planeswalker tribal"
}
```

**Response:** `201 Created` + Deck object with auto-created sections

---

### `GET /api/decks/:id`

**Description:** Get deck details with sections and cards.

**Response:**
```json
{
  "id": "uuid",
  "name": "Atraxa Superfriends",
  "format": "commander",
  "sections": [
    {
      "id": "uuid",
      "name": "Command Zone",
      "position": 0,
      "validation_rules": {"max_cards": 2},
      "cards": [
        {
          "id": "uuid",
          "card_print": {...},
          "quantity": 1,
          "position": 0,
          "coverage": "owned" // "owned", "partial", "missing"
        }
      ]
    }
  ],
  "stats": {
    "total_cards": 100,
    "coverage_percent": 70,
    "total_cost_usd": 399.56,
    "mana_curve": {"0": 5, "1": 8, "2": 12, ...},
    "color_distribution": {"W": 20, "U": 25, ...},
    "average_cmc": 3.2
  }
}
```

---

### `PATCH /api/decks/:id`

**Description:** Update deck metadata.

**Request Body:**
```json
{
  "name": "New Name",
  "description": "Updated description",
  "is_public": true,
  "tag_ids": ["tag-uuid-1"]
}
```

---

### `DELETE /api/decks/:id`

**Description:** Delete deck (cascades to sections and cards).

**Response:** `204 No Content`

---

### `POST /api/decks/:id/sections`

**Description:** Add custom section to deck.

**Request Body:**
```json
{
  "name": "Ramp",
  "position": 3,
  "validation_rules": {"max_cards": 15}
}
```

**Response:** `201 Created` + DeckSection object

---

### `PATCH /api/decks/:deck_id/sections/:section_id`

**Description:** Rename section or update validation rules.

---

### `DELETE /api/decks/:deck_id/sections/:section_id`

**Description:** Delete section (must be empty, or specify `?force=true` to cascade delete cards).

---

### `POST /api/decks/:deck_id/sections/:section_id/cards`

**Description:** Add card to section.

**Request Body:**
```json
{
  "card_print_id": "uuid",
  "quantity": 4
}
```

**Validation:**
- Check section validation rules (max_cards, singleton, color_identity)
- Return 400 Bad Request if violation

---

### `PATCH /api/decks/:deck_id/sections/:section_id/cards/:card_id`

**Description:** Update card quantity or position (for reordering).

---

### `DELETE /api/decks/:deck_id/sections/:section_id/cards/:card_id`

**Description:** Remove card from section.

---

### `GET /api/decks/:id/coverage`

**Description:** Calculate deck coverage (owned vs. needed cards).

**Response:**
```json
{
  "total_cards": 60,
  "owned_cards": 42,
  "coverage_percent": 70,
  "cards": [
    {
      "card_print_id": "uuid",
      "name": "Lightning Bolt",
      "needed": 4,
      "owned": 2,
      "status": "partial" // "owned", "partial", "missing"
    }
  ]
}
```

---

### `GET /api/decks/:id/stats`

**Description:** Get deck statistics (mana curve, colors, CMC).

**Response:** Stats object (see `GET /api/decks/:id` response)

---

### `GET /api/decks/:id/cost`

**Description:** Calculate deck cost (total + per-section breakdown).

**Query Params:**
- `currency`: "usd" or "eur"

**Response:**
```json
{
  "total": 399.56,
  "currency": "usd",
  "breakdown": {
    "Command Zone": 120.00,
    "Mainboard": 234.56,
    "Sideboard": 45.00
  },
  "missing_cost": 180.00
}
```

---

## Validation Logic (Domain Layer)

### Singleton Validation

```typescript
// packages/domain/src/validation/singleton.ts
export function validateSingleton(cards: DeckCard[]): ValidationError[] {
  const counts = new Map<string, number>()

  for (const card of cards) {
    const oracleId = card.cardPrint.oracleId
    const current = counts.get(oracleId) || 0
    counts.set(oracleId, current + card.quantity)
  }

  const errors: ValidationError[] = []
  for (const [oracleId, count] of counts.entries()) {
    if (count > 1 && !isBasicLand(oracleId)) {
      errors.push({
        type: 'singleton_violation',
        oracleId,
        count,
        message: `${getCardName(oracleId)}: ${count} copies (max 1 allowed)`
      })
    }
  }

  return errors
}

function isBasicLand(oracleId: string): boolean {
  const basicLands = [
    'plains', 'island', 'swamp', 'mountain', 'forest',
    'wastes', 'snow-covered plains', 'snow-covered island', // etc.
  ]
  return basicLands.includes(getCardName(oracleId).toLowerCase())
}
```

---

### Color Identity Validation

```typescript
// packages/domain/src/validation/color-identity.ts
export function validateColorIdentity(
  cards: DeckCard[],
  allowedColors: string[]
): ValidationError[] {
  const errors: ValidationError[] = []

  for (const card of cards) {
    const cardColors = card.cardPrint.card.colors || []
    const invalidColors = cardColors.filter(c => !allowedColors.includes(c))

    if (invalidColors.length > 0) {
      errors.push({
        type: 'color_identity_violation',
        cardName: card.cardPrint.card.name,
        invalidColors,
        message: `${card.cardPrint.card.name} contains ${invalidColors.join(', ')} (not in commander's color identity)`
      })
    }
  }

  return errors
}
```

---

### Banlist Validation

```typescript
// packages/domain/src/validation/banlist.ts
export function validateBanlist(
  cards: DeckCard[],
  format: string
): ValidationError[] {
  const errors: ValidationError[] = []

  for (const card of cards) {
    const legality = card.cardPrint.card.legalities[format]

    if (legality === 'banned') {
      errors.push({
        type: 'banlist_violation',
        cardName: card.cardPrint.card.name,
        format,
        message: `${card.cardPrint.card.name} is banned in ${format}`
      })
    }

    if (legality === 'restricted' && card.quantity > 1) {
      errors.push({
        type: 'restricted_violation',
        cardName: card.cardPrint.card.name,
        format,
        message: `${card.cardPrint.card.name} is restricted in ${format} (max 1 copy)`
      })
    }
  }

  return errors
}
```

---

## UI Patterns

### Deck Builder Layout

```
┌─────────────────────────────────────────────┐
│ [< Back]  Atraxa Superfriends        [Save] │
│ Format: Commander  •  Coverage: 70%         │
│ Cost: $399.56  •  Tags: [Competitive]       │
├─────────────────────────────────────────────┤
│ [+ Add Section]  [+ Add Card]  [Validate]   │
├─────────────────────────────────────────────┤
│ ▼ Command Zone (1/2)                        │
│   Atraxa, Praetors' Voice [C16]  ✓     $20  │
│                                             │
│ ▼ Mainboard (98/100)   [+ Add Card]        │
│   Sol Ring [C14]                ✓      $2   │
│   Lightning Bolt [M11]    ⚠ (2/4)     $8   │
│   Mana Crypt [EMA]              ✗     $120  │
│   ...                                       │
│                                             │
│ ▼ Maybeboard (5)                            │
│   Cyclonic Rift [RTR]           ✗     $30   │
└─────────────────────────────────────────────┘
```

**Sidebar:**
- Deck Stats (Mana Curve chart)
- Color Distribution (Pie chart)
- Card Types breakdown

---

### Validation Errors Display

```
┌─────────────────────────────────────────┐
│ ⚠ Validation Errors (3)                 │
├─────────────────────────────────────────┤
│ ❌ Mainboard has 102 cards (max 100)    │
│ ❌ Lightning Bolt: 4 copies (max 1)     │
│ ❌ Mana Crypt is banned in Commander    │
└─────────────────────────────────────────┘
```

---

## Related Specs

- [Data Model](./data-model.md) — Deck, DeckSection, DeckCard schemas
- [Collection](./collection.md) — Coverage calculation
- [Pricing](./pricing.md) — Deck cost calculation
- [Card Search](./card-search.md) — Adding cards to deck
