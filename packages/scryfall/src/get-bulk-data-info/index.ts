import { ScryfallBulkDataSchema } from '../schemas/scryfall-bulk-data.js';
import type { BulkDataInfo } from './bulk-data-info.types.js';

/** Scryfall's metadata endpoint for the `default_cards` bulk dump. */
const BULK_DATA_URL = 'https://api.scryfall.com/bulk-data/default_cards';

/**
 * Scryfall asks every request to identify itself and accept JSON — omitting the
 * User-Agent risks being throttled or blocked. See their API guidelines.
 */
const REQUEST_HEADERS = {
  'User-Agent': 'Decksmith/1.0 (+https://github.com/JeremieDrazic/decksmith)',
  Accept: 'application/json',
};

/**
 * Fetches the metadata for Scryfall's `default_cards` bulk dump: where to
 * download it, when it last changed, and how large it is.
 *
 * This is a cheap call (a small JSON object, not the dump itself) — the worker
 * uses `updatedAt` to decide whether the multi-GB download is even worth doing.
 *
 * @returns The dump's download URI, last-updated timestamp, and size in bytes
 * @throws If the request fails (non-2xx status) or the payload doesn't match
 *   {@link ScryfallBulkDataSchema}
 */
export async function getBulkDataInfo(): Promise<BulkDataInfo> {
  const res = await fetch(BULK_DATA_URL, { headers: REQUEST_HEADERS });

  // fetch only rejects on network failure, never on HTTP error status —
  // a 404/500 comes back as a resolved response, so we check ourselves.
  if (!res.ok) {
    throw new Error(`Scryfall bulk-data request failed: ${res.status} ${res.statusText}`);
  }

  const raw = ScryfallBulkDataSchema.parse(await res.json());

  return {
    downloadUri: raw.jsonl_download_uri,
    updatedAt: raw.updated_at,
    size: raw.compressed_size,
  };
}
