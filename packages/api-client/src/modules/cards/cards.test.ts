import { server } from '@decksmith/test-utils/server';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { createFetcher } from '../../fetcher/fetcher.js';
import { createCardsModule } from './cards.js';

const BASE_URL = 'http://localhost:3000';
const cards = createCardsModule(createFetcher(BASE_URL));

const ORACLE_ID = '11111111-1111-4111-8111-111111111111';

const searchResult = {
  oracleId: ORACLE_ID,
  name: 'Lightning Bolt',
  manaCost: '{R}',
  typeLine: 'Instant',
  colors: ['R'],
  cmc: 1,
  imageUrl: 'https://cards.example/bolt.jpg',
};

describe('cards.search', () => {
  it('serialises the query into the URL and returns the paginated page', async () => {
    let capturedUrl = '';
    server.use(
      http.get(`${BASE_URL}/api/v1/cards/search`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ data: [searchResult], total: 1, page: 1, limit: 20 });
      })
    );

    const result = await cards.search({
      query: 'bolt',
      colors: ['R', 'U'],
      page: 1,
      limit: 20,
    });

    const url = new URL(capturedUrl);
    expect(url.searchParams.get('query')).toBe('bolt');
    expect(url.searchParams.get('colors')).toBe('R,U');
    expect(result.total).toBe(1);
    expect(result.data[0]?.name).toBe('Lightning Bolt');
  });
});

describe('cards.autocomplete', () => {
  it('sends the query param and returns a flat array', async () => {
    let capturedUrl = '';
    server.use(
      http.get(`${BASE_URL}/api/v1/cards/autocomplete`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json([searchResult]);
      })
    );

    const result = await cards.autocomplete('bol');

    expect(new URL(capturedUrl).searchParams.get('query')).toBe('bol');
    expect(result).toHaveLength(1);
  });
});

describe('cards.getCard', () => {
  it('fetches the card detail at the correct path', async () => {
    server.use(
      http.get(`${BASE_URL}/api/v1/cards/${ORACLE_ID}`, () =>
        HttpResponse.json({ oracleId: ORACLE_ID, name: 'Lightning Bolt' })
      )
    );

    const result = await cards.getCard(ORACLE_ID);

    expect(result.oracleId).toBe(ORACLE_ID);
  });
});

describe('cards.getCardPrints', () => {
  it('appends the sort param when provided', async () => {
    let capturedUrl = '';
    server.use(
      http.get(`${BASE_URL}/api/v1/cards/${ORACLE_ID}/prints`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json([]);
      })
    );

    await cards.getCardPrints(ORACLE_ID, 'name');

    expect(new URL(capturedUrl).searchParams.get('sort')).toBe('name');
  });

  it('omits the sort param when not provided', async () => {
    let capturedUrl = '';
    server.use(
      http.get(`${BASE_URL}/api/v1/cards/${ORACLE_ID}/prints`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json([]);
      })
    );

    await cards.getCardPrints(ORACLE_ID);

    expect(new URL(capturedUrl).searchParams.has('sort')).toBe(false);
  });
});
