/**
 * Scryfall asks every request to identify itself with a User-Agent — omitting it
 * risks being throttled or blocked. See their API guidelines.
 */
const REQUEST_HEADERS = {
  'User-Agent': 'Decksmith/1.0 (+https://github.com/JeremieDrazic/decksmith)',
};

/**
 * Downloads a Scryfall bulk dump and returns its decompressed byte stream, ready
 * to feed to {@link streamNormalizedCards} — the file is never buffered in full.
 *
 * The dump is served as gzipped JSONL (`.jsonl.gz`) with `Content-Type:
 * application/gzip` and no `Content-Encoding`, so `fetch` does not decompress it
 * for us. We pipe the body through a `DecompressionStream('gzip')`, keeping the
 * whole thing streaming — decompression happens chunk by chunk, in step with the
 * downstream parser's backpressure.
 *
 * The download URI comes from {@link getBulkDataInfo}; this stays a thin network
 * layer on purpose, so parsing stays testable without hitting the wire.
 *
 * @param downloadUri - The dump's `jsonl_download_uri` from the bulk-data metadata
 * @returns The decompressed response body as a stream of bytes
 * @throws If the request fails (non-2xx status) or the response has no body
 */
export async function fetchBulkStream(downloadUri: string): Promise<ReadableStream<Uint8Array>> {
  const res = await fetch(downloadUri, { headers: REQUEST_HEADERS });

  // fetch only rejects on network failure, never on HTTP error status.
  if (!res.ok) {
    throw new Error(`Scryfall bulk download failed: ${res.status} ${res.statusText}`);
  }

  if (!res.body) {
    throw new Error('Scryfall bulk download returned no body');
  }

  return res.body.pipeThrough(new DecompressionStream('gzip'));
}
