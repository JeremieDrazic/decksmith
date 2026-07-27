import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from './generated/prisma/client.js';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient(): PrismaClient {
  const connectionString = process.env['DATABASE_URL'];
  if (!connectionString) {
    throw new Error('Missing required environment variable: DATABASE_URL');
  }
  // Cap the client-side pool: we connect through Supabase's session-mode pooler, where each open
  // connection holds a dedicated server connection and the free tier's budget is small. 5 gives one
  // API instance enough concurrency; revisit if we ever run multiple replicas.
  const adapter = new PrismaPg({ connectionString, max: 5 });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env['NODE_ENV'] !== 'production') {
  globalForPrisma.prisma = prisma;
}
