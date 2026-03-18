import { supabase } from '@decksmith/db';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';

/**
 * Auth plugin — verifies the access token from the httpOnly cookie and exposes
 * `fastify.authenticate` as a preHandler decorator.
 *
 * @example
 * fastify.get('/me', { preHandler: fastify.authenticate }, handler)
 */
export default fp(
  async (app: FastifyInstance) => {
    app.decorate('authenticate', async (req: FastifyRequest, reply: FastifyReply) => {
      const token = req.cookies['access_token'];

      if (!token) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      const { data, error } = await supabase.auth.getUser(token);

      if (error ?? !data.user) {
        return reply.status(401).send({ error: 'Unauthorized' });
      }

      req.user = data.user;
    });
  },
  { name: 'auth' }
);
