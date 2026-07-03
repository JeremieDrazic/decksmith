import { isApiError, type ErrorCode } from '@decksmith/api-client/errors';

/**
 * Extracts the typed error code from an error returned by a TanStack Query hook.
 *
 * Returns undefined for non-ApiError values (network failures, unexpected JS errors).
 *
 * @param error - The error from `query.error` or `mutation.error`.
 */
export function getErrorCode(error: Error | null): ErrorCode | undefined {
  return isApiError(error) ? (error.code as ErrorCode) : undefined;
}
