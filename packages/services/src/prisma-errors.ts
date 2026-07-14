import { Prisma } from '@decksmith/db';

const UNIQUE_CONSTRAINT_VIOLATION = 'P2002';

/**
 * Check if an error is a Prisma unique constraint violation.
 *
 * @param error - The caught error value
 */
export function isUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === UNIQUE_CONSTRAINT_VIOLATION
  );
}
