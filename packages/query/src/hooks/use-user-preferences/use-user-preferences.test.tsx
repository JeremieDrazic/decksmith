import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { type ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import { createApiClient } from '@decksmith/api-client';
import { server } from '@decksmith/test-utils/server';
import { createQueryWrapper } from '@decksmith/test-utils/query-wrapper';
import { buildUserPreferences } from '@decksmith/test-utils/factories/preferences';

import { ApiClientProvider } from '../../context/context.js';
import { useUserPreferences } from './use-user-preferences.js';

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

describe('useUserPreferences', () => {
  it('returns preferences on success', async () => {
    const mockPrefs = buildUserPreferences({ userId: USER_ID });

    server.use(
      http.get(`${BASE_URL}/api/v1/users/${USER_ID}/preferences`, () =>
        HttpResponse.json(mockPrefs)
      )
    );

    const { result } = renderHook(() => useUserPreferences(USER_ID), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockPrefs);
    expect(result.current.errorCode).toBeNull();
  });

  it('sets errorCode when preferences are not found', async () => {
    server.use(
      http.get(`${BASE_URL}/api/v1/users/${USER_ID}/preferences`, () =>
        HttpResponse.json(
          {
            statusCode: 404,
            error: 'Not Found',
            code: 'PREFERENCES_NOT_FOUND',
            message: 'Preferences not found.',
          },
          { status: 404 }
        )
      )
    );

    const { result } = renderHook(() => useUserPreferences(USER_ID), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.errorCode).toBe('PREFERENCES_NOT_FOUND');
  });

  it('does not fetch when id is undefined', () => {
    const { result } = renderHook(() => useUserPreferences(undefined), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(result.current.data).toBeUndefined();
  });
});
