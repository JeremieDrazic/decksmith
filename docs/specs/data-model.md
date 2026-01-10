# Data Model

This document defines all core entities, relationships, and constraints for Decksmith.

---

## Entity Diagram

```
User (Supabase Auth)
  ├─ 1:1 → UserPreferences
  ├─ 1:N → CollectionEntry
  ├─ 1:N → Deck
  ├─ 1:N → Tag
  └─ 1:N → RecommendationFeedback

Card (Scryfall Oracle)
  └─ 1:N → CardPrint (now includes multi-language variants)

CardPrint
  ├─ N:N → CollectionEntry
  └─ N:N → DeckCard

Deck
  ├─ 1:N → DeckSection
  ├─ 1:N → DeckRecommendation
  └─ N:N → Tag (via DeckTag)

DeckSection
  └─ 1:N → DeckCard

Tag
  ├─ N:N → Deck (via DeckTag)
  └─ N:N → CollectionEntry (via CollectionEntryTag)

DeckRecommendation
  └─ 1:N → RecommendationFeedback

CraftGuideArticle (standalone)
```

---

## Core Entities

### 1. User

**Source:** Supabase Auth (managed externally)

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID (PK) | Supabase auth user ID |
| `email` | String | User email (unique) |
| `created_at` | Timestamp | Account creation date |
| `updated_at` | Timestamp | Last profile update |

**Relationships:**
- 1:1 → `UserPreferences`
- 1:N → `CollectionEntry`
- 1:N → `Deck`
- 1:N → `Tag`

**Business Rules:**
- Managed by Supabase Auth (OAuth, email/password)
- Deletion: Cascade to all owned resources

---

### 2. UserPreferences

Per-user settings for language, units, and UI customization.

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID (PK) | Unique preference ID |
| `user_id` | UUID (FK) | References `User.id` (unique) |
| `language` | Enum | `en` or `fr` |
| `units` | Enum | `mm` (metric) or `inches` (imperial) |
| `default_currency` | Enum | `usd` or `eur` |
| `theme` | Enum | `light`, `dark`, or `system` |
| `collection_view_config` | JSONB | Visible columns, sort order, grid/table mode |
| `notification_preferences` | JSONB | Email on PDF ready, feature announcements |
| `created_at` | Timestamp | Preference creation date |
| `updated_at` | Timestamp | Last update |

**Constraints:**
- `user_id` is unique (1:1 with User)
- Created automatically on user signup with defaults:
  - `language: 'en'`
  - `units: 'mm'`
  - `default_currency: 'usd'`
  - `theme: 'system'`

**Business Rules:**
- Language affects API error messages (i18n)
- Units only affect display (backend stores mm, converts on read)
- `collection_view_config` schema is flexible (user-defined keys)

---

### 3. Card

Represents a **unique Magic card by Oracle ID** (rules identity).

| Field | Type | Description |
|-------|------|-------------|
| `oracle_id` | UUID (PK) | Scryfall Oracle ID |
| `name` | String | Card name (e.g., "Lightning Bolt") |
| `mana_cost` | String | Mana cost notation (e.g., "{R}") |
| `type_line` | String | Card type (e.g., "Instant") |
| `oracle_text` | Text | Full rules text |
| `colors` | String[] | Color identity (e.g., ["R"]) |
| `cmc` | Float | Converted mana cost |
| `legalities` | JSONB | Format → legal/banned/restricted (e.g., `{"commander": "legal", "vintage": "restricted"}`) |
| `scryfall_uri` | String | Link to Scryfall page |
| `created_at` | Timestamp | First sync date |
| `updated_at` | Timestamp | Last Scryfall sync |

**Relationships:**
- 1:N → `CardPrint`

**Business Rules:**
- Synced daily from Scryfall bulk data
- `legalities` updated when banlists change
- Upsert logic: Compare `oracle_id`, update if Scryfall data changed

**Indexes:**
- Full-text search on (`name`, `type_line`, `oracle_text`) using Postgres `tsvector`

---

### 4. CardPrint

Represents a **specific edition/variant** of a card.

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID (PK) | Unique print ID |
| `scryfall_id` | UUID | Scryfall card ID (unique) |
| `oracle_id` | UUID (FK) | References `Card.oracle_id` |
| `set_code` | String | 3-letter set code (e.g., "LEA") |
| `collector_number` | String | Card number in set (e.g., "162") |
| `illustration_id` | UUID | Scryfall artwork ID |
| `image_uris` | JSONB | Image URLs (small, normal, large, png, art_crop) |
| `rarity` | Enum | `common`, `uncommon`, `rare`, `mythic` |
| `foil` | Boolean | Can this print be foil? |
| `nonfoil` | Boolean | Can this print be non-foil? |
| `prices` | JSONB | `{usd, usd_foil, eur, eur_foil}` (nullable strings) |
| `prices_updated_at` | Timestamp | When prices last synced |
| `language` | String(2) | Language code (`en`, `fr`, `es`, etc.) Default: `en` |
| `localized_name` | String | Localized card name (nullable) |
| `localized_type` | String | Localized type line (nullable) |
| `localized_text` | String | Localized oracle text (nullable) |
| `created_at` | Timestamp | First sync date |
| `updated_at` | Timestamp | Last Scryfall sync |

**Relationships:**
- N:1 → `Card` (via `oracle_id`)
- N:N → `CollectionEntry`
- N:N → `DeckCard`

**Business Rules:**
- Multiple prints per Oracle ID (e.g., "Lightning Bolt" has 50+ prints)
- **Multi-language support:** Each language variant is a separate CardPrint row
- Scryfall treats language variants as distinct prints (different `scryfall_id`)
- Localized fields fallback to English if null
- Prices can be null (not all cards have market data)
- `foil` and `nonfoil` both true = card exists in both variants

**Indexes:**
- `(oracle_id, set_code, collector_number, language)` unique index (updated for multi-language)
- `(language)` index for language filtering
- `(oracle_id, language)` composite index for localized lookups
- `scryfall_id` unique index

---

### 5. CollectionEntry

User's owned card with quantity, condition, and custom metadata.

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID (PK) | Unique entry ID |
| `user_id` | UUID (FK) | References `User.id` |
| `card_print_id` | UUID (FK) | References `CardPrint.id` |
| `quantity` | Integer | How many copies (≥ 1) |
| `condition` | Enum | `NM`, `LP`, `MP`, `HP`, `DMG` |
| `is_foil` | Boolean | Is this entry for foil variant? |
| `acquired_date` | Date | When card was added (nullable) |
| `notes` | Text | User notes (nullable) |
| `custom_fields` | JSONB | User-defined fields (e.g., `{"location": "Binder 3", "acquired_from": "LGS"}`) |
| `created_at` | Timestamp | Entry creation |
| `updated_at` | Timestamp | Last modification |

**Relationships:**
- N:1 → `User`
- N:1 → `CardPrint`
- N:N → `Tag` (via `CollectionEntryTag`)

**Constraints:**
- **Unique:** `(user_id, card_print_id, is_foil, condition)`
  - Prevents duplicate entries for same card/variant/condition
  - Example: Can't have two entries for "Lightning Bolt [LEA] foil NM"

**Business Rules:**
- `quantity` must be ≥ 1 (deleting last copy removes entry)
- `custom_fields` is schema-less JSONB (user defines keys)
- Update operations: increment/decrement `quantity`, never overwrite directly

**Indexes:**
- `(user_id, card_print_id)`
- `user_id` (for collection queries)

---

### 6. Deck

User's deck with format, tags, and configurable sections.

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID (PK) | Unique deck ID |
| `user_id` | UUID (FK) | References `User.id` |
| `name` | String | Deck name (e.g., "Atraxa Superfriends") |
| `format` | Enum | `commander`, `standard`, `modern`, `pioneer`, `limited`, `casual` |
| `description` | Text | User notes (nullable) |
| `is_public` | Boolean | Public sharing enabled? |
| `public_slug` | String | URL-safe slug for sharing (e.g., "atraxa-superfriends-x7k2") |
| `created_at` | Timestamp | Deck creation |
| `updated_at` | Timestamp | Last modification |

**Relationships:**
- N:1 → `User`
- 1:N → `DeckSection`
- N:N → `Tag` (via `DeckTag`)

**Constraints:**
- `public_slug` unique (if `is_public = true`)

**Business Rules:**
- Format determines default section template on creation
- Public decks are read-only for non-owners
- Deleting deck cascades to sections and cards

**Indexes:**
- `user_id`
- `public_slug` (unique, partial index where `is_public = true`)

---

### 7. DeckSection

Configurable zone within a deck (not hardcoded).

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID (PK) | Unique section ID |
| `deck_id` | UUID (FK) | References `Deck.id` |
| `name` | String | User-defined section name (e.g., "Mainboard", "Ramp", "Command Zone") |
| `position` | Integer | Display order (0-indexed) |
| `validation_rules` | JSONB | Optional rules: `{max_cards, singleton, color_identity}` |
| `created_at` | Timestamp | Section creation |
| `updated_at` | Timestamp | Last modification |

**Relationships:**
- N:1 → `Deck`
- 1:N → `DeckCard`

**Constraints:**
- `(deck_id, position)` unique (ordered sections)

**Business Rules:**
- User can create/rename/delete sections freely
- Format templates pre-populate sections on deck creation (editable)
  - Commander: `[{name: "Command Zone", position: 0}, {name: "Mainboard", position: 1}, {name: "Maybeboard", position: 2}]`
  - Constructed: `[{name: "Mainboard", position: 0}, {name: "Sideboard", position: 1, validation_rules: {max_cards: 15}}]`
- Validation rules applied during deck validation (not enforced at DB level)

**Validation Rules Schema (JSONB):**
```json
{
  "max_cards": 100,                 // Optional: Max cards in section
  "singleton": true,                // Optional: Max 1 copy per card
  "color_identity": ["W", "U", "B"] // Optional: Allowed colors
}
```

---

### 8. DeckCard

Card in a specific deck section.

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID (PK) | Unique deck card ID |
| `section_id` | UUID (FK) | References `DeckSection.id` |
| `card_print_id` | UUID (FK) | References `CardPrint.id` |
| `quantity` | Integer | Number of copies (≥ 1) |
| `position` | Integer | Display order within section |
| `created_at` | Timestamp | Card added to deck |
| `updated_at` | Timestamp | Last modification |

**Relationships:**
- N:1 → `DeckSection`
- N:1 → `CardPrint`

**Constraints:**
- `(section_id, position)` unique (ordered cards)

**Business Rules:**
- `quantity` respects section validation rules (e.g., singleton = max 1)
- Deleting section cascades to all cards in section

---

### 9. Tag

User-managed tags for organizing decks and collection.

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID (PK) | Unique tag ID |
| `user_id` | UUID (FK) | References `User.id` |
| `name` | String | Tag name (e.g., "Staples", "Budget") |
| `color` | String | Hex color code (e.g., "#3B82F6") |
| `type` | Enum | `deck` or `collection` |
| `created_at` | Timestamp | Tag creation |
| `updated_at` | Timestamp | Last modification |

**Relationships:**
- N:1 → `User`
- N:N → `Deck` (via `DeckTag`)
- N:N → `CollectionEntry` (via `CollectionEntryTag`)

**Constraints:**
- **Unique:** `(user_id, name, type)`
  - Can have "Staples" tag for both decks and collection

**Business Rules:**
- Tags are scoped per user (not global)
- Deleting tag removes associations but not decks/cards

---

### 10. CraftGuideArticle

Static educational content (equipment guides, tutorials).

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID (PK) | Unique article ID |
| `slug` | String | URL-safe slug (e.g., "best-printers-2026") |
| `title` | String | Article title |
| `content` | Text | Markdown content |
| `category` | Enum | `equipment`, `tutorial`, `tips`, `review` |
| `thumbnail_url` | String | Image URL (nullable) |
| `published_at` | Timestamp | Publication date (nullable = draft) |
| `created_at` | Timestamp | Article creation |
| `updated_at` | Timestamp | Last modification |

**Relationships:**
- None (standalone content)

**Constraints:**
- `slug` unique

**Business Rules:**
- Public (no auth required)
- Admin-only create/edit (MVP)
- Future: User-submitted content with moderation

---

### 11. DeckRecommendation

AI-powered card recommendations for deck improvement.

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID (PK) | Unique recommendation ID |
| `deck_id` | UUID (FK) | References `Deck.id` |
| `algorithm_version` | String | Version of recommendation algorithm (e.g., "v1.0.0") |
| `identified_gaps` | JSONB | Deck gaps found by algorithm `{"ramp": "low", "removal": "missing_board_wipes"}` |
| `rule_suggestions` | JSONB | Rule-based card suggestions `[{card_id, reason, priority}]` |
| `llm_model` | String | LLM model used (e.g., "claude-3.5-sonnet-20250929") (nullable) |
| `llm_prompt_tokens` | Integer | Tokens used in prompt (nullable) |
| `llm_completion_tokens` | Integer | Tokens used in completion (nullable) |
| `llm_cost_usd` | Decimal | Cost of LLM API call (nullable) |
| `llm_suggestions` | JSONB | LLM-refined suggestions `[{card_id, reasoning, priority}]` (nullable) |
| `llm_summary` | Text | Strategic deck summary from LLM (nullable) |
| `user_feedback` | Enum | `helpful` or `not_helpful` (nullable) |
| `created_at` | Timestamp | When recommendation was generated |
| `expires_at` | Timestamp | TTL (7 days from creation) |

**Relationships:**
- N:1 → `Deck` (via `deck_id`)
- 1:N → `RecommendationFeedback`

**Constraints:**
- `deck_id` index for lookup

**Business Rules:**
- Hybrid approach: Rules-based algorithm + LLM refinement
- Recommendations cached for 7 days (TTL)
- Collection-aware (prioritizes owned cards)
- Pricing-aware (suggests budget alternatives)
- Format-aware (only legal cards)
- Rate limiting: 10 analyses per hour per user
- LLM cost tracking: ~$0.012 per analysis

**Indexes:**
- `(deck_id)` index
- `(expires_at)` index for cleanup job

---

### 12. RecommendationFeedback

User feedback on recommendations for algorithm improvement.

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID (PK) | Unique feedback ID |
| `recommendation_id` | UUID (FK) | References `DeckRecommendation.id` |
| `user_id` | UUID (FK) | References `User.id` |
| `feedback` | Enum | `helpful` or `not_helpful` |
| `comment` | Text | Optional user comment (nullable) |
| `created_at` | Timestamp | Feedback submission date |

**Relationships:**
- N:1 → `DeckRecommendation` (via `recommendation_id`)
- N:1 → `User` (via `user_id`)

**Business Rules:**
- Used to improve recommendation algorithm over time
- One feedback per user per recommendation

---

## Join Tables

### DeckTag

| Field | Type | Description |
|-------|------|-------------|
| `deck_id` | UUID (FK) | References `Deck.id` |
| `tag_id` | UUID (FK) | References `Tag.id` |

**Constraints:**
- `(deck_id, tag_id)` primary key

---

### CollectionEntryTag

| Field | Type | Description |
|-------|------|-------------|
| `collection_entry_id` | UUID (FK) | References `CollectionEntry.id` |
| `tag_id` | UUID (FK) | References `Tag.id` |

**Constraints:**
- `(collection_entry_id, tag_id)` primary key

---

## Database Constraints Summary

| Table | Unique Constraints | Foreign Keys |
|-------|-------------------|--------------|
| `UserPreferences` | `user_id` | `user_id → User.id` |
| `Card` | `oracle_id` | - |
| `CardPrint` | `scryfall_id`, `(oracle_id, set_code, collector_number, language)` | `oracle_id → Card.oracle_id` |
| `CollectionEntry` | `(user_id, card_print_id, is_foil, condition)` | `user_id → User.id`, `card_print_id → CardPrint.id` |
| `Deck` | `public_slug` (when `is_public = true`) | `user_id → User.id` |
| `DeckSection` | `(deck_id, position)` | `deck_id → Deck.id` |
| `DeckCard` | `(section_id, position)` | `section_id → DeckSection.id`, `card_print_id → CardPrint.id` |
| `Tag` | `(user_id, name, type)` | `user_id → User.id` |
| `CraftGuideArticle` | `slug` | - |
| `DeckRecommendation` | - | `deck_id → Deck.id` |
| `RecommendationFeedback` | - | `recommendation_id → DeckRecommendation.id`, `user_id → User.id` |

---

## Cascade Delete Behavior

| Parent | Child | Action |
|--------|-------|--------|
| `User` | `UserPreferences` | CASCADE |
| `User` | `CollectionEntry` | CASCADE |
| `User` | `Deck` | CASCADE |
| `User` | `Tag` | CASCADE |
| `User` | `RecommendationFeedback` | CASCADE |
| `Deck` | `DeckSection` | CASCADE |
| `Deck` | `DeckTag` | CASCADE |
| `Deck` | `DeckRecommendation` | CASCADE |
| `DeckSection` | `DeckCard` | CASCADE |
| `DeckRecommendation` | `RecommendationFeedback` | CASCADE |
| `Card` | `CardPrint` | RESTRICT (prevent orphan prints) |
| `CardPrint` | `CollectionEntry` | RESTRICT (prevent accidental deletion) |
| `CardPrint` | `DeckCard` | RESTRICT |
| `Tag` | `DeckTag` | CASCADE |
| `Tag` | `CollectionEntryTag` | CASCADE |

---

## Row-Level Security (RLS)

**See [user-auth.md](./user-auth.md) for full RLS policies.**

Summary:
- Users can only read/write their own `CollectionEntry`, `Deck`, `Tag`, `UserPreferences`, `DeckRecommendation`, `RecommendationFeedback`
- Public decks are readable by anyone (via `public_slug`)
- `Card`, `CardPrint`, `CraftGuideArticle` are globally readable
- Scryfall sync worker has elevated permissions for bulk upserts

---

## Indexes Strategy

### High-Traffic Queries

1. **Collection inventory:**
   - `(user_id, card_print_id)` on `CollectionEntry`

2. **Deck card lookup:**
   - `(deck_id)` on `DeckSection`
   - `(section_id)` on `DeckCard`

3. **Card search:**
   - Full-text `tsvector` on `Card(name, type_line, oracle_text)`
   - `(set_code)` on `CardPrint`
   - `(language)` on `CardPrint` (multi-language filtering)
   - `(oracle_id, language)` composite on `CardPrint` (localized lookups)

4. **Public deck sharing:**
   - `(public_slug)` unique on `Deck` (partial index)

5. **Deck recommendations:**
   - `(deck_id)` on `DeckRecommendation`
   - `(expires_at)` on `DeckRecommendation` (TTL cleanup)
   - `(recommendation_id)` on `RecommendationFeedback`

### Low-Traffic (Acceptable Sequential Scans)

- `Tag` (small table, scoped per user)
- `CraftGuideArticle` (< 100 articles)

---

## Migration Strategy

1. **Prisma schema** defines entities + relations
2. **Supabase migrations** for RLS policies
3. **Seed data:**
   - `CraftGuideArticle`: 5-10 initial articles
   - `Card` + `CardPrint`: Empty (populated by Scryfall sync job)

---

## Related Docs

- [Collection Management](./collection.md)
- [Deck Management](./deck-management.md)
- [Pricing](./pricing.md)
- [User Auth & RLS](./user-auth.md)
