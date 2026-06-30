import type { FastifyInstance } from 'fastify';

/**
 * Sends an authenticated inject request as the given user.
 *
 * Sets the `access_token` cookie so the `authenticate` preHandler passes.
 * The actual token value doesn't matter — `supabase.auth.getUser` is mocked in tests.
 *
 * @param app - The Fastify test instance
 * @param method - HTTP method
 * @param url - Route URL
 * @param payload - Optional request body
 */
export function asUser(
  app: FastifyInstance,
  method: string,
  url: string,
  payload?: unknown
): ReturnType<FastifyInstance['inject']> {
  return app.inject({
    method,
    url,
    cookies: { access_token: 'test-token' },
    ...(payload === undefined ? {} : { payload }),
  });
}

/**
 * Sends an unauthenticated inject request (no cookie).
 *
 * @param app - The Fastify test instance
 * @param method - HTTP method
 * @param url - Route URL
 * @param payload - Optional request body
 */
export function asGuest(
  app: FastifyInstance,
  method: string,
  url: string,
  payload?: unknown
): ReturnType<FastifyInstance['inject']> {
  return app.inject({
    method,
    url,
    ...(payload === undefined ? {} : { payload }),
  });
}
