# ADR-0029 — Multi-Face Card Modeling & Scryfall Fields

**Status:** Accepted **Date:** 2026-07-30

## Context

Phase 3.1 introduces `packages/scryfall`: we ingest Scryfall's `default_cards` bulk dump and
normalize each entry into our `Card` (oracle data) / `CardPrint` (edition) split. Before writing any
normalization code, the DB schema must be able to represent the data Scryfall actually returns.

The current schema (`packages/db/prisma/schema.prisma`) assumes **one card = one face**: `Card`
carries a single `name`, `manaCost`, `typeLine`, `oracleText`, `colors`, `cmc`. That assumption is
false for a large slice of real Magic cards. Scryfall models these with a `card_faces[]` array:

- **transform** (Delver of Secrets // Insectile Aberration) — two physical sides, two images
- **modal_dfc** (double-faced, either side castable — e.g. Pathway lands)
- **split** (Fire // Ice) — one physical card, two halves, one image
- **flip** (Bushido-era flip cards) — one image, two orientations
- **adventure** (Brazen Borrower // Petty Theft) — one image, a creature + a spell half
- **battle**, **double_faced_token**, **reversible_card** — also two-sided

Two more gaps, unrelated to faces but in scope for the same migration:

1. **Colour identity.** We store only `colors` (the casting-cost colours). Commander (Phase 7)
   validates decks against **colour identity** — every colour appearing anywhere on the card (cost,
   rules text, colour indicator). Scryfall provides both as distinct fields; conflating them is a
   known spec drift (decisions-log 2026-07-30). We must persist `color_identity` too.
2. **Layout.** We never stored Scryfall's `layout`. It is the single field that tells us _how to
   read a card_ — whether to expect `card_faces`, whether faces have separate images, and later
   (Phase 7) whether a card counts toward deck size (tokens/emblems don't).

This ADR settles the modeling; the Prisma migration, `db-reviewer` pass, `schema` DTOs, and the
normalization logic follow it.

## Decision

Four schema changes, mirroring Scryfall's structure (scoping decision "option B", decisions-log
2026-07-30):

### 1. `Card.colorIdentity String[]`

Persist colour identity alongside `colors`. Both are WUBRG-sorted `String[]` (e.g. `["U"]` vs
`["U", "B"]`). They are **not** interchangeable — `colors` drives mana-cost display, `colorIdentity`
drives Commander legality.

### 2. `Card.layout String`

Store the raw Scryfall layout string (`normal`, `transform`, `split`, `modal_dfc`, `adventure`,
`token`, …). It is the discriminator for face-reading at ingestion and for filtering at query time.
Kept as a plain `String` (not a Prisma enum): Scryfall adds new layouts over time, and an unknown
value must degrade to "treat as single-face" rather than break ingestion.

### 3. New `CardFace` table — the oracle part of each face

A `CardFace` holds the **oracle** (rules) data of one face. It is created **only for multi-face
cards** — a normal single-face card creates **no** `CardFace` row; its data stays on `Card`. Rule:
_if Scryfall returns `card_faces[]`, we emit one `CardFace` per element; otherwise none._

```prisma
/// The oracle data of a single face of a multi-face card (transform, split, modal_dfc, adventure…).
/// Only created when Scryfall returns `card_faces[]`. Single-face cards store their data on Card.
model CardFace {
  id         String   @id @default(uuid())
  oracleId   String   @map("oracle_id")
  index      Int      // Position in Scryfall's card_faces[] — 0 = front, 1 = back. Source of truth for front/back.
  name       String
  manaCost   String?  @map("mana_cost")
  typeLine   String?  @map("type_line")
  oracleText String?  @map("oracle_text")
  colors     String[] // This face's colours (may differ per face)

  card Card @relation(fields: [oracleId], references: [oracleId], onDelete: Cascade)

  @@unique([oracleId, index]) // Scryfall gives no per-face ID; (oracle, position) is the natural key
  @@map("card_faces")
}
```

**Key (validated point A).** Scryfall provides no stable per-face identifier. The natural key is the
composite `(oracleId, index)`, where `index` is the face's position in `card_faces[]`. That position
is the **source of truth for front/back**: `index = 0` is the front, `index = 1` the back. The same
index maps a face's oracle row to its image in `CardPrint.imageUris` (see §4).

**Cascade.** `onDelete: Cascade` — faces are wholly-owned oracle detail of a `Card`, never shared
and never referenced by user data (unlike `CardPrint`, which is `Restrict` because collections/decks
point at it).

**Field placement on multi-face cards (validated point B).** We _complete_, we don't duplicate:

| Field                                                               | Single-face card | Multi-face card                                 |
| ------------------------------------------------------------------- | ---------------- | ----------------------------------------------- |
| `Card.name`                                                         | the card name    | Scryfall composite (`"Delver of Secrets // …"`) |
| `Card.cmc`                                                          | the card cmc     | Scryfall's global `cmc`                         |
| `Card.colors` / `Card.colorIdentity`                                | the card colours | Scryfall's top-level (aggregate) values         |
| `Card.manaCost` / `typeLine` / `oracleText`                         | the card values  | **null** — the real values live per `CardFace`  |
| `CardFace.name` / `manaCost` / `typeLine` / `oracleText` / `colors` | — (no rows)      | the actual per-face values                      |

Consumers read faces via `Card.layout`: a non-`normal` layout means "join `CardFace`, don't trust
the per-face fields on `Card`".

### 4. `CardPrint.imageUris` convention — `{ front, back }`

Per-face **images** stay on `CardPrint.imageUris` (already `Json?`) as a `{ front, back }` shape —
we do **not** introduce a `CardPrintFace` table. An image has no queryable structure (we never
filter or join on it), so a JSON blob is the right tool; a table would add joins for zero query
benefit.

- Single-image layouts (`normal`, `split`, `flip`, `adventure`) → `{ front }` only, `back` absent.
- Two-sided layouts (`transform`, `modal_dfc`, `double_faced_token`, `reversible_card`, `battle`) →
  `{ front, back }`, where `front`/`back` align with `CardFace.index` 0/1.

Each side keeps Scryfall's own size map (`small`/`normal`/`large`/`png`/`art_crop`/`border_crop`),
so the full shape is `{ front: { small, normal, … }, back?: { small, normal, … } }`.

## Rationale

- **Mirrors the source (option B).** Scryfall already solved multi-face modeling with
  `card_faces[]`. Mirroring it keeps normalization a near-mechanical mapping instead of an
  interpretation, which is more deterministic and far easier to test — a core project value.
- **Oracle/print split preserved.** Faces are oracle data → a `Card`-owned table. Images are
  print-specific → they stay on `CardPrint`. The new pieces slot into the existing boundary rather
  than blurring it.
- **Right tool per data shape.** Structured, queryable per-face oracle data → a relational table
  (`CardFace`). Opaque, never-queried image URLs → JSON. We don't pay for joins we'll never run.
- **`layout` as the one discriminator.** A single explicit field drives face-reading, image shape,
  and later deck-size counting — no scattered heuristics inferring "is this multi-face?".

## Trade-offs

**Benefits:**

- Faithful representation of every paper-collectible layout from day one — no reshaping later.
- Colour identity available for Commander without a second ingestion pass.
- Normalization stays a straight structural map (testable, deterministic).

**Costs:**

- Reading a card's rules text is now layout-aware: single-face reads `Card`, multi-face joins
  `CardFace`. Consumers must branch on `layout`. We accept this asymmetry (data on `Card` for the
  99% common case) rather than forcing a `CardFace` row onto every single-face card just for
  uniformity.
- `Card.manaCost` / `typeLine` / `oracleText` become nullable to allow the null-on-multi-face rule.

**Risks:**

- **New/unknown layouts.** Scryfall may add layouts. Mitigation: `layout` is a free `String`, and
  the face rule keys off the _presence_ of `card_faces[]`, not a hardcoded layout list — unknown
  layouts degrade to single-face rather than crash.
- **Front/back assumption.** We assume `index 0 = front, 1 = back`. True for all current two-sided
  layouts; if Scryfall ever emits >2 faces or reorders, the `isCollectibleCard` / face-reader tests
  are the guardrail.

## Consequences / Follow-ups

1. **Prisma migration** — add `Card.colorIdentity`, `Card.layout`, make `Card.manaCost` / `typeLine`
   / `oracleText` nullable, add the `CardFace` model + `Card.faces CardFace[]` relation. Reviewed by
   `db-reviewer`, then `db:push` (we use push, not migrations — decisions-log).
2. **`packages/schema` DTOs** — Zod schemas for `Card`, `CardFace`, and the `{ front, back }`
   `imageUris` shape, plus the Scryfall response schemas.
3. **Normalization (`packages/scryfall`)** — explode `card_faces[]` → `CardFace[]`, build the
   `{ front, back }` image map, populate `colorIdentity`. Pure, colocated tests. (Written by Jérémie
   — pair mode, high-pedagogy zone.)
4. **`isCollectibleCard`** — reads `layout` to keep tokens/emblems and drop `art_series` (a separate
   pure, tested filter, per scoping).

## References

- decisions-log 2026-07-30 — Phase 3.1 `packages/scryfall` scoping (the 6 decisions)
- `apps/docs/specs/card-search.md` — feature spec (predates this modeling; drift noted above)
- ADR-0012 — Prisma database package (oracle/print split)
- [Scryfall — Card layouts](https://scryfall.com/docs/api/layouts)
- [Scryfall — Card Faces object](https://scryfall.com/docs/api/cards#card-face-objects)
