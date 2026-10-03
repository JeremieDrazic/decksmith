import { Prisma, type PrismaCardPrint, prisma } from '@decksmith/db';
import { LegalityStatusSchema } from '@decksmith/schema/card/card';
import type { CardPrintSort } from '@decksmith/schema/card/card-print';
import { type CardSearchQuery, type CardSort, CardSortSchema } from '@decksmith/schema/card/search';
import { CARD_NOT_FOUND } from '@decksmith/schema/errors/codes';
import { makeContainsPattern } from '@decksmith/utils';

import { ServiceError } from '../../errors.js';

/**
 * A card with all its prints and faces — the value `getCardWithPrints` returns.
 *
 * Per ADR-0024 the service returns a plain (Prisma-shaped) domain value, not a
 * DTO; the `apps/api` card mapper converts it to `CardWithPrints` at the HTTP
 * boundary (ISO dates, etc.).
 */
export type CardWithPrintsRecord = Prisma.CardGetPayload<{
  include: { prints: true; faces: true };
}>;

/**
 * Loads a single card by its oracle ID, with every print and face.
 *
 * Prints come newest-first (release date desc, undated last); faces in reading
 * order (front = 0). Callers that need a custom print order use `getCardPrints`.
 *
 * @param oracleId - The card's Scryfall oracle ID
 * @returns The card with its prints and faces
 * @throws {ServiceError} CARD_NOT_FOUND if no card has this oracle ID
 */
export async function getCardWithPrints(oracleId: string): Promise<CardWithPrintsRecord> {
  const card = await prisma.card.findUnique({
    where: { oracleId },
    include: {
      prints: { orderBy: { releasedAt: { sort: 'desc', nulls: 'last' } } },
      faces: { orderBy: { faceIndex: 'asc' } },
    },
  });

  if (!card) {
    throw new ServiceError(CARD_NOT_FOUND, 'Card not found');
  }

  return card;
}

/**
 * Lists every print of a card, ordered by `sort`.
 *
 * A card always has at least one print (the sync creates cards from prints), so
 * an empty result means the oracle ID doesn't exist — surfaced as CARD_NOT_FOUND
 * rather than an empty list, in one query.
 *
 * @param oracleId - The card's Scryfall oracle ID
 * @param sort - `date` (newest first) or `name` (alphabetical by set name)
 * @returns The card's prints
 * @throws {ServiceError} CARD_NOT_FOUND if the card has no prints (i.e. doesn't exist)
 */
/**
 * Sort key → Prisma `orderBy`. Typed as `Record<CardPrintSort, …>` so adding a
 * value to `CardPrintSortSchema` forces a matching entry here (compile error
 * otherwise) — exhaustive by construction, and scales without touching the query.
 */
const PRINT_ORDER_BY: Record<CardPrintSort, Prisma.CardPrintOrderByWithRelationInput> = {
  date: { releasedAt: { sort: 'desc', nulls: 'last' } },
  name: { setName: { sort: 'asc', nulls: 'last' } },
};

export async function getCardPrints(
  oracleId: string,
  sort: CardPrintSort
): Promise<PrismaCardPrint[]> {
  const prints = await prisma.cardPrint.findMany({
    where: { oracleId },
    orderBy: PRINT_ORDER_BY[sort],
  });

  if (prints.length === 0) {
    throw new ServiceError(CARD_NOT_FOUND, 'Card not found');
  }

  return prints;
}

/** Max suggestions returned by autocomplete — a dropdown, not a result page. */
const AUTOCOMPLETE_LIMIT = 10;

/**
 * A raw autocomplete row as selected from the DB (snake_case, plain domain
 * value). The `apps/api` mapper turns it into a `CardSearchResult` (imageUrl null
 * — autocomplete has no thumbnail).
 */
export type AutocompleteRow = {
  oracle_id: string;
  name: string;
  mana_cost: string | null;
  type_line: string | null;
  colors: string[];
  cmc: number;
};

/**
 * Case-insensitive substring autocomplete on card name (e.g. "bolt" matches
 * "Lightning Bolt"), backed by the `cards_name_trgm_idx` trigram index.
 *
 * Results are ordered by where the term appears in the name (earliest first),
 * then alphabetically, and capped at {@link AUTOCOMPLETE_LIMIT}.
 *
 * The query value is bound as a parameter (never string-concatenated), so it
 * can't be interpreted as SQL. LIKE wildcards typed by the user (`%`, `_`) are
 * treated literally-enough for a search box — an accepted edge case.
 *
 * @param query - The (already length-validated) search term
 * @returns Up to 10 lightweight matching rows
 */
export async function autocompleteCards(query: string): Promise<AutocompleteRow[]> {
  const term = query.toLowerCase();

  return prisma.$queryRaw<AutocompleteRow[]>`
    SELECT oracle_id, name, mana_cost, type_line, colors, cmc
    FROM cards
    WHERE lower(name) LIKE ${makeContainsPattern(term)}
    ORDER BY position(${term} IN lower(name)), name
    LIMIT ${AUTOCOMPLETE_LIMIT}
  `;
}

/**
 * Resolves the effective sort for a search.
 *
 * An explicit `requested` sort always wins. With none, the default is
 * conditional: `relevance` ranks against the query text, so it only makes sense
 * when a query is present — otherwise fall back to `name`.
 *
 * @param requested - The sort asked for, or undefined
 * @param hasQuery - Whether the search has full-text query
 * @returns The sort to apply
 */
export function resolveSort(requested: CardSort | undefined, hasQuery: boolean): CardSort {
  if (requested) {
    return requested;
  }

  return hasQuery ? CardSortSchema.enum.relevance : CardSortSchema.enum.name;
}

/**
 * Weighted full-text expression over name (A) / type line (B) / oracle text (C).
 *
 * MUST stay byte-identical to the expression in `sql/card-search-indexes.sql`
 * (`cards_fts_idx`) — Postgres only uses the index when the query repeats the
 * same expression. Reused by both the WHERE match and the `ts_rank` sort.
 *
 * A function, not a module-level constant: evaluating `Prisma.sql` at import
 * time would run for every consumer of `@decksmith/services` (e.g. apps/api),
 * breaking any that mock `@decksmith/db` without `Prisma.sql`.
 */
function ftsExpression(): Prisma.Sql {
  return Prisma.sql`(
    setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(type_line, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(oracle_text, '')), 'C')
  )`;
}

/**
 * Builds the dynamic `WHERE` clause from the active filters: one `Prisma.sql`
 * fragment per provided filter, joined with `AND`. Returns `Prisma.empty` when
 * nothing is filtered (browse-all). Values are bound as parameters — no injection.
 */
function buildSearchWhere(params: CardSearchQuery): Prisma.Sql {
  const conditions: Prisma.Sql[] = [];

  if (params.query) {
    conditions.push(Prisma.sql`${ftsExpression()} @@ plainto_tsquery('english', ${params.query})`);
  }
  if (params.colors?.length) {
    conditions.push(Prisma.sql`colors && ${params.colors}::text[]`);
  }
  if (params.rarities?.length) {
    conditions.push(Prisma.sql`rarities && ${params.rarities}::text[]`);
  }
  if (params.sets?.length) {
    conditions.push(Prisma.sql`sets && ${params.sets}::text[]`);
  }
  if (params.cmcMin !== undefined) {
    conditions.push(Prisma.sql`cmc >= ${params.cmcMin}`);
  }
  if (params.cmcMax !== undefined) {
    conditions.push(Prisma.sql`cmc <= ${params.cmcMax}`);
  }
  if (params.format) {
    conditions.push(Prisma.sql`legalities->>${params.format} = ${LegalityStatusSchema.enum.legal}`);
  }

  return conditions.length > 0
    ? Prisma.sql`WHERE ${Prisma.join(conditions, ' AND ')}`
    : Prisma.empty;
}

/**
 * Builds the ORDER BY fragment for the resolved sort. `relevance` ranks by
 * full-text score (`ts_rank` over the same expression as the index); the rest
 * come from a typed map (so a new sort value forces an entry — exhaustive).
 * `query` is defined whenever sort is `relevance` (guaranteed by `resolveSort`).
 */
function buildOrderBy(sort: CardSort, query: string | undefined): Prisma.Sql {
  if (sort === CardSortSchema.enum.relevance) {
    return Prisma.sql`ts_rank(${ftsExpression()}, plainto_tsquery('english', ${query})) DESC`;
  }

  const staticOrderBy: Record<Exclude<CardSort, 'relevance'>, Prisma.Sql> = {
    name: Prisma.sql`c.name ASC`,
    cmc: Prisma.sql`c.cmc ASC`,
    released: Prisma.sql`c.first_released_at DESC NULLS LAST`,
  };

  return staticOrderBy[sort];
}

/**
 * A raw card search row as selected from the DB (snake_case, plain domain
 * value). `image_url` is the most-recent print's front image, or null. The
 * `apps/api` mapper turns it into a `CardSearchResult`.
 */
export type CardSearchRow = {
  oracle_id: string;
  name: string;
  mana_cost: string | null;
  type_line: string | null;
  colors: string[];
  cmc: number;
  image_url: string | null;
};

/** What `searchCards` returns: the page of rows plus the total match count. */
export type CardSearchResultSet = {
  rows: CardSearchRow[];
  total: number;
};

/**
 * Searches cards (single-table, ADR-0032): one grid-ready row per matching card
 * with the most-recent print's image, plus the total match count for pagination.
 *
 * Sort defaults to relevance when a query is present, otherwise name
 * (see {@link resolveSort}). Both queries share the same WHERE fragment.
 */
export async function searchCards(params: CardSearchQuery): Promise<CardSearchResultSet> {
  const where = buildSearchWhere(params);
  const sort = resolveSort(params.sort, params.query !== undefined);
  const orderBy = buildOrderBy(sort, params.query);
  const offset = (params.page - 1) * params.limit;

  const rows = await prisma.$queryRaw<CardSearchRow[]>`
    SELECT
      c.oracle_id, c.name, c.mana_cost, c.type_line, c.colors, c.cmc,
      recent.image_uris -> 'front' ->> 'normal' AS image_url
    FROM cards c
    LEFT JOIN LATERAL (
      SELECT image_uris
      FROM card_prints
      WHERE oracle_id = c.oracle_id
      ORDER BY released_at DESC NULLS LAST
      LIMIT 1
    ) recent ON true
    ${where}
    ORDER BY ${orderBy}
    LIMIT ${params.limit} OFFSET ${offset}
  `;

  const [{ count }] = await prisma.$queryRaw<[{ count: bigint }]>`
    SELECT COUNT(*) AS count FROM cards c ${where}
  `;

  return { rows, total: Number(count) };
}
