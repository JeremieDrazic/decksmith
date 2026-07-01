import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll } from 'vitest';

import { buildServer } from '@/server.js';

/**
 * Builds a Fastify test server and registers beforeAll/afterAll lifecycle hooks.
 *
 * Returns a getter so the suite can access the app after it has been created.
 *
 * @example
 * const getApp = createTestServer();
 * it('...', async () => { const res = await getApp().inject(...) });
 */
export function createTestServer(): () => FastifyInstance {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildServer();
  });

  afterAll(async () => {
    await app.close();
  });

  return () => app;
}
