import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { type ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import { createApiClient } from '@decksmith/api-client';
import { server } from '@decksmith/test-utils/server';
import { createQueryWrapper } from '@decksmith/test-utils/query-wrapper';
import { buildUser } from '@decksmith/test-utils/factories/user';

import { ApiClientProvider } from '../../context/context.js';
import { useUser } from './use-user.js';

const BASE_URL = 'http://localhost:3000';
const USER_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

function createWrapper() {
  const QueryWrapper = createQueryWrapper();
  const apiClient = createApiClient(BASE_URL);
  return ({ children }: { children: ReactNode }) => (
    <QueryWrapper>
      <ApiClientProvider client={apiClient}>{children}</ApiClientProvider>
    </QueryWrapper>
  );
}

describe('useUser', () => {
  it('returns the user data on success', async () => {
    const mockUser = buildUser({ id: USER_ID });

    server.use(http.get(`${BASE_URL}/api/v1/users/${USER_ID}`, () => HttpResponse.json(mockUser)));

    const { result } = renderHook(() => useUser(USER_ID), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockUser);
    expect(result.current.errorCode).toBeNull();
  });

  it('sets errorCode when the API returns an error', async () => {
    server.use(
      http.get(`${BASE_URL}/api/v1/users/${USER_ID}`, () =>
        HttpResponse.json(
          {
            statusCode: 404,
            error: 'Not Found',
            code: 'USER_NOT_FOUND',
            message: 'User not found.',
          },
          { status: 404 }
        )
      )
    );

    const { result } = renderHook(() => useUser(USER_ID), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.errorCode).toBe('USER_NOT_FOUND');
    expect(result.current.data).toBeUndefined();
  });

  it('does not fetch when id is undefined', () => {
    const { result } = renderHook(() => useUser(undefined), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(result.current.data).toBeUndefined();
  });
});
