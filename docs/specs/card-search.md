# Card Search (Scryfall Integration)

Fast, offline-first card search powered by Scryfall's bulk data.

---

## Overview

Decksmith maintains a **local copy** of Scryfall's complete card database (~100k cards), synced daily. This enables:
- Sub-200ms autocomplete responses
- Advanced filtering without API rate limits
- Offline deck building (after initial sync)
- Price data included (TCGplayer, Cardmarket)

---

## Features

### Daily Bulk Data Sync

**Worker Job (Cron):**
- Runs daily at **3 AM UTC**
- Downloads Scryfall's `default_cards` bulk JSON (~150 MB)
- Upserts all cards and prints to local database
- Updates prices (`usd`, `usd_foil`, `eur`, `eur_foil`)

**Sync Strategy:**
```typescript
// apps/worker/src/jobs/scryfall-sync.ts
export async function syncScryfallBulkData() {
  // 1. Fetch bulk data metadata
  const bulkDataList = await fetch('https://api.scryfall.com/bulk-data')
  const defaultCards = bulkDataList.data.find(d => d.type === 'default_cards')

  // 2. Download JSON (stream to avoid memory issues)
  const response = await fetch(defaultCards.download_uri)
  const cards = await response.json()

  // 3. Upsert cards (batch inserts for performance)
  for (const batch of chunk(cards, 1000)) {
    await upsertCardBatch(batch)
  }

  // 4. Log sync completion
  console.log(`Synced ${cards.length} cards at ${new Date().toISOString()}`)
}

async function upsertCardBatch(cards: ScryfallCard[]) {
  const cardValues = cards.map(c => ({
    oracle_id: c.oracle_id,
    name: c.name,
    mana_cost: c.mana_cost,
    type_line: c.type_line,
    oracle_text: c.oracle_text,
    colors: c.colors,
    cmc: c.cmc,
    legalities: c.legalities,
    scryfall_uri: c.scryfall_uri,
  }))

  const printValues = cards.map(c => ({
    scryfall_id: c.id,
    oracle_id: c.oracle_id,
    set_code: c.set,
    collector_number: c.collector_number,
    illustration_id: c.illustration_id,
    image_uris: c.image_uris,
    rarity: c.rarity,
    foil: c.foil,
    nonfoil: c.nonfoil,
    prices: c.prices,
    prices_updated_at: new Date(),
  }))

  // Prisma upsert (ON CONFLICT UPDATE)
  await prisma.card.createMany({ data: cardValues, skipDuplicates: false })
  await prisma.cardPrint.createMany({ data: printValues, skipDuplicates: false })
}
```

**Error Handling:**
- If Scryfall API is down: Retry 3 times with exponential backoff
- If sync fails completely: Log error, keep using stale data
- Show staleness indicator in UI: "Prices last updated: 2 days ago"

---

### Multi-Language Card Support

**Overview:**
Decksmith supports displaying cards in multiple languages, synchronized with the user's app language preference (see [user-preferences.md](./user-preferences.md)). Languages are stored locally in the database for fast, offline-first access.

**Initial Supported Languages:**
- English (`en`) — Default, always available
- French (`fr`) — MVP priority (second-largest MTG market)

**Data Model:**
Each language variant of a card print is stored as a separate `CardPrint` row with additional localization fields:

```prisma
model CardPrint {
  // ... existing fields ...

  // Multi-language support
  language          String   @default("en") // ISO 639-1 code
  localized_name    String?  // e.g., "Éclair" (Lightning Bolt in French)
  localized_type    String?  // e.g., "Éphémère" (Instant in French)
  localized_text    String?  // Oracle text in target language

  @@unique([oracle_id, set_code, collector_number, language])
  @@index([language])
  @@index([oracle_id, language])
}
```

**Sync Strategy:**
The daily Scryfall bulk sync is extended to fetch multi-language data:

```typescript
export async function syncScryfallBulkData() {
  const languages = ['en', 'fr'] // Add more as needed

  for (const lang of languages) {
    console.log(`Syncing language: ${lang}`)

    // 1. Fetch bulk data for specific language
    const bulkData = await fetchBulkDataMetadata()
    const langBulkData = bulkData.data.find(d =>
      d.type === 'default_cards' && (!d.lang || d.lang === lang)
    )

    // 2. Download and parse JSON
    const cards = await downloadAndParseJSON(langBulkData.download_uri)

    // 3. Upsert cards with language-specific fields
    for (const batch of chunk(cards, 1000)) {
      await upsertCardBatchWithLanguage(batch, lang)
    }
  }

  console.log(`Multi-language sync complete`)
}

async function upsertCardBatchWithLanguage(cards: ScryfallCard[], language: string) {
  const printValues = cards.map(c => ({
    // ... existing fields ...
    language: c.lang || 'en',
    localized_name: c.printed_name || c.name,
    localized_type: c.printed_type_line || c.type_line,
    localized_text: c.printed_text || c.oracle_text,
  }))

  await prisma.cardPrint.createMany({
    data: printValues,
    skipDuplicates: false // Upsert on conflict
  })
}
```

**Performance Impact:**
- **Storage:** +100MB per language (~150MB for EN, ~100MB for FR)
- **Sync Duration:** 15 min → 25-30 min (fetching 2 languages)
- **Database Size:** ~200MB → ~300MB (EN + FR)

**Search Behavior:**
- **Search always uses English `Card.name`** (maintains full-text index performance)
- **Results display localized names** based on user preference
- **Fallback:** If localized name missing, show English name

**API Response Example:**
```json
{
  "oracle_id": "uuid",
  "name": "Éclair",           // Localized name (French)
  "type_line": "Éphémère",    // Localized type
  "oracle_text": "L'Éclair inflige 3 blessures...",
  "language": "fr",
  "original_name": "Lightning Bolt"  // English fallback
}
```

**Localization Function:**
```typescript
export function getLocalizedCardName(
  card: Card,
  prints: CardPrint[],
  userLanguage: string
): string {
  // 1. Try user's preferred language
  const localizedPrint = prints.find(p => p.language === userLanguage)
  if (localizedPrint?.localized_name) {
    return localizedPrint.localized_name
  }

  // 2. Fallback to English
  const englishPrint = prints.find(p => p.language === 'en')
  if (englishPrint?.localized_name) {
    return englishPrint.localized_name
  }

  // 3. Final fallback: Card.name (always English)
  return card.name
}
```

**User Experience:**
1. User sets app language to French in settings
2. Card search shows French card names (e.g., "Éclair" instead of "Lightning Bolt")
3. Deck lists display localized names
4. If French translation unavailable, fallback to English
5. User can override language per search with `?language=en` query param

**Future Expansion:**
Additional languages can be added by extending the `languages` array in the sync job:
```typescript
const languages = ['en', 'fr', 'es', 'de', 'it', 'pt', 'ja', 'ko', 'ru', 'zh']
```

---

### Full-Text Search

**Postgres `tsvector` Index:**
```sql
-- Migration: Add full-text search column
ALTER TABLE cards
ADD COLUMN search_vector tsvector
GENERATED ALWAYS AS (
  to_tsvector('english',
    coalesce(name, '') || ' ' ||
    coalesce(type_line, '') || ' ' ||
    coalesce(oracle_text, '')
  )
) STORED;

CREATE INDEX cards_search_idx ON cards USING GIN(search_vector);
```

**Search Query:**
```sql
SELECT
  c.oracle_id,
  c.name,
  c.mana_cost,
  c.type_line,
  c.oracle_text,
  cp.set_code,
  cp.collector_number,
  cp.image_uris,
  cp.prices,
  ts_rank(c.search_vector, plainto_tsquery('english', $1)) AS rank
FROM cards c
JOIN card_prints cp ON c.oracle_id = cp.oracle_id
WHERE c.search_vector @@ plainto_tsquery('english', $1)
ORDER BY rank DESC, c.name ASC
LIMIT 20;
```

**Example:**
- Query: "lightning bolt"
- Matches: Cards with "Lightning" OR "Bolt" in name/text/type
- Returns: All prints of matching cards, ranked by relevance

---

### Advanced Filters

**Filter Options:**

| Filter | Type | Example |
|--------|------|---------|
| **Color** | Multi-select | Red, Blue (OR logic) |
| **CMC** | Range slider | 0-3 |
| **Rarity** | Multi-select | Rare, Mythic |
| **Set** | Multi-select | LEA, M11 (autocomplete) |
| **Legality** | Dropdown | "Legal in Commander" |
| **Card Type** | Multi-select | Instant, Sorcery |
| **Foil Available** | Checkbox | Show only foilable cards |

**Combined Query:**
```sql
WHERE
  c.search_vector @@ plainto_tsquery('english', $query)
  AND c.colors && $colors::text[]  -- Array overlap
  AND c.cmc >= $cmc_min AND c.cmc <= $cmc_max
  AND cp.rarity = ANY($rarities)
  AND cp.set_code = ANY($sets)
  AND c.legalities->>'commander' = 'legal'
  AND c.type_line ILIKE '%Instant%'
  AND cp.foil = true
```

---

### Autocomplete

**UI Pattern:**
1. User types "lig" (min 2 chars)
2. Debounce 200ms → Send request
3. Server returns top 10 matches
4. Dropdown shows:
   - Card name + set icon
   - Mana cost symbols
   - Type line
   - Price (if available)

**API Endpoint:**
```
GET /api/cards/autocomplete?q=lig&limit=10
```

**Response:**
```json
{
  "results": [
    {
      "oracle_id": "uuid",
      "name": "Lightning Bolt",
      "mana_cost": "{R}",
      "type_line": "Instant",
      "image_uris": {...},
      "prints": [
        {
          "set_code": "LEA",
          "collector_number": "162",
          "prices": {"usd": "1200.00"}
        },
        {
          "set_code": "M11",
          "collector_number": "146",
          "prices": {"usd": "1.50"}
        }
      ]
    }
  ]
}
```

---

### Print Selection

**When adding card to collection/deck:**
1. User searches "Lightning Bolt"
2. Autocomplete shows "Lightning Bolt" (50+ prints)
3. User clicks → Opens "Select Print" modal
4. Modal shows all prints with:
   - Set icon + name
   - Collector number
   - Image thumbnail
   - Foil availability (✓ or ✗)
   - Prices (USD / EUR)
5. User clicks print → Adds to collection/deck

**Sorting Options:**
- Newest first (by release date)
- Cheapest first (by price)
- Alphabetical (by set name)

---

## API Endpoints

### `GET /api/cards/search`

**Description:** Full-text search with filters.

**Query Params:**
- `q`: Search query (string)
- `colors`: Color filter (comma-separated, e.g., "R,U")
- `cmc_min`, `cmc_max`: CMC range (integers)
- `rarities`: Rarity filter (comma-separated)
- `sets`: Set codes (comma-separated)
- `legality`: Format legality (e.g., "commander:legal")
- `types`: Card types (comma-separated)
- `foil`: Boolean (foilable only)
- `language`: Language code (optional, defaults to user preference, e.g., "fr", "en")
- `page`, `limit`: Pagination

**Response:**
```json
{
  "data": [
    {
      "oracle_id": "uuid",
      "name": "Lightning Bolt",
      "mana_cost": "{R}",
      "type_line": "Instant",
      "oracle_text": "Lightning Bolt deals 3 damage...",
      "colors": ["R"],
      "cmc": 1,
      "legalities": {"commander": "legal", "vintage": "restricted"},
      "prints_count": 52
    }
  ],
  "total": 128,
  "page": 1,
  "limit": 20
}
```

---

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
  "colors": ["R"],
  "cmc": 1,
  "legalities": {...},
  "prints": [
    {
      "scryfall_id": "uuid",
      "set_code": "LEA",
      "set_name": "Limited Edition Alpha",
      "collector_number": "162",
      "rarity": "common",
      "image_uris": {...},
      "foil": false,
      "nonfoil": true,
      "prices": {
        "usd": "1200.00",
        "usd_foil": null,
        "eur": "1100.00",
        "eur_foil": null
      },
      "released_at": "1993-08-05"
    }
  ]
}
```

---

### `GET /api/cards/:oracle_id/prints`

**Description:** Get all prints of a card (for print selection modal).

**Query Params:**
- `sort`: "date" (newest first), "price" (cheapest first), "name" (alphabetical)

**Response:** Array of CardPrint objects

---

### `GET /api/cards/autocomplete`

**Description:** Autocomplete search (fast, limited results).

**Query Params:**
- `q`: Search query (min 2 chars)
- `limit`: Max results (default 10, max 20)
- `language`: Language code (optional, defaults to user preference, e.g., "fr", "en")

**Response:** Simplified card list (name, image, mana cost, top 3 prints) with localized names based on language preference

---

## Database Queries

### Autocomplete Query (Optimized)

```sql
SELECT
  c.oracle_id,
  c.name,
  c.mana_cost,
  c.type_line,
  (
    SELECT json_agg(json_build_object(
      'set_code', cp.set_code,
      'collector_number', cp.collector_number,
      'prices', cp.prices
    ))
    FROM (
      SELECT * FROM card_prints
      WHERE oracle_id = c.oracle_id
      ORDER BY prices->>'usd' ASC NULLS LAST
      LIMIT 3
    ) cp
  ) AS top_prints
FROM cards c
WHERE c.name ILIKE $1 || '%'  -- Prefix match (faster than full-text for short queries)
ORDER BY c.name ASC
LIMIT 10;
```

**Performance:**
- Uses B-tree index on `name` (prefix match)
- Subquery fetches top 3 cheapest prints
- Response time: < 50ms for prefix queries

---

### Full-Text Search Query

```sql
SELECT
  c.*,
  COUNT(cp.id) AS prints_count
FROM cards c
LEFT JOIN card_prints cp ON c.oracle_id = cp.oracle_id
WHERE
  c.search_vector @@ plainto_tsquery('english', $query)
  AND ($colors IS NULL OR c.colors && $colors::text[])
  AND ($cmc_min IS NULL OR c.cmc >= $cmc_min)
  AND ($cmc_max IS NULL OR c.cmc <= $cmc_max)
  AND ($legality_format IS NULL OR c.legalities->>$legality_format = $legality_status)
GROUP BY c.oracle_id
ORDER BY ts_rank(c.search_vector, plainto_tsquery('english', $query)) DESC
LIMIT $limit OFFSET $offset;
```

---

## Sync Job Scheduling

**Cron Expression:** `0 3 * * *` (daily at 3 AM UTC)

**BullMQ Job:**
```typescript
// apps/worker/src/queue.ts
import { Queue, Worker } from 'bullmq'

export const scryfallSyncQueue = new Queue('scryfall-sync', {
  connection: redisConnection,
})

// Schedule daily sync
scryfallSyncQueue.add(
  'sync',
  {},
  {
    repeat: { pattern: '0 3 * * *' },
    removeOnComplete: 10,  // Keep last 10 successful runs
    removeOnFail: 50,      // Keep last 50 failures
  }
)

// Worker
const scryfallSyncWorker = new Worker(
  'scryfall-sync',
  async (job) => {
    await syncScryfallBulkData()
  },
  {
    connection: redisConnection,
    concurrency: 1,  // Only one sync at a time
  }
)
```

**Monitoring:**
- Bull Board dashboard: `http://localhost:3000/admin/queues`
- View sync history, failures, retry attempts
- Alert on Slack if sync fails 3 times in a row

---

## Fallback Strategy

**If daily sync fails:**
1. Log error to monitoring system (Sentry, Datadog)
2. Keep using stale data (acceptable for 1-2 days)
3. Show warning in UI: "Card prices may be outdated. Last sync: 2 days ago."
4. Retry sync every 6 hours until successful

**If local database is corrupted:**
1. Drop all cards/prints tables
2. Re-run full sync from Scryfall
3. Estimated time: 10-15 minutes for 100k cards

---

## UI Patterns

### Search Bar (Header)

```
┌────────────────────────────────────────┐
│ 🔍 Search cards...                     │
└────────────────────────────────────────┘
       ↓ (user types "lig")
┌────────────────────────────────────────┐
│ Lightning Bolt         {R}  Instant    │
│ 󰀃 LEA #162                    $1,200   │
│ ───────────────────────────────────    │
│ Lightning Helix       {R}{W}  Instant  │
│ 󰀃 RAV #227                      $2.50  │
└────────────────────────────────────────┘
```

---

### Advanced Filters (Sidebar)

```
┌──────────────────┐
│ Filters          │
├──────────────────┤
│ Colors           │
│ ☑ White          │
│ ☐ Blue           │
│ ☑ Red            │
│──────────────────│
│ CMC: [0] ──── [7+] │
│──────────────────│
│ Rarity           │
│ ☐ Common         │
│ ☑ Rare           │
│ ☑ Mythic         │
│──────────────────│
│ Format Legality  │
│ [Commander  ▾]   │
│──────────────────│
│ [Clear Filters]  │
└──────────────────┘
```

---

### Print Selection Modal

```
┌──────────────────────────────────────────┐
│ Lightning Bolt - Select Print       [X]  │
├──────────────────────────────────────────┤
│ Sort by: [Newest ▾]                      │
├──────────────────────────────────────────┤
│ ┌──────────────────────────────────┐    │
│ │ [Image] LEA #162                 │    │
│ │ Limited Edition Alpha  •  1993   │    │
│ │ Non-foil  •  $1,200.00           │    │
│ │                     [Select]     │    │
│ └──────────────────────────────────┘    │
│ ┌──────────────────────────────────┐    │
│ │ [Image] M11 #146                 │    │
│ │ Magic 2011  •  2010              │    │
│ │ Foil/Non-foil  •  $1.50 / $3.50  │    │
│ │                     [Select]     │    │
│ └──────────────────────────────────┘    │
└──────────────────────────────────────────┘
```

---

## Performance Targets

| Metric | Target | Notes |
|--------|--------|-------|
| Autocomplete response time | < 200ms | Prefix match on indexed `name` |
| Full search response time | < 500ms | Full-text search with filters |
| Sync duration | < 15 minutes | 100k cards with prices |
| Database size | ~200 MB | Cards + prints + indexes |

---

## Related Specs

- [Data Model](./data-model.md) — Card, CardPrint schemas
- [Collection](./collection.md) — Adding cards via search
- [Deck Management](./deck-management.md) — Adding cards to deck
- [Pricing](./pricing.md) — Price data from Scryfall
