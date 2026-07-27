import path from 'node:path';

import { config as loadEnv } from 'dotenv';
import { z } from 'zod';

loadEnv({ path: path.resolve(import.meta.dirname, '../../../.env') });

const EnvSchema = z.object({
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default('0.0.0.0'),
  // Defaults to 'production' so cookies are always secure: true unless explicitly overridden.
  // Set NODE_ENV=development in .env for local development.
  NODE_ENV: z.enum(['development', 'production', 'test']).default('production'),
  DATABASE_URL: z.string().min(1),
  // Required by packages/db (Supabase client). Validated here so a missing value fails at
  // startup with a clear message, not with a deep stack trace from inside the db package.
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  COOKIE_SECRET: z
    .string()
    .min(
      64,
      'COOKIE_SECRET must be at least 64 characters. Generate one with: openssl rand -base64 64'
    ),
  CORS_ORIGIN: z.string().default('http://localhost:3001'),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(
    `Invalid environment variables:\n${JSON.stringify(parsed.error.flatten().fieldErrors, null, 2)}`
  );
}

export const config = {
  port: parsed.data.PORT,
  host: parsed.data.HOST,
  nodeEnv: parsed.data.NODE_ENV,
  databaseUrl: parsed.data.DATABASE_URL,
  cookieSecret: parsed.data.COOKIE_SECRET,
  corsOrigin: parsed.data.CORS_ORIGIN,
} as const;
