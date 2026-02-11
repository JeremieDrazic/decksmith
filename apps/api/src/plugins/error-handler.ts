import { INTERNAL_ERROR, REQUEST_ERROR, VALIDATION_ERROR } from '@decksmith/schema/errors/codes';
import type { FastifyError, FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { hasZodFastifySchemaValidationErrors } from 'fastify-type-provider-zod';

type ApiError = {
  statusCode: number;
  error: string;
  code: string;
  message: string;
};

/**
 * Centralized error handler plugin.
 *
 * Intercepts all uncaught errors and returns a uniform JSON response
 * with a machine-readable `code` field for i18n on the client side.
 */
export default fp(
  (app: FastifyInstance, _opts: unknown, done: () => void) => {
    app.setErrorHandler((rawError, _request, reply) => {
      const error = rawError as FastifyError;
      const statusCode = error.statusCode ?? 500;

      // Zod validation errors (bad request body / params / query)
      if (hasZodFastifySchemaValidationErrors(rawError)) {
        const response: ApiError = {
          statusCode: 400,
          error: 'Bad Request',
          code: VALIDATION_ERROR,
          message: error.message,
        };
        return reply.status(400).send(response);
      }

      // Known HTTP errors (from @fastify/sensible or manual throw)
      if (statusCode < 500) {
        const response: ApiError = {
          statusCode,
          error: error.name,
          code: error.code || REQUEST_ERROR,
          message: error.message,
        };
        return reply.status(statusCode).send(response);
      }

      // Unexpected server errors — log full details, expose nothing
      app.log.error(error);
      const response: ApiError = {
        statusCode: 500,
        error: 'Internal Server Error',
        code: INTERNAL_ERROR,
        message: 'An unexpected error occurred',
      };
      return reply.status(500).send(response);
    });
    done();
  },
  { name: 'error-handler' }
);
