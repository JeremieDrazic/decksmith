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
// USER
// =============================================================================

/** The requested user does not exist. */
export const USER_NOT_FOUND = 'USER_NOT_FOUND';

/** The requested username is already taken by another user. */
export const USERNAME_TAKEN = 'USERNAME_TAKEN';

/** The requested user preferences record does not exist. */
export const PREFERENCES_NOT_FOUND = 'PREFERENCES_NOT_FOUND';
