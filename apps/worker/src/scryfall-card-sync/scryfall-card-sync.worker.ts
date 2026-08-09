import { Queue, Worker } from 'bullmq';

import { createRedisConnection } from '../redis.js';
import { runScryfallCardSync } from './run-scryfall-card-sync.js';

const QUEUE_NAME = 'scryfall-card-sync';
const JOB_NAME = 'sync';
const SCHEDULER_ID = 'scryfall-card-sync-daily';

// Daily at 06:00 UTC. Scryfall regenerates its bulk dumps roughly once a day;
// the run is cheap when nothing changed (metadata check → skip), so the exact
// hour is not critical.
const SYNC_CRON = '0 6 * * *';

/** A running worker plus its resources, for graceful shutdown. */
export type ScryfallCardSyncHandle = {
  queue: Queue;
  worker: Worker;
  /** Closes the worker and queue and drops both Redis connections. */
  close: () => Promise<void>;
};

/**
 * Starts the Scryfall card-sync worker: registers the daily schedule and begins
 * processing jobs.
 *
 * Uses two Redis connections (one for the queue, one for the worker) as BullMQ
 * recommends, since the worker relies on blocking commands. Concurrency is left
 * at the default of 1, so two syncs can never overlap. Retries are safe because
 * `runScryfallCardSync` is idempotent.
 *
 * @returns A handle exposing the queue, worker, and a `close` for shutdown
 */
export async function startScryfallCardSyncWorker(): Promise<ScryfallCardSyncHandle> {
  const queueConnection = createRedisConnection();
  const workerConnection = createRedisConnection();

  const queue = new Queue(QUEUE_NAME, { connection: queueConnection });

  // Idempotent: re-registering on every boot updates the schedule in place
  // rather than creating duplicates.
  await queue.upsertJobScheduler(
    SCHEDULER_ID,
    { pattern: SYNC_CRON },
    {
      name: JOB_NAME,
      opts: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 60_000 },
        removeOnComplete: { count: 10 },
        removeOnFail: { count: 50 },
      },
    }
  );

  const worker = new Worker(
    QUEUE_NAME,
    async () => {
      await runScryfallCardSync();
    },
    { connection: workerConnection }
  );

  worker.on('completed', (job) => {
    console.info(`[scryfall-card-sync] job ${job.id} completed`);
  });
  worker.on('failed', (job, error) => {
    console.error(`[scryfall-card-sync] job ${job?.id} failed:`, error);
  });

  const close = async (): Promise<void> => {
    await worker.close();
    await queue.close();
    queueConnection.disconnect();
    workerConnection.disconnect();
  };

  return { queue, worker, close };
}
