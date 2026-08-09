import { afterEach, describe, expect, it, vi } from 'vitest';

import { getBulkDataInfo } from './index.js';

// A valid Scryfall bulk-data payload; each test overrides or omits one field.
const validPayload = {
  object: 'bulk_data',
  type: 'default_cards',
  download_uri: 'https://data.scryfall.io/default-cards/default-cards.json',
  updated_at: '2026-08-08T09:00:00.000+00:00',
  size: 2_100_000_000,
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('getBulkDataInfo', () => {
  it('maps a valid payload to camelCase info', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(validPayload))));

    await expect(getBulkDataInfo()).resolves.toEqual({
      downloadUri: 'https://data.scryfall.io/default-cards/default-cards.json',
      updatedAt: '2026-08-08T09:00:00.000+00:00',
      size: 2_100_000_000,
    });
  });

  it('throws with the status when the response is not ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('not found', { status: 404 })));

    await expect(getBulkDataInfo()).rejects.toThrow('404');
  });

  it('throws when the payload does not match the schema', async () => {
    const { size: _size, ...withoutSize } = validPayload;
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(withoutSize))));

    await expect(getBulkDataInfo()).rejects.toThrow();
  });
});
