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
  card: {
    findUnique: vi.fn(),
  },
  cardPrint: {
    findMany: vi.fn(),
  },
  // Card search/autocomplete run raw SQL. The query never executes under test
  // (this is a mock), so tests set the resolved rows directly.
  $queryRaw: vi.fn(),
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

// The card service composes its WHERE/ORDER BY clauses with `Prisma.sql`,
// `Prisma.join` and `Prisma.empty`. Since `$queryRaw` is mocked and never runs
// the SQL, these only need to exist and not throw — a placeholder object is enough.
const sqlPlaceholder = {};
export const Prisma = {
  PrismaClientKnownRequestError,
  sql: (..._args: unknown[]) => sqlPlaceholder,
  join: (..._args: unknown[]) => sqlPlaceholder,
  empty: sqlPlaceholder,
};
