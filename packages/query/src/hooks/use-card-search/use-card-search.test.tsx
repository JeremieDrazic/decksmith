import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { type ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import { createApiClient } from '@decksmith/api-client';
import { server } from '@decksmith/test-utils/server';
import { createQueryWrapper } from '@decksmith/test-utils/query-wrapper';

import { ApiClientProvider } from '../../context/context.js';
import { useCardSearch } from './use-card-search.js';

const BASE_URL = 'http://localhost:3000';

const searchResponse = {
  data: [
    {
      oracleId: '11111111-1111-4111-8111-111111111111',
      name: 'Lightning Bolt',
      manaCost: '{R}',
      typeLine: 'Instant',
      colors: ['R'],
      cmc: 1,
      imageUrl: 'https://cards.example/bolt.jpg',
    },
  ],
  total: 1,
  page: 1,
  limit: 20,
};

function createWrapper() {
  const QueryWrapper = createQueryWrapper();
  const apiClient = createApiClient(BASE_URL);
  return ({ children }: { children: ReactNode }) => (
    <QueryWrapper>
      <ApiClientProvider client={apiClient}>{children}</ApiClientProvider>
    </QueryWrapper>
  );
}

describe('useCardSearch', () => {
  it('returns the paginated search results on success', async () => {
    server.use(
      http.get(`${BASE_URL}/api/v1/cards/search`, () => HttpResponse.json(searchResponse))
    );

    const { result } = renderHook(() => useCardSearch({ query: 'bolt', page: 1, limit: 20 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.total).toBe(1);
    expect(result.current.data?.data[0]?.name).toBe('Lightning Bolt');
    expect(result.current.errorCode).toBeUndefined();
  });

  it('forwards the filters as query params', async () => {
    let capturedUrl = '';
    server.use(
      http.get(`${BASE_URL}/api/v1/cards/search`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json(searchResponse);
      })
    );

    const { result } = renderHook(
      () => useCardSearch({ query: 'bolt', colors: ['R', 'U'], page: 1, limit: 20 }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(new URL(capturedUrl).searchParams.get('colors')).toBe('R,U');
  });

  it('sets errorCode when the API returns an error', async () => {
    server.use(
      http.get(`${BASE_URL}/api/v1/cards/search`, () =>
        HttpResponse.json(
          {
            statusCode: 400,
            error: 'Bad Request',
            code: 'VALIDATION_ERROR',
            message: 'Invalid query.',
          },
          { status: 400 }
        )
      )
    );

    const { result } = renderHook(() => useCardSearch({ page: 1, limit: 20 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.errorCode).toBe('VALIDATION_ERROR');
    expect(result.current.data).toBeUndefined();
  });
});
