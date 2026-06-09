import type {
  EMAIL_ALREADY_TAKEN,
  INTERNAL_ERROR,
  INVALID_CREDENTIALS,
  PASSWORD_RESET_FAILED,
  PREFERENCES_NOT_FOUND,
  REGISTRATION_FAILED,
  REQUEST_ERROR,
  SESSION_EXPIRED,
  UNAUTHORIZED,
  USERNAME_TAKEN,
  USER_NOT_FOUND,
  VALIDATION_ERROR,
} from '@decksmith/schema/errors/codes';

/**
 * Union of all error codes the API can return.
 *
 * Each member is derived via `import type` + `typeof` from `@decksmith/schema/errors/codes`
 * — single source of truth. If a code's string value changes there, this type updates automatically.
 */
export type ErrorCode =
  | typeof VALIDATION_ERROR
  | typeof REQUEST_ERROR
  | typeof INTERNAL_ERROR
  | typeof INVALID_CREDENTIALS
  | typeof UNAUTHORIZED
  | typeof EMAIL_ALREADY_TAKEN
  | typeof SESSION_EXPIRED
  | typeof REGISTRATION_FAILED
  | typeof PASSWORD_RESET_FAILED
  | typeof USER_NOT_FOUND
  | typeof USERNAME_TAKEN
  | typeof PREFERENCES_NOT_FOUND;

/**
 * Shape of the JSON body the API always sends on non-2xx responses.
 *
 * Matches the error-handler plugin in `apps/api/src/plugins/error-handler.ts`.
 */
export type ApiErrorResponse = {
  statusCode: number;
  error: string;
  /** Known code from `@decksmith/schema`, or an unknown string on unexpected errors. */
  code: ErrorCode | string;
  message: string;
};

/**
 * Typed error thrown by the API client on any non-2xx response.
 *
 * Use `isApiError(e)` in catch blocks to narrow `unknown` to this type,
 * then check `e.code` against the constants in `@decksmith/schema/errors/codes`.
 *
 * @example
 * import { isApiError } from '@decksmith/api-client/errors';
 * import { INVALID_CREDENTIALS } from '@decksmith/schema/errors/codes';
 *
 * try {
 *   await apiClient.auth.login(input);
 * } catch (e) {
 *   if (isApiError(e) && e.code === INVALID_CREDENTIALS) { ... }
 * }
 */
export class ApiError extends Error {
  readonly statusCode: number;
  readonly code: ErrorCode | string;
  readonly error: string;

  constructor(response: ApiErrorResponse) {
    super(response.message);
    this.name = 'ApiError';
    this.statusCode = response.statusCode;
    this.code = response.code;
    this.error = response.error;
  }
}

/**
 * Type guard to narrow an unknown caught value to `ApiError`.
 *
 * Always use this before accessing `.code` or `.statusCode` in a catch block —
 * `catch (e)` gives you `unknown`, not `ApiError`.
 */
export function isApiError(e: unknown): e is ApiError {
  return e instanceof ApiError;
}
