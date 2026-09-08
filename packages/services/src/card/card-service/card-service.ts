import { type Prisma, type PrismaCardPrint, prisma } from '@decksmith/db';
import type { CardPrintSort } from '@decksmith/schema/card/card-print';
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
