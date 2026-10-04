import type { PrismaCardFace, PrismaCardPrint } from '@decksmith/db';
import type { CardFace, CardSearchResult, Legalities } from '@decksmith/schema/card/card';
import type { CardImages, CardPrint, CardWithPrints } from '@decksmith/schema/card/card-print';
import type { Prices } from '@decksmith/schema/card/prices';
import type { Color, Rarity } from '@decksmith/schema/primitives/enums';
import type { AutocompleteRow, CardSearchRow, CardWithPrintsRecord } from '@decksmith/services';

/**
 * Why these casts: Prisma types array/JSON columns loosely — `String[]` and the
 * untyped `JsonValue` — because the DB schema can't express the narrower shapes.
 * The DTO schemas can (`Color[]`, `Legalities`, `Prices`). The data was validated
 * by Zod on the way in (the sync normalizes Scryfall payloads), so narrowing on
 * the way out is sound. Same pattern as `user-mapper.ts`.
 */

/**
 * Convert one card-search row (snake_case, from the raw SQL query) to the API DTO.
 *
 * @param row - A raw search row from `searchCards`
 * @returns A grid-ready search result (with the most-recent print's image)
 */
export function toCardSearchResult(row: CardSearchRow): CardSearchResult {
  return {
    oracleId: row.oracle_id,
    name: row.name,
    manaCost: row.mana_cost,
    typeLine: row.type_line,
    colors: row.colors as Color[],
    cmc: row.cmc,
    imageUrl: row.image_url,
  };
}

/**
 * Convert one autocomplete row to the API DTO.
 *
 * Autocomplete carries no thumbnail (it's a type-ahead dropdown, not a grid), so
 * `imageUrl` is always null — the only difference from {@link toCardSearchResult}.
 *
 * @param row - A raw autocomplete row from `autocompleteCards`
 * @returns A lightweight search result with no image
 */
export function toAutocompleteResult(row: AutocompleteRow): CardSearchResult {
  return {
    oracleId: row.oracle_id,
    name: row.name,
    manaCost: row.mana_cost,
    typeLine: row.type_line,
    colors: row.colors as Color[],
    cmc: row.cmc,
    imageUrl: null,
  };
}

/** Convert a single Prisma CardFace to its DTO (drops the DB-only id/oracleId). */
function toCardFace(face: PrismaCardFace): CardFace {
  return {
    faceIndex: face.faceIndex,
    name: face.name,
    manaCost: face.manaCost,
    typeLine: face.typeLine,
    oracleText: face.oracleText,
    colors: face.colors as Color[],
    power: face.power,
    toughness: face.toughness,
    loyalty: face.loyalty,
    defense: face.defense,
  };
}

/**
 * Convert a Prisma CardPrint record to the API DTO.
 *
 * @param print - Raw Prisma CardPrint record
 * @returns CardPrint DTO with narrowed JSON fields and ISO 8601 timestamps
 */
export function toCardPrint(print: PrismaCardPrint): CardPrint {
  return {
    id: print.id,
    scryfallId: print.scryfallId,
    oracleId: print.oracleId,
    setCode: print.setCode,
    setName: print.setName,
    collectorNumber: print.collectorNumber,
    illustrationId: print.illustrationId,
    imageUris: print.imageUris as CardImages | null,
    rarity: print.rarity as Rarity,
    finishes: print.finishes,
    prices: print.prices as Prices,
    pricesUpdatedAt: print.pricesUpdatedAt?.toISOString() ?? null,
    releasedAt: print.releasedAt?.toISOString() ?? null,
    language: print.language,
    localizedName: print.localizedName,
    localizedType: print.localizedType,
    localizedText: print.localizedText,
    createdAt: print.createdAt.toISOString(),
    updatedAt: print.updatedAt.toISOString(),
  };
}

/**
 * Convert a card-with-prints record (card + faces + prints) to the detail DTO.
 *
 * Maps the oracle card itself, then its faces and prints via their own mappers.
 * The Prisma-only `sets` aggregate is dropped — it's a search-support column
 * (ADR-0032), not part of the public card contract.
 *
 * @param record - Prisma Card with `faces` and `prints` included
 * @returns The full card detail DTO
 */
export function toCardWithPrints(record: CardWithPrintsRecord): CardWithPrints {
  return {
    oracleId: record.oracleId,
    name: record.name,
    manaCost: record.manaCost,
    typeLine: record.typeLine,
    oracleText: record.oracleText,
    power: record.power,
    toughness: record.toughness,
    loyalty: record.loyalty,
    defense: record.defense,
    colors: record.colors as Color[],
    colorIdentity: record.colorIdentity as Color[],
    keywords: record.keywords,
    producedMana: record.producedMana as Color[],
    cmc: record.cmc,
    layout: record.layout,
    faces: record.faces.map((face) => toCardFace(face)),
    legalities: record.legalities as Legalities,
    rarities: record.rarities as Rarity[],
    finishes: record.finishes,
    scryfallUri: record.scryfallUri,
    firstReleasedAt: record.firstReleasedAt?.toISOString() ?? null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    prints: record.prints.map((print) => toCardPrint(print)),
  };
}
