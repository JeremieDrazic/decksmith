import { Prisma } from '@decksmith/db';

/** Prisma error code for unique constraint violations. */
const UNIQUE_CONSTRAINT_VIOLATION = 'P2002';

/**
 * Check if an error is a Prisma unique constraint violation.
 *
 * Prisma throws this when an insert or update would violate a unique
 * index (e.g. duplicate username or email).
 *
 * @param error - The caught error value
 */
export function isUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === UNIQUE_CONSTRAINT_VIOLATION
  );
}
