import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

/** Health-check route used by load balancers and orchestrators. */
export default fp(
  (app: FastifyInstance, _opts: unknown, done: () => void) => {
    app.get('/api/health', () => ({ status: 'ok' }));
    done();
  },
  { name: 'health' }
);
