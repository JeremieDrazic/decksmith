import { prisma } from '@decksmith/db';

import { bulkUpsertCards } from './bulk-upsert-cards.js';
import { bulkUpsertFaces } from './bulk-upsert-faces.js';
import { bulkUpsertPrints } from './bulk-upsert-prints.js';
import type { GroupedChunk } from './group-chunk.types.js';

/**
 * Writes one grouped chunk to Postgres in a single transaction, using one bulk
 * `INSERT … ON CONFLICT` per table (see `bulkUpsert*`) instead of a Prisma op per
 * row. This keeps the whole sync idempotent (upserts on natural keys) while
 * holding memory flat and cutting the run from ~15 min to seconds — the previous
 * per-row-in-transaction approach both leaked memory (OOM in prod) and was slow.
 *
 * The three writes run in FK order — cards, then faces, then prints — so a new
 * card is committed before the face/print rows that reference it. Wrapping them in
 * one transaction makes the chunk all-or-nothing: a crash mid-run leaves earlier
 * chunks committed (safe to re-process, thanks to idempotence), never a half-
 * written chunk.
 *
 * @param chunk - The deduplicated, FK-ordered lists from `groupChunk`
 */
export async function upsertChunk(chunk: GroupedChunk): Promise<void> {
  // Interactive transactions default to a 5s budget; a chunk's three bulk writes
  // are fast but a latency spike to Supabase (remote pooler, several round-trips)
  // can exceed it (P2028). 30s is ample headroom while still catching a genuine
  // hang. maxWait covers pool-acquire time.
  await prisma.$transaction(
    async (db) => {
      await bulkUpsertCards(db, chunk.cards);
      await bulkUpsertFaces(db, chunk.faces);
      await bulkUpsertPrints(db, chunk.prints);
    },
    { timeout: 30_000, maxWait: 15_000 }
  );
}
