import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';

import { apiClient } from '../api-client';

/**
 * Server function that returns the currently authenticated user, or null.
 *
 * Runs on the server in both cases:
 * - SSR (initial load / refresh): reads the incoming Cookie header via
 *   getWebRequest() and forwards it to the API — the server has no browser
 *   cookie jar of its own.
 * - Client-side navigation: the browser makes an RPC call; the browser sends
 *   its cookies automatically, so getWebRequest() sees them on the server.
 *
 * Used by the _authenticated layout's beforeLoad to guard protected routes.
 */
export const $getMe = createServerFn({ method: 'GET' }).handler(async () => {
  const request = getRequest();
  const cookie = request?.headers.get('cookie') ?? undefined;
  return apiClient.auth.me(cookie ? { headers: { cookie } } : undefined);
});
