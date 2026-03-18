export { prisma } from './client.js';
export { supabase } from './supabase.js';
export { Prisma } from '@prisma/client';
export type {
  PrismaClient,
  User as PrismaUser,
  UserPreferences as PrismaUserPreferences,
} from '@prisma/client';
export type { User as AuthUser } from '@supabase/supabase-js';
