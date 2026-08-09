import './config.js'; // MUST be first — loads .env before @decksmith/db reads DATABASE_URL

import { prisma } from '@decksmith/db';

import { runScryfallCardSync } from './scryfall-card-sync/run-scryfall-card-sync.js';

/**
 * One-off manual trigger for the Scryfall card sync — the same job the cron
 * runs, but invoked directly, once, then exits. Needs neither Redis nor BullMQ
 * (runScryfallCardSync only does network + Prisma), so it's the clean way to
 * perform the first ingestion or to validate the pipeline end-to-end.
 *
 *   pnpm --filter @decksmith/worker sync:once
 */
try {
  await runScryfallCardSync();
  console.info('[worker] one-off sync finished');
} catch (error) {
  console.error('[worker] one-off sync failed:', error);
  process.exitCode = 1;
} finally {
  // Close the pooled connection so the process can exit on its own.
  await prisma.$disconnect();
}
