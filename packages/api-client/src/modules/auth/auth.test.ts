import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { ApiError } from '../../errors/errors.js';
import { createFetcher } from '../../fetcher/fetcher.js';
import { createAuthModule } from './auth.js';

const BASE_URL = 'http://localhost:3000';
const auth = createAuthModule(createFetcher(BASE_URL));

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('auth.login', () => {
  it('returns the user on a successful login', async () => {
    const mockUser = {
      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      email: 'user@example.com',
      username: null,
      displayName: null,
      avatarUrl: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    server.use(
      http.post(`${BASE_URL}/api/v1/auth/login`, () => HttpResponse.json({ user: mockUser }))
    );

    const result = await auth.login({ email: 'user@example.com', password: 'Password1' });

    expect(result.user).toEqual(mockUser);
  });

  it('throws ApiError with INVALID_CREDENTIALS on wrong password', async () => {
    server.use(
      http.post(`${BASE_URL}/api/v1/auth/login`, () =>
        HttpResponse.json(
          {
            statusCode: 401,
            error: 'Unauthorized',
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password.',
          },
          { status: 401 }
        )
      )
    );

    await expect(
      auth.login({ email: 'user@example.com', password: 'wrongpassword' })
    ).rejects.toSatisfy((e: unknown) => e instanceof ApiError && e.code === 'INVALID_CREDENTIALS');
  });
});

describe('auth.logout', () => {
  it('sends a POST with no body and returns a message', async () => {
    let receivedBody: unknown = undefined;

    server.use(
      http.post(`${BASE_URL}/api/v1/auth/logout`, async ({ request }) => {
        const text = await request.text();
        receivedBody = text === '' ? undefined : JSON.parse(text);
        return HttpResponse.json({ message: 'Logged out.' });
      })
    );

    const result = await auth.logout();

    expect(receivedBody).toBeUndefined();
    expect(result.message).toBe('Logged out.');
  });
});
