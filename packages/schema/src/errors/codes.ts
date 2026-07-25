/**
 * Machine-readable error codes returned by the API.
 *
 * These codes are part of the public API contract. The front-end uses
 * them as i18n translation keys (e.g. `t(`errors.${code}`)`) so they
 * must remain stable across versions.
 *
 * @example
 * import { ERROR_CODES } from '@decksmith/schema/errors/codes';
 */

// =============================================================================
// GENERIC
// =============================================================================

/** Zod validation failed on request params, body, or query. */
export const VALIDATION_ERROR = 'VALIDATION_ERROR';

/** Fallback code for 4xx errors without a specific code. */
export const REQUEST_ERROR = 'REQUEST_ERROR';

/** Unexpected server error (details hidden from client). */
export const INTERNAL_ERROR = 'INTERNAL_ERROR';

// =============================================================================
// AUTH
// =============================================================================

/** Invalid email or password (intentionally generic — never reveal which). */
export const INVALID_CREDENTIALS = 'INVALID_CREDENTIALS';

/** No active session found — user must log in. */
export const UNAUTHORIZED = 'UNAUTHORIZED';

/** The email address is already registered. */
export const EMAIL_ALREADY_TAKEN = 'EMAIL_ALREADY_TAKEN';

/** The session has expired — user must log in again. */
export const SESSION_EXPIRED = 'SESSION_EXPIRED';

/** Authenticated but not allowed to access this resource (ownership mismatch). */
export const FORBIDDEN = 'FORBIDDEN';

/** Account creation failed (e.g. third-party auth error). */
export const REGISTRATION_FAILED = 'REGISTRATION_FAILED';

/** Password reset failed (e.g. third-party auth error). */
export const PASSWORD_RESET_FAILED = 'PASSWORD_RESET_FAILED';

// =============================================================================
// USER
// =============================================================================

/** The requested user does not exist. */
export const USER_NOT_FOUND = 'USER_NOT_FOUND';

/** The requested username is already taken by another user. */
export const USERNAME_TAKEN = 'USERNAME_TAKEN';

/** The requested user preferences record does not exist. */
export const PREFERENCES_NOT_FOUND = 'PREFERENCES_NOT_FOUND';

/** A record targeted by an update or delete no longer exists (maps Prisma P2025 → 404). */
export const RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND';

/** A write referenced a parent row that does not exist (maps Prisma P2003 → 409). */
export const INVALID_REFERENCE = 'INVALID_REFERENCE';

/** Too many requests — the rate limiter rejected the call (HTTP 429). */
export const RATE_LIMITED = 'RATE_LIMITED';
