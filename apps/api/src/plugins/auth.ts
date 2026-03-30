import { supabase } from '@decksmith/db';
import { SESSION_EXPIRED, UNAUTHORIZED } from '@decksmith/schema/errors/codes';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';

import { createHttpError } from '@/utils/http-errors.js';

/**
 * Auth plugin — verifies the access token from the httpOnly cookie and exposes
 * `fastify.authenticate` as a preHandler decorator.
 *
 * Throws a structured error routed through the centralized error handler so
 * all 401 responses have the same `{ statusCode, error, code, message }` shape.
 *
 * @example
 * fastify.get('/me', { preHandler: fastify.authenticate }, handler)
 */
export default fp(
  async (app: FastifyInstance) => {
    app.decorate('authenticate', async (req: FastifyRequest, _reply: FastifyReply) => {
      const token = req.cookies['access_token'];

      if (!token) {
        throw createHttpError(UNAUTHORIZED, 'No access token. Please log in.', 401);
      }

      const { data, error } = await supabase.auth.getUser(token);

      if (!data.user) {
        throw createHttpError(UNAUTHORIZED, 'No access token. Please log in.', 401);
      }

      // Supabase returns an AuthApiError with code 'user_not_found' or similar
      // when the JWT is expired. Map it to SESSION_EXPIRED so the client can
      // distinguish "never logged in" from "session timed out".
      if (error) {
        throw createHttpError(SESSION_EXPIRED, 'Session expired. Please log in again.', 401);
      }

      req.user = data.user;
    });
  },
  { name: 'auth' }
);
