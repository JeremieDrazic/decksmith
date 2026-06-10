import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll } from 'vitest';

/**
 * Shared MSW server for all tests in the consuming package.
 *
 * Import this in vitest.config.ts via `setupFiles` to register the
 * server lifecycle automatically — no need to repeat beforeAll/afterEach/afterAll
 * in each test file.
 *
 * Add per-test handlers with `server.use(...)` inside individual tests.
 *
 * @example
 * // vitest.config.ts
 * test: { setupFiles: ['@decksmith/test-utils/server'] }
 *
 * // my-hook.test.ts
 * import { server } from '@decksmith/test-utils/server';
 * server.use(http.get('/api/v1/...', () => HttpResponse.json(...)));
 */
export const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
