import { Redis } from 'ioredis';

import { config } from './config.js';

/**
 * Creates a Redis connection for BullMQ.
 *
 * `maxRetriesPerRequest: null` is mandatory for BullMQ: its workers issue
 * blocking commands (e.g. `BRPOPLPUSH`) that must wait indefinitely for a job
 * rather than erroring out once a retry budget is exhausted. BullMQ also
 * recommends a dedicated connection per Queue/Worker, so this is a factory
 * rather than a shared singleton.
 *
 * @returns A new ioredis connection pointed at `REDIS_URL`
 */
export function createRedisConnection(): Redis {
  return new Redis(config.redisUrl, { maxRetriesPerRequest: null });
}
