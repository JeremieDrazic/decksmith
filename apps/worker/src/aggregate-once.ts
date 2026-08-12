import './config.js'; // MUST be first — loads .env before @decksmith/db reads DATABASE_URL

import { prisma } from '@decksmith/db';

import { aggregateCardAttributes } from './scryfall-card-sync/aggregate-card-attributes.js';

/**
 * One-off manual trigger for the level-2 aggregation pass *only* — recomputes
 * the denormalized `Card.rarities`/`finishes`/`firstReleasedAt` columns from the
 * prints already in the database, without re-downloading the Scryfall dump.
 *
 * Used to backfill those columns on data loaded before they existed: a full sync
 * would re-fetch + re-upsert the whole dump (~15 min), whereas this is a single
 * set-based SQL pass (seconds).
 *
 *   pnpm --filter @decksmith/worker aggregate:once
 */
try {
  const count = await aggregateCardAttributes();
  console.info(`[worker] aggregation done — ${count} cards refreshed`);
} catch (error) {
  console.error('[worker] aggregation failed:', error);
  process.exitCode = 1;
} finally {
  // Close the pooled connection so the process can exit on its own.
  await prisma.$disconnect();
}
