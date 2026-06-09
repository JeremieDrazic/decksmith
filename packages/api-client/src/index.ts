import { createFetcher } from './fetcher/fetcher.js';
import { createAuthModule } from './modules/auth/auth.js';
import { createUsersModule } from './modules/users/users.js';

/**
 * Creates a fully-typed API client for the Decksmith API.
 *
 * Instantiate once at app startup and share the instance — there is no state
 * inside the client itself (auth tokens live in httpOnly cookies, not here).
 *
 * @param baseUrl - Base URL of the API, e.g. `"http://localhost:3000"`.
 *   In apps/web, read from `import.meta.env.VITE_API_URL`.
 *
 * @example
 * // apps/web/src/lib/api.ts
 * import { createApiClient } from '@decksmith/api-client';
 * export const apiClient = createApiClient(import.meta.env.VITE_API_URL ?? 'http://localhost:3000');
 */
export function createApiClient(baseUrl: string) {
  const fetcher = createFetcher(baseUrl);
  return {
    auth: createAuthModule(fetcher),
    users: createUsersModule(fetcher),
  };
}

/** The type of the client returned by `createApiClient`. Useful for typing variables or context. */
export type ApiClient = ReturnType<typeof createApiClient>;
