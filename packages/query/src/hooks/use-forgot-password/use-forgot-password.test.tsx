import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { type ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import { createApiClient } from '@decksmith/api-client';
import { server } from '@decksmith/test-utils/server';

import { ApiClientProvider } from '../../context/context.js';
import { useForgotPassword } from './use-forgot-password.js';

const BASE_URL = 'http://localhost:3000';
const VALID_INPUT = { email: 'user@example.com' };

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

  return { wrapper };
}

describe('useForgotPassword', () => {
  it('returns the confirmation message on success', async () => {
    server.use(
      http.post(`${BASE_URL}/api/v1/auth/forgot-password`, () =>
        HttpResponse.json({ message: 'If this email exists, a reset link has been sent.' })
      )
    );

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useForgotPassword(), { wrapper });

    act(() => {
      result.current.mutate(VALID_INPUT);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.message).toBe('If this email exists, a reset link has been sent.');
    expect(result.current.errorCode).toBeUndefined();
  });

  it('sets errorCode when the API returns an error', async () => {
    server.use(
      http.post(`${BASE_URL}/api/v1/auth/forgot-password`, () =>
        HttpResponse.json(
          {
            statusCode: 500,
            error: 'Internal Server Error',
            code: 'PASSWORD_RESET_FAILED',
            message: 'Could not send reset email.',
          },
          { status: 500 }
        )
      )
    );

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useForgotPassword(), { wrapper });

    act(() => {
      result.current.mutate(VALID_INPUT);
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.errorCode).toBe('PASSWORD_RESET_FAILED');
    expect(result.current.data).toBeUndefined();
  });
});
