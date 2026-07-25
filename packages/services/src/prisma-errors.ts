import { Prisma } from '@decksmith/db';

const UNIQUE_CONSTRAINT_VIOLATION = 'P2002';
const RECORD_NOT_FOUND = 'P2025';
const FOREIGN_KEY_VIOLATION = 'P2003';

/**
 * Check if an error is a Prisma unique constraint violation (P2002).
 *
 * @param error - The caught error value
 */
export function isUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === UNIQUE_CONSTRAINT_VIOLATION
  );
}

/**
 * Check if an error is a Prisma "record not found" error (P2025) — an update or
 * delete targeting a row that no longer exists. Should map to HTTP 404, not 500.
 *
 * @param error - The caught error value
 */
export function isRecordNotFoundError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === RECORD_NOT_FOUND;
}

/**
 * Check if an error is a Prisma foreign key constraint violation (P2003) — a write
 * referencing a parent row that does not exist. Should map to HTTP 409, not 500.
 *
 * @param error - The caught error value
 */
export function isForeignKeyError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError && error.code === FOREIGN_KEY_VIOLATION
  );
}
