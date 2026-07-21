import path from 'node:path';

import { config } from 'dotenv';
import { defineConfig } from 'prisma/config';

// Load .env from monorepo root
config({ path: path.resolve(import.meta.dirname, '../../.env') });

// `prisma generate` only reads the schema — it never connects — so it must not require a live
// DATABASE_URL. Without this fallback, a fresh clone or CI (no .env yet) fails at `postinstall`.
// Commands that DO connect (db push / migrate / studio) always run with a real DATABASE_URL loaded
// above, so the placeholder never reaches them. This file is CLI-only — never read at runtime.
const DATABASE_URL = process.env['DATABASE_URL'] ?? 'postgresql://placeholder:5432/placeholder';

/**
 * Prisma configuration file (Prisma 7+).
 *
 * This file centralizes all Prisma configuration:
 * - Database connection URL (from environment variable)
 * - Schema file location
 * - Migrations directory
 */
export default defineConfig({
  // Where to find the schema file
  schema: 'prisma/schema.prisma',

  // Migrations configuration
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },

  // Database connection (loaded from environment; placeholder keeps `generate` env-free)
  datasource: {
    url: DATABASE_URL,
  },
});
