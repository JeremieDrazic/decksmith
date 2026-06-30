import type { FastifyError } from 'fastify';

/**
 * Create a typed HTTP error with a machine-readable code for i18n.
 *
 * The `code` field is used by the client as a translation key
 * (e.g. `t(`errors.${code}`)` → "Utilisateur introuvable").
 *
 * @param code - Machine-readable error code (e.g. USER_NOT_FOUND)
 * @param message - Human-readable fallback message (English)
 * @param statusCode - HTTP status code
 */
export function createHttpError(code: string, message: string, statusCode: number): FastifyError {
  const error = new Error(message) as FastifyError;
  error.statusCode = statusCode;
  error.code = code;
  return error;
}
