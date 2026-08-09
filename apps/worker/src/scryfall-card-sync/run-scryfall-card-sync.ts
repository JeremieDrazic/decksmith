import { prisma } from '@decksmith/db';
import { fetchBulkStream, getBulkDataInfo, streamNormalizedCards } from '@decksmith/scryfall';
import { chunkAsyncIterable } from '@decksmith/utils';

import { groupChunk } from './group-chunk.js';
import { upsertChunk } from './upsert-chunk.js';

// Scryfall's bulk type we ingest; also the SyncState key. A future prices or
// rulings sync would use a different source string against the same table.
const SYNC_SOURCE = 'default_cards';

// Rows per transaction. Kept modest so each per-row-upsert transaction stays
// well under its time budget (see upsert-chunk) and progress stays granular.
// Raise substantially once bulk INSERT … ON CONFLICT lands (follow-up issue).
const CHUNK_SIZE = 200;

/**
 * Runs one Scryfall card sync: skip when the upstream dump is unchanged,
 * otherwise stream it into Postgres and record the outcome in `SyncState`.
 *
 * Composes the Phase 3.1 bricks with the local write path — metadata check →
 * (maybe) fetch → stream → chunk → group → upsert — never buffering the dump.
 * The whole run is idempotent (upserts on natural keys), so a failed or
 * interrupted run is safe to retry.
 *
 * @throws Re-throws any failure after recording it on `SyncState`, so the
 *   BullMQ job is marked failed and retried by the queue.
 */
export async function runScryfallCardSync(): Promise<void> {
  const info = await getBulkDataInfo();
  const dumpUpdatedAt = new Date(info.updatedAt);

  const state = await prisma.syncState.findUnique({ where: { source: SYNC_SOURCE } });

  // Compare instants, not ISO strings — Scryfall's offset format ("+00:00")
  // wouldn't string-match our stored "Z" form even for the same moment.
  if (state?.lastDumpUpdatedAt && state.lastDumpUpdatedAt.getTime() === dumpUpdatedAt.getTime()) {
    await prisma.syncState.update({
      where: { source: SYNC_SOURCE },
      data: { status: 'skipped' },
    });
    console.info(`[scryfall-card-sync] dump unchanged (${info.updatedAt}) — skipping`);
    return;
  }

  await prisma.syncState.upsert({
    where: { source: SYNC_SOURCE },
    create: { source: SYNC_SOURCE, status: 'running' },
    update: { status: 'running', lastError: null },
  });

  try {
    const byteStream = await fetchBulkStream(info.downloadUri);

    let invalidRows = 0;
    const cards = streamNormalizedCards(byteStream, {
      onInvalidRow: (error, index) => {
        invalidRows += 1;
        console.warn(`[scryfall-card-sync] skipped invalid row ${index}:`, error);
      },
    });

    const seenOracleIds = new Set<string>();

    for await (const batch of chunkAsyncIterable(cards, CHUNK_SIZE)) {
      await upsertChunk(groupChunk(batch, seenOracleIds));
    }

    await prisma.syncState.update({
      where: { source: SYNC_SOURCE },
      data: {
        status: 'success',
        lastDumpUpdatedAt: dumpUpdatedAt,
        lastSyncedAt: new Date(),
        lastCardCount: seenOracleIds.size,
        lastError: null,
      },
    });

    console.info(
      `[scryfall-card-sync] done — ${seenOracleIds.size} cards upserted, ${invalidRows} invalid rows skipped`
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await prisma.syncState.update({
      where: { source: SYNC_SOURCE },
      data: { status: 'failed', lastError: message },
    });
    throw error;
  }
}
