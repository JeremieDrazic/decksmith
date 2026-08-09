import path from 'node:path';

import { config as loadEnv } from 'dotenv';
import { z } from 'zod';

// Load the monorepo-root .env before anything reads process.env. This module is
// imported first in index.ts, ahead of @decksmith/db — whose client reads
// DATABASE_URL at import time — so env must be populated by now.
loadEnv({ path: path.resolve(import.meta.dirname, '../../../.env') });

const EnvSchema = z.object({
  // Defaults to 'production' to match the db client's global-caching branch.
  NODE_ENV: z.enum(['development', 'production', 'test']).default('production'),
  DATABASE_URL: z.string().min(1),
  // Required transitively by @decksmith/db (its Supabase client throws at import
  // if absent). Validated here so a missing value fails fast with a clear message.
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  // BullMQ's Redis connection. Defaults to the local dev container (docker-compose).
  REDIS_URL: z.string().default('redis://localhost:6379'),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(
    `Invalid environment variables:\n${JSON.stringify(parsed.error.flatten().fieldErrors, null, 2)}`
  );
}

export const config = {
  nodeEnv: parsed.data.NODE_ENV,
  databaseUrl: parsed.data.DATABASE_URL,
  redisUrl: parsed.data.REDIS_URL,
} as const;
