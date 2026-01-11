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

### Enhanced Deck Statistics

**Overview:**
Beyond basic mana curve and color distribution, Decksmith provides strategic deck analysis to help identify strengths and weaknesses. All statistics are calculated using oracle text pattern matching (no external APIs).

#### Card Draw Analysis

**Metrics:**
- **Total draw sources**: Count of cards with draw effects
- **Permanent draw engines**: Cards that repeatedly draw (Rhystic Study, Phyrexian Arena)
- **One-shot draw**: Cards that draw once (Divination, Night's Whisper)
- **Average draw per turn cycle**: Estimated cards drawn per full rotation (4 turns)

**Pattern Detection:**
Uses regex patterns to identify draw effects:
```typescript
/draw (\d+) cards?/i        // "draw 2 cards"
/draw a card/i               // "draw a card"
/whenever .* draw a card/i   // Triggered draw
```

**Example Output:**
```json
{
  "card_draw": {
    "sources": [
      { "card_name": "Rhystic Study", "type": "permanent", "draw_amount": 1, "cmc": 3 },
      { "card_name": "Divination", "type": "one_shot", "draw_amount": 2, "cmc": 3 }
    ],
    "total_draw_spells": 12,
    "permanent_draw_engines": 5,
    "avg_draw_per_cycle": 2.5
  }
}
```

#### Removal & Interaction Analysis

**Categories:**
- **Spot removal**: Single-target removal (Swords to Plowshares, Murder)
- **Board wipes**: Mass removal (Wrath of God, Blasphemous Act)
- **Counters**: Counterspells (Counterspell, Negate)
- **Removal density**: Percentage of non-land cards that interact

**Pattern Detection:**
```typescript
/destroy target creature/i      // Spot removal (creature)
/destroy target artifact/i       // Spot removal (artifact)
/destroy all creatures/i         // Board wipe
/counter target spell/i          // Counterspell
```

**Example Output:**
```json
{
  "removal": {
    "spot_removal": [
      { "card_name": "Swords to Plowshares", "category": "creature", "cmc": 1 },
      { "card_name": "Nature's Claim", "category": "artifact", "cmc": 1 }
    ],
    "board_wipes": [
      { "card_name": "Wrath of God", "category": "creature", "cmc": 4 }
    ],
    "counters": [
      { "card_name": "Counterspell", "category": "counter", "cmc": 2 }
    ],
    "total_interaction": 15,
    "removal_density": 25.5
  }
}
```

**Removal Density Calculation:**
```
removal_density = (total_interaction / non_land_cards) × 100
```

Example: 15 interaction spells / 63 non-land cards = 23.8% density

#### Ramp & Acceleration Analysis

**Categories:**
- **Mana rocks**: Artifacts that tap for mana (Sol Ring, Arcane Signet)
- **Land ramp**: Spells that fetch lands (Rampant Growth, Cultivate)
- **Mana dorks**: Creatures that tap for mana (Llanowar Elves, Birds of Paradise)
- **Ramp curve**: Distribution of ramp by CMC (helps identify early vs. late ramp)
- **Average ramp CMC**: When ramp comes online

**Pattern Detection:**
```typescript
// Mana dorks (creatures that tap for mana)
typeLine.includes('creature') && oracleText.match(/\{t\}: add/i)

// Land ramp
oracleText.match(/search .* library .* land|put .* land .* onto the battlefield/i)

// Mana rocks
typeLine.includes('artifact') && oracleText.match(/\{t\}: add/i)
```

**Example Output:**
```json
{
  "ramp": {
    "mana_rocks": [
      { "card_name": "Sol Ring", "cmc": 1, "ramp_amount": 2 },
      { "card_name": "Arcane Signet", "cmc": 2, "ramp_amount": 1 }
    ],
    "land_ramp": [
      { "card_name": "Rampant Growth", "cmc": 2, "ramp_amount": 1 },
      { "card_name": "Cultivate", "cmc": 3, "ramp_amount": 2 }
    ],
    "mana_dorks": [
      { "card_name": "Llanowar Elves", "cmc": 1, "ramp_amount": 1 }
    ],
    "total_ramp": 12,
    "avg_ramp_cmc": 2.3,
    "ramp_curve": { "1": 5, "2": 4, "3": 3 }
  }
}
```

**Ramp Curve Visualization:**
```
CMC 1: █████ (5 cards)
CMC 2: ████  (4 cards)
CMC 3: ███   (3 cards)
```

#### Win Condition Analysis

**Categories:**
- **Primary win cons**: Cards that instantly win or create overwhelming advantage
- **Backup win cons**: High-power finishers (large creatures, planeswalkers)
- **Combo pieces**: Cards that combo together for wins
- **Redundancy score**: How many win conditions deck has (0-100%)

**Pattern Detection:**
```typescript
// Instant wins
oracleText.match(/you win the game|target player loses the game/i)

// High-power finishers
typeLine.includes('Creature') && power >= 5

// Combo pieces (heuristic)
oracleText.match(/when .* enters the battlefield|whenever .* deals damage/i)
```

**Example Output:**
```json
{
  "win_conditions": {
    "primary_win_cons": [
      { "card_name": "Thassa's Oracle", "type": "instant_win", "cmc": 2 },
      { "card_name": "Approach of the Second Sun", "type": "instant_win", "cmc": 7 }
    ],
    "backup_win_cons": [
      { "card_name": "Atraxa, Praetors' Voice", "type": "finisher", "cmc": 4 },
      { "card_name": "Craterhoof Behemoth", "type": "finisher", "cmc": 8 }
    ],
    "combo_pieces": [
      { "card_name": "Demonic Consultation", "type": "combo_piece", "cmc": 1 }
    ],
    "redundancy_score": 80
  }
}
```

**Redundancy Score Calculation:**
```
redundancy_score = min((total_win_cons / 5) × 100, 100)
```
- 0 win cons = 0% (no way to win)
- 3 win cons = 60% (fragile)
- 5+ win cons = 100% (redundant)

**API Endpoint:**
```
GET /api/decks/:id/stats/enhanced
```

Returns all four analyses in a single response.

**Performance:**
- Calculation time: < 500ms for 100-card deck
- All pattern matching done in application layer (no database queries)
- Results cached for 5 minutes (invalidated on deck edit)

---

### AI-Powered Card Recommendations

**Overview:**
Decksmith uses a **hybrid recommendation system** (rules-based algorithm + LLM refinement) to suggest cards that improve deck strategy. Recommendations are:
- **Pricing-aware**: Prioritize cards in user's budget
- **Collection-aware**: Highlight cards user already owns
- **Format-aware**: Only suggest legal cards
- **Strategic**: Address specific deck weaknesses

#### How It Works

**Step 1: Deck Analysis**
The system analyzes the deck using enhanced statistics (above) to identify gaps:
- Low ramp density (< target for format)
- Insufficient card draw
- Missing removal types (no board wipes)
- Low win condition redundancy

**Step 2: Rules-Based Suggestions**
Algorithm generates candidate cards based on gaps:
```typescript
function generateRuleBasedSuggestions(deck, gaps, userCollection) {
  const suggestions = []

  // Example: Ramp gap
  if (gaps.ramp === 'low') {
    const rampCards = findSimilarCards({
      category: 'ramp',
      colors: deck.colorIdentity,
      cmc_max: 3,
      format: deck.format,
    })

    for (const card of rampCards.slice(0, 5)) {
      suggestions.push({
        oracle_id: card.oracle_id,
        card_name: card.name,
        category: 'ramp',
        priority: 'high',
        reason: 'Low ramp density. This accelerates mana.',
        price_usd: card.prices?.usd,
        in_collection: userCollection.includes(card.oracle_id),
      })
    }
  }

  // Sort: high priority → in collection → cheap
  return suggestions.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority === 'high' ? -1 : 1
    if (a.in_collection !== b.in_collection) return a.in_collection ? -1 : 1
    return (a.price_usd || 999) - (b.price_usd || 999)
  })
}
```

**Step 3: LLM Refinement**
Claude API refines suggestions with strategic reasoning:

**Prompt Template:**
```
You are an expert MTG deck builder analyzing a Commander deck.

Deck: "Atraxa Superfriends"
Stats: { ramp: { total_ramp: 5 }, card_draw: { total_draw_spells: 8 }, ... }
Gaps: { ramp: "low", card_draw: "adequate", removal: { board_wipes: "missing" } }

Rule-based suggestions:
- Sol Ring ($1.50): Low ramp density. This accelerates mana.
- Arcane Signet ($2.00): Fixes colors and ramps.
- Wrath of God ($5.00): No board wipes. Resets battlefield.

Task:
1. Summarize deck strengths/weaknesses (2-3 sentences)
2. Refine suggestions: keep good ones, remove bad ones, add alternatives
3. Prioritize by strategic impact

Output JSON:
{
  "summary": "...",
  "suggestions": [{ "card_name": "...", "priority": "high", "reasoning": "..." }],
  "reasoning": "..."
}
```

**LLM Response Example:**
```json
{
  "summary": "Deck has strong card draw but lacks early ramp and board wipes. This makes it vulnerable to aggressive strategies and tribal decks. Adding 2-3 mana rocks and a mass removal spell improves consistency.",
  "suggestions": [
    {
      "card_name": "Arcane Signet",
      "priority": "high",
      "reasoning": "Fixes colors in 4-color deck and ramps turn 2. Essential for consistency."
    },
    {
      "card_name": "Wrath of God",
      "priority": "high",
      "reasoning": "Your only board wipe is Cyclonic Rift. Wrath provides unconditional removal at instant speed."
    },
    {
      "card_name": "Sol Ring",
      "priority": "medium",
      "reasoning": "Powerful ramp, but algorithm already suggested two mana rocks. Consider cutting a higher CMC card instead."
    }
  ],
  "reasoning": "Prioritized Arcane Signet over Sol Ring because deck needs color fixing more than raw mana. Wrath of God is critical since deck has no other unconditional board wipes."
}
```

#### Job Queue Integration

Recommendations are generated asynchronously using BullMQ (see [ADR-0007](../adr/0007-job-queue-bullmq-redis.md)):

**Queue Job:**
```typescript
// apps/worker/src/jobs/deck-recommendations.ts
export const recommendationsWorker = new Worker(
  'deck-recommendations',
  async (job) => {
    const { deckId, userId } = job.data

    // 1. Fetch deck + stats
    const deck = await fetchDeckWithStats(deckId)
    const userCollection = await fetchUserCollection(userId)

    // 2. Run rules-based algorithm
    const gaps = identifyDeckGaps(deck, deck.stats)
    const ruleSuggestions = await generateRuleBasedSuggestions(deck, gaps, userCollection)

    // 3. LLM refinement (Claude API)
    const claudeClient = new ClaudeClient(process.env.ANTHROPIC_API_KEY)
    const llmResult = await claudeClient.analyzeDeck({
      deck_name: deck.name,
      format: deck.format,
      card_list: deck.cards.map(c => `${c.name} (${c.cmc})`),
      current_stats: deck.stats,
      identified_gaps: gaps,
      rule_suggestions: ruleSuggestions,
    })

    // 4. Save to database
    const costUsd = calculateLLMCost(llmResult.usage)

    await prisma.deckRecommendation.create({
      data: {
        deck_id: deckId,
        algorithm_version: 'v1.0.0',
        identified_gaps: gaps,
        rule_suggestions: ruleSuggestions,
        llm_model: 'claude-3.5-sonnet-20250929',
        llm_prompt_tokens: llmResult.usage.prompt_tokens,
        llm_completion_tokens: llmResult.usage.completion_tokens,
        llm_cost_usd: costUsd,
        llm_suggestions: llmResult.refined_suggestions,
        llm_summary: llmResult.summary,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7-day TTL
      },
    })

    return { success: true, cost_usd: costUsd }
  },
  {
    connection: redisConnection,
    concurrency: 2,
    limiter: { max: 10, duration: 60000 }, // Anthropic rate limit protection
  }
)
```

#### API Endpoints

**Trigger Analysis:**
```
POST /api/decks/:id/recommendations/analyze
```

**Request:**
- Authenticated user
- Rate limit: 10 analyses per hour

**Response:**
```json
{
  "status": "pending" | "cached",
  "job_id": "uuid",
  "message": "Analysis started. This may take 10-30 seconds."
}
```

**Get Recommendations:**
```
GET /api/decks/:id/recommendations
```

**Response:**
```json
{
  "id": "recommendation_uuid",
  "summary": "Deck has strong card draw but lacks early ramp...",
  "suggestions": [
    {
      "card_name": "Arcane Signet",
      "priority": "high",
      "reasoning": "Fixes colors in 4-color deck...",
      "price_usd": "2.00",
      "in_collection": true
    }
  ],
  "identified_gaps": {
    "ramp": "low",
    "card_draw": "adequate",
    "removal": { "board_wipes": "missing" }
  },
  "created_at": "2026-01-10T12:00:00Z"
}
```

**Provide Feedback:**
```
POST /api/recommendations/:id/feedback
```

**Request Body:**
```json
{
  "feedback": "helpful" | "not_helpful",
  "comment": "Great suggestions! Added Arcane Signet to my deck."
}
```

#### Cost & Performance

**LLM API Costs:**
- **Model**: Claude 3.5 Sonnet
- **Pricing**: $0.003/1K input tokens, $0.015/1K output tokens
- **Average analysis**: ~1500 input + 500 output ≈ **$0.012 per request**
- **Monthly budget (1000 users × 5 decks × 1 analysis)**: ~$60/month

**Rate Limiting:**
- **Per user**: 10 analyses per hour
- **Worker concurrency**: 2 requests at a time
- **Anthropic rate limit**: 10 requests/minute

**Caching Strategy:**
- **TTL**: 7 days per recommendation
- **Invalidation**: Re-analyze if deck changes significantly (> 10 cards modified)
- **Storage**: JSONB fields in `DeckRecommendation` table

**Performance Targets:**
| Metric | Target | Notes |
|--------|--------|-------|
| Algorithm execution | < 2s | Pure JS pattern matching |
| LLM API call | 10-30s | Depends on Anthropic load |
| Total analysis time | 15-35s | Async job (non-blocking) |

#### User Experience Flow

1. **User opens deck** → Sees "Analyze Deck" button
2. **User clicks "Analyze"** → POST request creates job
3. **Loading state** → "Analyzing deck... (15-35 seconds)"
4. **Job completes** → Recommendations appear with summary
5. **User reviews suggestions** → Can add cards directly to deck
6. **User provides feedback** → "Was this helpful?" (thumbs up/down)

**UI Mockup:**
```
┌─────────────────────────────────────────────────┐
│ 🤖 AI Recommendations                           │
├─────────────────────────────────────────────────┤
│ "Deck has strong card draw but lacks early     │
│  ramp and board wipes..."                       │
├─────────────────────────────────────────────────┤
│ ⚠ High Priority                                 │
│ ┌──────────────────────────────────────────┐   │
│ │ Arcane Signet                     $2.00  │   │
│ │ ✓ In Collection                          │   │
│ │ "Fixes colors in 4-color deck and ramps  │   │
│ │  turn 2. Essential for consistency."     │   │
│ │                         [Add to Deck]    │   │
│ └──────────────────────────────────────────┘   │
│                                                  │
│ ⚠ High Priority                                 │
│ ┌──────────────────────────────────────────┐   │
│ │ Wrath of God                      $5.00  │   │
│ │ ✗ Not Owned                              │   │
│ │ "Your only board wipe is Cyclonic Rift.  │   │
│ │  Wrath provides unconditional removal."  │   │
│ │                         [Add to Deck]    │   │
│ └──────────────────────────────────────────┘   │
│                                                  │
│ 💡 Medium Priority                              │
│ ┌──────────────────────────────────────────┐   │
│ │ Sol Ring                          $1.50  │   │
│ │ ✓ In Collection                          │   │
│ │ "Powerful ramp, but consider cutting a   │   │
│ │  higher CMC card instead."               │   │
│ │                         [Add to Deck]    │   │
│ └──────────────────────────────────────────┘   │
│                                                  │
│ Was this helpful? [👍] [👎]                     │
└─────────────────────────────────────────────────┘
```

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
