import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { type ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import { createApiClient } from '@decksmith/api-client';
import { server } from '@decksmith/test-utils/server';

import { ApiClientProvider } from '../../context/context.js';
import { useRegister } from './use-register.js';

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

  return { wrapper };
}

describe('useRegister', () => {
  it('returns the confirmation message on success', async () => {
    server.use(
      http.post(`${BASE_URL}/api/v1/auth/register`, () =>
        HttpResponse.json({
          user: { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', email: VALID_INPUT.email },
          message: 'Confirmation email sent. Please check your inbox.',
        })
      )
    );

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useRegister(), { wrapper });

    act(() => {
      result.current.mutate(VALID_INPUT);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.message).toBe('Confirmation email sent. Please check your inbox.');
    expect(result.current.errorCode).toBeUndefined();
  });

  it('sets errorCode when the API returns an error', async () => {
    server.use(
      http.post(`${BASE_URL}/api/v1/auth/register`, () =>
        HttpResponse.json(
          {
            statusCode: 409,
            error: 'Conflict',
            code: 'EMAIL_ALREADY_TAKEN',
            message: 'An account with this email already exists.',
          },
          { status: 409 }
        )
      )
    );

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useRegister(), { wrapper });

    act(() => {
      result.current.mutate(VALID_INPUT);
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.errorCode).toBe('EMAIL_ALREADY_TAKEN');
    expect(result.current.data).toBeUndefined();
  });
});
