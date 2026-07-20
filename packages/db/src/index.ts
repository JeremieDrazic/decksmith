export { prisma } from './client.js';
export { supabase } from './supabase.js';
export { SUPABASE_USER_ALREADY_EXISTS } from './supabase-error-codes.js';
export { Prisma } from './generated/prisma/client.js';
export type {
  PrismaClient,
  User as PrismaUser,
  UserPreferences as PrismaUserPreferences,
} from './generated/prisma/client.js';
export type { User as AuthUser } from '@supabase/supabase-js';
