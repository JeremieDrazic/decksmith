import { vi } from 'vitest';

export const supabase = {
  auth: {
    getUser: vi.fn(),
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    refreshSession: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    updateUser: vi.fn(),
    admin: {
      getUserById: vi.fn(),
      signOut: vi.fn(),
      updateUserById: vi.fn(),
      deleteUser: vi.fn(),
    },
  },
};

export const prisma = {
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  userPreferences: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
};

export const SUPABASE_USER_ALREADY_EXISTS = 'user_already_exists';

class PrismaClientKnownRequestError extends Error {
  readonly code: string;

  constructor(message: string, options: { code: string; clientVersion: string }) {
    super(message);
    this.code = options.code;
    this.name = 'PrismaClientKnownRequestError';
  }
}

export const Prisma = { PrismaClientKnownRequestError };
