import path from 'node:path';

import { config } from 'dotenv';
import { defineConfig, env } from 'prisma/config';

// Load .env from monorepo root
config({ path: path.resolve(import.meta.dirname, '../../.env') });

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
  },

  // Database connection (loaded from environment)
  datasource: {
    url: env('DATABASE_URL'),
  },
});
