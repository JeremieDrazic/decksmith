# Scryfall Capabilities — Survey for Decksmith

_Created 2026-08-10. A strategic survey of Scryfall data/features beyond what `packages/scryfall`
already ingests, mapped to Decksmith roadmap phases. Drives Phases 3.3 / 6 / 7 / 10 / 12. Not a
commitment — a menu with cost/fit notes. Each item has a tracking issue (see the roadmap / GitHub)._

---

## Architectural framing (read first)

Two very different cost profiles:

- **Already in the stream (near-free).** Some fields live on every `default_cards` row we already
  stream — we just drop them during normalization (`packages/scryfall/normalize-card`). Capturing
  them is a schema + normalizer extension, exactly like the 2026-08-03 field-extension mini-scope. →
  `all_parts`, `edhrec_rank`, collector fields.
- **Separate bulk sources (new sync job).** Some data is a distinct Scryfall bulk file, not part of
  `default_cards`. Our worker (`apps/worker`, `SyncState` keyed by `source`) is built precisely for
  this: add a new `source` row and a sibling of `scryfall-card-sync`. → Oracle Tags, Art Tags,
  Rulings. Sets are a small paginated API instead of a bulk file.

---

## ⚠️ Naming: Scryfall tags are NOT Decksmith user tags

Decksmith already has a tag system — **do not conflate the two.**

| Aspect | `Tag` / `CardTag` (existing, `tags` / `card_tags`) | Scryfall tags (new)                         |
| ------ | -------------------------------------------------- | ------------------------------------------- |
| Owner  | **User** (`userId`, `@@unique([userId, name])`)    | **Global** / community-sourced              |
| Intent | Personal organization (bookmark, folder-like)      | Functional / artwork classification         |
| Source | User input via the app                             | Scryfall Tagger, synced from a bulk file    |
| Colour | User-chosen `color`                                | n/a (hierarchy of `parent_ids`/`child_ids`) |

**Convention for the new tables:** `OracleTag` / `CardOracleTag` (`oracle_tags` /
`card_oracle_tags`) and `ArtTag` / `PrintArtTag`. Never reuse `Tag`, `CardTag`, or the `card_tags`
table for Scryfall data.

---

## 🥇 Tier 1 — high leverage, natural fit

### 1. Oracle tags (functional Tagger) — the differentiator

Semantic tags describing what a card _does_: `removal`, `ramp`, `card-draw`, `tutor`,
`counterspell`, `lifegain`, … Search via `otag:` / `function:` / `oracletag:`. This is what turns a
card catalogue into a real deck-builder: "all removal in Golgari under 3 CMC".

- **Access:** no dedicated endpoint — a **separate "Oracle Tags" bulk file**. Each _tagging_ carries
  an `oracle_id` + a `weight` (how prominently the tag applies) + a hierarchy (`parent_ids` /
  `child_ids`). Join on `oracle_id` — our `Card` PK.
- **Cost:** a new sync job (sibling of `scryfall-card-sync`, new `SyncState` source) + `OracleTag` /
  `CardOracleTag` tables (see naming warning) + a GIN index for tag filtering.
- **Caveats:** community-sourced → good but not 100% coverage; updates every 12–24 h.
- **Phases:** 3.3 (search), 7 (deck builder card-add).

### 2. `all_parts` (related cards) — already in our stream

Array of related cards, each with a `component`: `token` (tokens the card makes), `meld_part` /
`meld_result`, `combo_piece`. Powers "tokens this deck needs", meld pairing, combo surfacing.

- **Cost:** near-zero — present on each `default_cards` row we already stream. Schema + normalizer
  extension (a `CardPart` / related-card table keyed by `oracle_id` → related `scryfall_id`).
- **Phases:** 7 (deck builder), 10 (card detail).

### 3. `edhrec_rank` — already in our stream

Commander popularity rank. Enables "sort by popularity" and feeds recommendations.

- **Cost:** trivial — one `Int?` column on `Card` + normalizer line.
- **Phases:** 12 (recommendations), 3.3 (search sort).

---

## 🥈 Tier 2 — solid, phase-specific

### 4. Rulings (separate bulk)

Official rulings per `oracle_id` → a "rulings" tab on the card detail page.

- **Cost:** new sync job (`rulings` bulk source) + `Ruling` table (`oracle_id`, `published_at`,
  `comment`).
- **Phase:** 10 (card detail).

### 5. Sets data (metadata + set icons)

Set metadata: name, `set_type`, release date, card count, and an **SVG set icon**. Enables browsing
and organizing the collection by set.

- **Access:** the `/sets` API (small, paginated) — not a bulk file.
- **Cost:** a `Set` table + a small sync (or on-demand). Icons are SVG URIs.
- **Phase:** 6 (collection).

### 6. Search syntax as design north star

Scryfall's search grammar (colour, cmc, type, oracle text, `otag:`, legality, rarity, price…) is the
reference model for our own `GET /cards/search`. Not data — a design target.

- **Cost:** design work; informs the query DSL / parser for the Card API.
- **Phase:** 3.3 (Card API).

### 7. Collector fields (`reserved`, `promo_types`, finishes richness)

`reserved` (reserved list — matters for collectors & pricing), `promo_types`, richer
finish/variation data. Feeds collection value and display.

- **Cost:** near-zero (already in the stream) — schema + normalizer fields on `Card` / `CardPrint`.
- **Phases:** 6 (collection), 8 (pricing).

---

## 🥉 Tier 3 — niche / display polish (later)

### 8. Art tags (illustration Tagger)

`art:` / `atag:` — what's depicted ("dragon", "squirrel"). Join on `illustration_id` (→
`CardPrint`), not `oracle_id`. Fun browsing, less deckbuilding value than oracle tags.

- **Cost:** a second tag sync (Art Tags bulk) + `ArtTag` / `PrintArtTag` tables.
- **Phase:** later (browsing/discovery).

### 9. External links + display fields

`related_uris` (EDHREC / Gatherer / TCGplayer links), plus `penny_rank`, `watermark`,
`frame_effects`, `security_stamp`, `border_color` — pure display/collector polish.

- **Cost:** near-zero (in the stream) — a few optional columns + a JSON blob for links.
- **Phase:** later (card detail polish).

---

## References

- [Tags API](https://scryfall.com/docs/api/tags) ·
  [Tagger Tags](https://scryfall.com/docs/tagger-tags)
- [Card Objects](https://scryfall.com/docs/api/cards) ·
  [Search syntax](https://scryfall.com/docs/syntax)
- [Bulk Data](https://scryfall.com/docs/api/bulk-data) · [Sets](https://scryfall.com/docs/api/sets)
