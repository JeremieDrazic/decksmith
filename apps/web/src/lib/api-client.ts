import { createApiClient } from '@decksmith/api-client';

/**
 * Resolve the API base URL for the current execution context.
 *
 * - Server (SSR / server functions): the runtime `API_URL` env wins when set — in
 *   production `http://api:3000`, reached over the compose-internal network. The server
 *   cannot use a relative path.
 * - Browser: the build-time `VITE_API_URL`. In production it is `''`, so requests are
 *   same-origin relative (`/api/...`) — which keeps auth cookies same-origin.
 * - Dev: `API_URL` is unset and `VITE_API_URL` comes from `.env`, so behavior is unchanged.
 */
const baseUrl =
  globalThis.window === undefined && process.env['API_URL']
    ? process.env['API_URL']
    : (import.meta.env['VITE_API_URL'] ?? 'http://localhost:3000');

export const apiClient = createApiClient(baseUrl);
