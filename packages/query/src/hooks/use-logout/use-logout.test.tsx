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
import { useLogout } from './use-logout.js';

const BASE_URL = 'http://localhost:3000';

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

describe('useLogout', () => {
  it('resolves on success', async () => {
    server.use(
      http.post(`${BASE_URL}/api/v1/auth/logout`, () =>
        HttpResponse.json({ message: 'Logged out.' })
      )
    );

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useLogout(), { wrapper });

    act(() => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.errorCode).toBeUndefined();
  });

  it('empties the query cache on success', async () => {
    server.use(
      http.post(`${BASE_URL}/api/v1/auth/logout`, () =>
        HttpResponse.json({ message: 'Logged out.' })
      )
    );

    const mockUser = buildUser();
    const { queryClient, wrapper } = createWrapper();
    queryClient.setQueryData(userKeys.detail(mockUser.id), mockUser);

    const { result } = renderHook(() => useLogout(), { wrapper });

    act(() => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryData(userKeys.detail(mockUser.id))).toBeUndefined();
  });

  it('sets errorCode when the API returns an error', async () => {
    server.use(
      http.post(`${BASE_URL}/api/v1/auth/logout`, () =>
        HttpResponse.json(
          {
            statusCode: 500,
            error: 'Internal Server Error',
            code: 'INTERNAL_ERROR',
            message: 'Something went wrong.',
          },
          { status: 500 }
        )
      )
    );

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useLogout(), { wrapper });

    act(() => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.errorCode).toBe('INTERNAL_ERROR');
  });
});
