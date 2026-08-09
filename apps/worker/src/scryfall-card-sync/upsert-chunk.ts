import { prisma } from '@decksmith/db';

import type { GroupedChunk } from './group-chunk.types.js';

/**
 * Writes one grouped chunk to Postgres in a single transaction.
 *
 * Every row is an `upsert` keyed on its natural key (`Card.oracleId`,
 * `CardFace.(oracleId, faceIndex)`, `CardPrint.scryfallId`), which makes the
 * whole sync idempotent: re-running produces the same rows, never duplicates.
 *
 * The operations run in FK order — cards, then faces, then prints — so a new
 * card is committed before the print/face rows that reference it. Wrapping a
 * chunk in one transaction makes it all-or-nothing: a crash mid-run leaves
 * earlier chunks committed (safe to re-process, thanks to idempotence) rather
 * than a half-written chunk.
 *
 * `prices` defaults to `{}` because `CardPrint.prices` is a required JSON column
 * while Scryfall may omit the field.
 *
 * @param chunk - The deduplicated, FK-ordered lists from `groupChunk`
 */
export async function upsertChunk(chunk: GroupedChunk): Promise<void> {
  const cardOps = chunk.cards.map((card) =>
    prisma.card.upsert({ where: { oracleId: card.oracleId }, create: card, update: card })
  );

  const faceOps = chunk.faces.map((face) =>
    prisma.cardFace.upsert({
      where: { oracleId_faceIndex: { oracleId: face.oracleId, faceIndex: face.faceIndex } },
      create: face,
      update: face,
    })
  );

  const printOps = chunk.prints.map((print) => {
    const data = { ...print, prices: print.prices ?? {} };
    return prisma.cardPrint.upsert({
      where: { scryfallId: print.scryfallId },
      create: data,
      update: data,
    });
  });

  await prisma.$transaction([...cardOps, ...faceOps, ...printOps]);
}
