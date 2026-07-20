import { supabase } from '@decksmith/db';
import { FORBIDDEN, SESSION_EXPIRED, UNAUTHORIZED } from '@decksmith/schema/errors/codes';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';

import { createHttpError } from '../utils/http-errors/http-errors.js';

/**
 * Auth plugin — exposes two preHandler decorators on the Fastify instance:
 *
 * - `app.authenticate` — verifies the access token cookie and populates `req.user`
 * - `app.assertOwnership(paramName)` — ensures the caller owns the resource identified
 *   by the given URL param (must be called after `app.authenticate`)
 *
 * Both are designed to live in the `preHandler` array of a route so that ownership
 * checks are visible at the route definition level, not buried in the handler body.
 *
 * @example
 * fastify.get('/:id', { preHandler: [app.authenticate, app.assertOwnership('id')] }, handler)
 */
export default fp(
  async (app: FastifyInstance) => {
    app.decorate('authenticate', async (req: FastifyRequest, _reply: FastifyReply) => {
      const token = req.cookies['access_token'];

      if (!token) {
        throw createHttpError(UNAUTHORIZED, 'No access token. Please log in.', 401);
      }

      const { data, error } = await supabase.auth.getUser(token);

      // Checking error first (before !data.user) is intentional: an expired or revoked
      // JWT returns both a non-null error AND a null user. Merging into a single condition
      // makes the order irrelevant and avoids a dead SESSION_EXPIRED branch.
      // A present-but-rejected token maps to SESSION_EXPIRED; no token at all maps to UNAUTHORIZED.
      if (error || !data.user) {
        throw createHttpError(SESSION_EXPIRED, 'Session expired. Please log in again.', 401);
      }

      req.user = data.user;
    });

    app.decorate(
      'assertOwnership',
      (paramName: string) => async (req: FastifyRequest, _reply: FastifyReply) => {
        const resourceId = (req.params as Record<string, string>)[paramName];
        if (req.user.id !== resourceId) {
          throw createHttpError(
            FORBIDDEN,
            'You do not have permission to access this resource.',
            403
          );
        }
      }
    );
  },
  { name: 'auth' }
);
