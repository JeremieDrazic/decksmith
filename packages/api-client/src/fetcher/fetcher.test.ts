import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { ApiError } from '../errors/errors.js';
import { createFetcher } from './fetcher.js';

const BASE_URL = 'http://localhost:3000';
const fetcher = createFetcher(BASE_URL);

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('createFetcher', () => {
  it('returns the parsed JSON body on a 2xx response', async () => {
    server.use(
      http.get(`${BASE_URL}/api/v1/test`, () => HttpResponse.json({ id: '123', name: 'Test' }))
    );

    const result = await fetcher<{ id: string; name: string }>({
      method: 'GET',
      path: '/api/v1/test',
    });

    expect(result).toEqual({ id: '123', name: 'Test' });
  });

  it('throws ApiError with the correct properties on a non-2xx JSON response', async () => {
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
      fetcher({
        method: 'POST',
        path: '/api/v1/auth/login',
        body: { email: 'a@b.com', password: 'wrong' },
      })
    ).rejects.toSatisfy((e: unknown) => {
      if (!(e instanceof ApiError)) return false;
      return (
        e.statusCode === 401 &&
        e.code === 'INVALID_CREDENTIALS' &&
        e.message === 'Invalid email or password.'
      );
    });
  });

  it('throws ApiError with REQUEST_ERROR when the error response is not JSON', async () => {
    server.use(
      http.get(
        `${BASE_URL}/api/v1/unknown`,
        () =>
          new HttpResponse('<html>Not Found</html>', {
            status: 404,
            headers: { 'Content-Type': 'text/html' },
          })
      )
    );

    await expect(fetcher({ method: 'GET', path: '/api/v1/unknown' })).rejects.toSatisfy(
      (e: unknown) => {
        if (!(e instanceof ApiError)) return false;
        return e.statusCode === 404 && e.code === 'REQUEST_ERROR';
      }
    );
  });

  it('sends credentials: include on every request', async () => {
    let capturedCredentials: RequestCredentials | undefined;

    server.use(
      http.get(`${BASE_URL}/api/v1/test`, ({ request }) => {
        capturedCredentials = request.credentials;
        return HttpResponse.json({});
      })
    );

    await fetcher({ method: 'GET', path: '/api/v1/test' });

    expect(capturedCredentials).toBe('include');
  });
});
