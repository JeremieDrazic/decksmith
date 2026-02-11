import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

import userRoutes from '../modules/user/user-routes.js';

/**
 * Register all v1 API routes under the `/api/v1` prefix.
 *
 * Each domain module is registered as a scoped plugin so that
 * domain-specific hooks or decorators stay encapsulated.
 */
export default fp(
  async (app: FastifyInstance) => {
    await app.register(
      async (v1) => {
        await v1.register(userRoutes, { prefix: '/users' });
      },
      { prefix: '/api/v1' }
    );
  },
  { name: 'v1-routes' }
);
