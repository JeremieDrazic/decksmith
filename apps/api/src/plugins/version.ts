import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

/**
 * Exposes the deployed application version.
 *
 * APP_VERSION is baked into the image at build time (the semantic-release version,
 * see the deploy workflow). Falls back to 'dev' locally where it isn't set.
 */
export default fp(
  (app: FastifyInstance, _opts: unknown, done: () => void) => {
    app.get('/api/version', () => ({ version: process.env['APP_VERSION'] ?? 'dev' }));
    done();
  },
  { name: 'version' }
);
