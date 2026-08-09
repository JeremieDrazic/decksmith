import { gzipSync } from 'node:zlib';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { fetchBulkStream } from './index.js';

const DOWNLOAD_URI = 'https://data.scryfall.io/default-cards/default-cards.jsonl.gz';

async function readAll(stream: ReadableStream<Uint8Array>): Promise<string> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  for (;;) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks).toString('utf8');
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('fetchBulkStream', () => {
  it('decompresses the gzipped body into a byte stream', async () => {
    const payload = '{"object":"card","name":"Forest"}\n';
    const gzipped = gzipSync(Buffer.from(payload));
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(gzipped)));

    const stream = await fetchBulkStream(DOWNLOAD_URI);

    expect(stream).toBeInstanceOf(ReadableStream);
    await expect(readAll(stream)).resolves.toBe(payload);
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
