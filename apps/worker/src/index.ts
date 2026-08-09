import './config.js'; // MUST be first — loads .env before @decksmith/db reads DATABASE_URL

import { startScryfallCardSyncWorker } from './scryfall-card-sync/scryfall-card-sync.worker.js';

const handle = await startScryfallCardSyncWorker();
console.info('[worker] scryfall-card-sync worker started');

function shutdown(signal: string): void {
  console.info(`[worker] received ${signal}, shutting down…`);
  // Once close() drops the Redis connections there are no open handles left, so
  // the process exits on its own — no explicit process.exit needed.
  handle.close().catch((error: unknown) => {
    console.error('[worker] error during shutdown:', error);
    process.exitCode = 1;
  });
}

process.on('SIGINT', () => {
  shutdown('SIGINT');
});
process.on('SIGTERM', () => {
  shutdown('SIGTERM');
});
