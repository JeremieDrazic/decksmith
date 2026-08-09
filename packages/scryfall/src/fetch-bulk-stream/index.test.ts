import { afterEach, describe, expect, it, vi } from 'vitest';

import { fetchBulkStream } from './index.js';

const DOWNLOAD_URI = 'https://data.scryfall.io/default-cards/default-cards.json';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('fetchBulkStream', () => {
  it('returns the response body as a byte stream', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('[]')));

    const stream = await fetchBulkStream(DOWNLOAD_URI);

    expect(stream).toBeInstanceOf(ReadableStream);
  });

  it('throws with the status when the response is not ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('nope', { status: 500 })));

    await expect(fetchBulkStream(DOWNLOAD_URI)).rejects.toThrow('500');
  });

  it('throws when the response has no body', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null)));

    await expect(fetchBulkStream(DOWNLOAD_URI)).rejects.toThrow('no body');
  });
});
