# Pricing

Track card prices, collection valuation, and deck costs using Scryfall's price data.

---

## Overview

Decksmith integrates **Scryfall price data** (TCGplayer USD, Cardmarket EUR) to provide:

- Real-time card prices (synced daily)
- Collection valuation (total value of owned cards)
- Deck cost calculator (price to build with real cards)
- Currency conversion (USD ↔ EUR)

**Data Source:** Scryfall API (prices included in daily bulk sync)

---

## Features

### Price Data Sync

**Daily Update:**

- Prices synced with Scryfall bulk data (same job as card sync)
- Stored in `CardPrint.prices` JSONB field:
  ```json
  {
    "usd": "1.23", // TCGplayer non-foil
    "usd_foil": "4.56", // TCGplayer foil
    "eur": "1.10", // Cardmarket non-foil
    "eur_foil": "3.80" // Cardmarket foil
  }
  ```
- `prices_updated_at` timestamp tracks last update

**Staleness Indicator:**

- If `prices_updated_at` > 24h ago: Show warning
- "Prices may be outdated. Last updated: 2 days ago"

**Missing Prices:**

- Not all cards have market data (e.g., promos, tokens)
- Display "—" or "Price unavailable" if `null`

---

### Collection Valuation

**As a collector, I want to see my collection's total value so I can track appreciation.**

**Calculation:**

```sql
SELECT
  SUM(
    ce.quantity *
    CAST(
      CASE
        WHEN ce.is_foil THEN COALESCE(cp.prices->>'usd_foil', cp.prices->>'usd', '0')
        ELSE COALESCE(cp.prices->>'usd', '0')
      END AS NUMERIC
    )
  ) AS total_value_usd,
  SUM(
    ce.quantity *
    CAST(
      CASE
        WHEN ce.is_foil THEN COALESCE(cp.prices->>'eur_foil', cp.prices->>'eur', '0')
        ELSE COALESCE(cp.prices->>'eur', '0')
      END AS NUMERIC
    )
  ) AS total_value_eur
FROM collection_entries ce
JOIN card_prints cp ON ce.card_print_id = cp.id
WHERE ce.user_id = $user_id;
```

**Business Rules:**

- Use foil price if `is_foil = true`, else non-foil price
- If foil price is `null`, fallback to non-foil price (approximation)
- Cards with no price data are excluded from total

---

### Collection Dashboard

**Widget:**

```
┌─────────────────────────────────┐
│ Collection Value                │
│ $12,345.67 USD  /  €10,987.54   │
│ Last updated: 6 hours ago       │
│ ────────────────────────────    │
│ Top 5 Cards by Value:           │
│ 1. Black Lotus [LEA] - $8,500   │
│ 2. Mox Sapphire [LEA] - $2,300  │
│ 3. Time Walk [LEA] - $1,200     │
│ 4. Ancestral Recall [LEA] - $800│
│ 5. Timetwister [LEA] - $545     │
└─────────────────────────────────┘
```

**Breakdown View (click widget):**

- **By Set:** Pie chart (% of total value per set)
- **By Rarity:** Bar chart (Common, Uncommon, Rare, Mythic)
- **By Color:** Pie chart (W/U/B/R/G/C/Multicolor)
- **Top 20 Most Valuable Cards:** Table with name, set, price

---

### Deck Cost Calculator

**As a budget player, I want to know how much it costs to build my deck with real cards.**

**Calculation:**

```sql
SELECT
  SUM(
    dc.quantity *
    CAST(COALESCE(cp.prices->>'usd', '0') AS NUMERIC)
  ) AS deck_cost_usd
FROM deck_cards dc
JOIN card_prints cp ON dc.card_print_id = cp.id
WHERE dc.section_id IN (
  SELECT id FROM deck_sections WHERE deck_id = $deck_id
);
```

**Per-Section Breakdown:**

```json
{
  "total_usd": 399.56,
  "total_eur": 350.0,
  "sections": [
    {
      "section_name": "Command Zone",
      "cost_usd": 120.0,
      "cost_eur": 105.0
    },
    {
      "section_name": "Mainboard",
      "cost_usd": 234.56,
      "cost_eur": 210.0
    },
    {
      "section_name": "Sideboard",
      "cost_usd": 45.0,
      "cost_eur": 35.0
    }
  ]
}
```

---

### Missing Cards Cost

**As a player, I want to know how much it costs to complete my deck (cards I don't own).**

**Calculation:**

```sql
SELECT
  SUM(
    GREATEST(dc.quantity - COALESCE(ce_total.owned, 0), 0) *
    CAST(COALESCE(cp.prices->>'usd', '0') AS NUMERIC)
  ) AS missing_cost_usd
FROM deck_cards dc
JOIN card_prints cp ON dc.card_print_id = cp.id
LEFT JOIN (
  SELECT card_print_id, SUM(quantity) AS owned
  FROM collection_entries
  WHERE user_id = $user_id
  GROUP BY card_print_id
) ce_total ON dc.card_print_id = ce_total.card_print_id
WHERE dc.section_id IN (SELECT id FROM deck_sections WHERE deck_id = $deck_id);
```

**Example:**

- Deck has 4x Lightning Bolt ($1.50 each)
- User owns 2x Lightning Bolt
- Missing: 2x ($3.00 total)

**UI Display:**

```
┌─────────────────────────────────┐
│ Deck Cost: $399.56              │
│ You own: 42/60 cards (70%)      │
│ ────────────────────────────    │
│ You need $180 to complete       │
│ ────────────────────────────    │
│ Missing Cards:                  │
│ • 4x Lightning Bolt - $6.00     │
│ • 1x Mana Crypt - $120.00       │
│ • 2x Sol Ring - $4.00           │
└─────────────────────────────────┘
```

---

### Currency Conversion

**As a European player, I want to see prices in EUR so I can budget accurately.**

**User Preference:**

- Stored in `UserPreferences.default_currency` (usd or eur)
- Applies to all price displays (collection, deck cost)

**Exchange Rate API:**

- Use free API: `https://api.exchangerate-api.com/v4/latest/USD`
- Cache exchange rate for 24 hours (daily update)
- Example response:
  ```json
  {
    "base": "USD",
    "rates": {
      "EUR": 0.92
    }
  }
  ```

**Conversion Logic:**

```typescript
export async function convertCurrency(
  amount: number,
  from: 'usd' | 'eur',
  to: 'usd' | 'eur'
): Promise<number> {
  if (from === to) return amount;

  const rate = await getExchangeRate();
  return from === 'usd' ? amount * rate.USD_to_EUR : amount / rate.USD_to_EUR;
}
```

**Fallback:**

- If Scryfall has only USD price, convert to EUR using exchange rate
- If Scryfall has only EUR price, convert to USD

---

## API Endpoints

### `GET /api/collection/valuation`

**Description:** Get total collection value.

**Query Params:**

- `currency`: "usd" or "eur" (default from user preferences)

**Response:**

```json
{
  "total": 12345.67,
  "currency": "usd",
  "by_set": {
    "LEA": 8500.00,
    "M11": 1200.50,
    ...
  },
  "by_rarity": {
    "mythic": 5000.00,
    "rare": 4000.00,
    "uncommon": 2000.00,
    "common": 1345.67
  },
  "top_cards": [
    {
      "name": "Black Lotus",
      "set_code": "LEA",
      "quantity": 1,
      "price": 8500.00
    }
  ],
  "last_updated": "2024-01-15T03:00:00Z"
}
```

---

### `GET /api/decks/:id/cost`

**Description:** Calculate deck cost.

**Query Params:**

- `currency`: "usd" or "eur"

**Response:**

```json
{
  "total": 399.56,
  "currency": "usd",
  "sections": [
    {
      "section_name": "Mainboard",
      "cost": 234.56
    }
  ],
  "missing_cost": 180.0,
  "coverage_percent": 70
}
```

---

### `GET /api/exchange-rate`

**Description:** Get current USD ↔ EUR exchange rate.

**Response:**

```json
{
  "usd_to_eur": 0.92,
  "eur_to_usd": 1.087,
  "updated_at": "2024-01-15T00:00:00Z"
}
```

---

## Business Rules

1. **Prices updated daily** via Scryfall sync (3 AM UTC)
2. **Show staleness warning** if `prices_updated_at` > 24h old
3. **Missing prices** (null): Exclude from totals, show "—" in UI
4. **Condition multipliers** (future feature):
   - NM = 100% of market price
   - LP ≈ 85%, MP ≈ 65%, HP ≈ 50%, DMG ≈ 30%
5. **Exchange rate cached** for 24 hours (reduce API calls)

---

## Price Trends (Future Feature)

**Track price history over time:**

- Store daily snapshots in `price_history` table
- Line chart showing price trends (7d, 30d, 90d, 1y)
- Alert on significant price changes (e.g., card jumped 50%)

**Schema:**

```sql
CREATE TABLE price_history (
  id UUID PRIMARY KEY,
  card_print_id UUID REFERENCES card_prints(id),
  date DATE NOT NULL,
  usd DECIMAL,
  usd_foil DECIMAL,
  eur DECIMAL,
  eur_foil DECIMAL,
  UNIQUE (card_print_id, date)
);
```

---

## UI Patterns

### Collection Valuation Dashboard

```
┌─────────────────────────────────────────┐
│ Collection Value                        │
│ ═══════════════════════════════════════ │
│ $12,345.67 USD  /  €10,987.54 EUR       │
│ Last updated: 6 hours ago               │
│                                         │
│ ┌─ Value by Set ────────────────────┐  │
│ │ [Pie Chart]                       │  │
│ │ • LEA: 69%  • M11: 10%  • ...     │  │
│ └───────────────────────────────────┘  │
│                                         │
│ ┌─ Top 20 Cards ────────────────────┐  │
│ │ 1. Black Lotus [LEA]    $8,500.00 │  │
│ │ 2. Mox Sapphire [LEA]   $2,300.00 │  │
│ │ ...                               │  │
│ └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

---

### Deck Cost Summary

```
┌─────────────────────────────────┐
│ Atraxa Superfriends             │
│ ────────────────────────────    │
│ Deck Cost: $399.56 USD          │
│ You own: 42/60 cards (70%)      │
│ Missing: $180.00                │
│                                 │
│ [Buy Missing Cards (TCGplayer)] │
└─────────────────────────────────┘
```

---

## Mobile Considerations

### Mobile Web (320-767px)

**Price Display:**

- **Simplified price charts**: Show current price only (hide historical charts by default)
- **"View History" button**: Tap to expand full 30-day chart
- **Currency toggle**: Tap [USD] [EUR] buttons (44px touch targets)

**Price Tracking:**

- **Bottom sheet**: Tap "Track Price" → Sheet with notification settings
- **Watchlist**: Card list view (not table)

**Touch Interactions:**

- All buttons: 44px minimum
- Chart interactions: Tap data point → Show tooltip with exact price
- Pull to refresh: Reload prices

**Performance Targets:**

- Price load: < 300ms (cached for 5 minutes)
- Chart render: < 200ms (client-side calculation)

**Offline Behavior:**

- Requires internet (prices need API)
- Error if offline: "No internet. Prices require connection."
- Show "Last updated" timestamp with stale prices

### Tablet (768-1023px)

**Full charts**: Show historical price charts by default

### Future Native Mobile

**Platform Features:**

- **Push notifications**: Price drop alerts
- **Background sync**: Update prices daily (Wi-Fi only)
- **Local cache**: Store recent prices for offline viewing

### Related ADRs

- [ADR-0008: Mobile-First Web Design Principles](../adr/0008-mobile-first-web-design-principles.md)
  — Performance targets
- [ADR-0009: Responsive Feature Strategy](../adr/0009-responsive-feature-strategy.md) — Simplified
  charts on mobile

---

## Related Specs

- [Data Model](./data-model.md) — CardPrint prices schema
- [Collection](./collection.md) — Price display in inventory
- [Deck Management](./deck-management.md) — Deck cost calculator
- [Card Search](./card-search.md) — Scryfall sync includes prices
