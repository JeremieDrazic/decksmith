import { type Prisma, type PrismaCardPrint, prisma } from '@decksmith/db';
import type { CardPrintSort } from '@decksmith/schema/card/card-print';
import { CARD_NOT_FOUND } from '@decksmith/schema/errors/codes';

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
