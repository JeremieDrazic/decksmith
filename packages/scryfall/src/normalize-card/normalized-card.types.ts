/**
 * Output contract of {@link normalizeCard} — the shape normalization produces
 * from one raw Scryfall row, mirroring our domain vocabulary (camelCase) rather
 * than Scryfall's wire format.
 *
 * These are plain types, not Zod schemas: validation happens at the ingestion
 * boundary (untrusted input), and we trust what our own code constructs. No
 * DB-generated fields (`id`, `createdAt`, `updatedAt`) — the worker writes these
 * and lets Postgres fill them in.
 */

/** Oracle-level card data → our `Card` table. */
export type NormalizedCard = {
  oracleId: string;
  name: string;
  manaCost?: string;
  typeLine?: string;
  oracleText?: string;
  power?: string;
  toughness?: string;
  loyalty?: string;
  defense?: string;
  colors: string[];
  colorIdentity: string[];
  keywords: string[];
  producedMana: string[];
  cmc: number;
  layout: string;
  legalities: Record<string, string>;
  scryfallUri: string;
};

/**
 * One face's image URLs, one entry per Scryfall rendering size. All optional:
 * Scryfall may omit a size, so we store what's there rather than assuming a
 * full set (unlike the API DTO, which promises all six to clients).
 */
export type NormalizedImageUris = {
  small?: string;
  normal?: string;
  large?: string;
  png?: string;
  artCrop?: string;
  borderCrop?: string;
};

/** Printing-level data → our `CardPrint` table. */
export type NormalizedPrint = {
  scryfallId: string;
  oracleId: string;
  setCode: string;
  collectorNumber: string;
  illustrationId?: string;
  imageUris?: { front: NormalizedImageUris; back?: NormalizedImageUris };
  rarity: string;
  finishes: string[];
  prices?: Record<string, string | null>;
  language: string;
  localizedName?: string;
  localizedType?: string;
  localizedText?: string;
};

/** Per-face oracle data → our `CardFace` table (multi-faced cards only). */
export type NormalizedFace = {
  oracleId: string;
  faceIndex: number;
  name: string;
  manaCost?: string;
  typeLine?: string;
  oracleText?: string;
  colors: string[];
  power?: string;
  toughness?: string;
  loyalty?: string;
  defense?: string;
};

/** The full result of normalizing one Scryfall row. */
export type NormalizedCardBundle = {
  card: NormalizedCard;
  print: NormalizedPrint;
  faces: NormalizedFace[];
};
