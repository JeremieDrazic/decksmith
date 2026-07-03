import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { type ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import { createApiClient } from '@decksmith/api-client';
import { server } from '@decksmith/test-utils/server';
import { buildUser } from '@decksmith/test-utils/factories/user';

import { ApiClientProvider } from '../../context/context.js';
import { userKeys } from '../use-user/use-user.js';
import { useLogin } from './use-login.js';

const BASE_URL = 'http://localhost:3000';
const VALID_INPUT = { email: 'user@example.com', password: 'Password1' };

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  const apiClient = createApiClient(BASE_URL);

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <ApiClientProvider client={apiClient}>{children}</ApiClientProvider>
    </QueryClientProvider>
  );

  return { queryClient, wrapper };
}

describe('useLogin', () => {
  it('returns the user data on success', async () => {
    const mockUser = buildUser();

    server.use(
      http.post(`${BASE_URL}/api/v1/auth/login`, () => HttpResponse.json({ user: mockUser }))
    );

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useLogin(), { wrapper });

    act(() => {
      result.current.mutate(VALID_INPUT);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.user).toEqual(mockUser);
    expect(result.current.errorCode).toBeUndefined();
  });

  it('seeds the user cache on success', async () => {
    const mockUser = buildUser();

    server.use(
      http.post(`${BASE_URL}/api/v1/auth/login`, () => HttpResponse.json({ user: mockUser }))
    );

    const { queryClient, wrapper } = createWrapper();
    const { result } = renderHook(() => useLogin(), { wrapper });

    act(() => {
      result.current.mutate(VALID_INPUT);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(queryClient.getQueryData(userKeys.detail(mockUser.id))).toEqual(mockUser);
  });

  it('sets errorCode when the API returns an error', async () => {
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

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useLogin(), { wrapper });

    act(() => {
      result.current.mutate(VALID_INPUT);
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.errorCode).toBe('INVALID_CREDENTIALS');
    expect(result.current.data).toBeUndefined();
  });
});
