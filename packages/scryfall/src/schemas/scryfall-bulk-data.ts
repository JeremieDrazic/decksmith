import { z } from 'zod';

/**
 * Scryfall's `bulk_data` object — the metadata describing a bulk dump, not the
 * cards themselves (returned by `GET /bulk-data/{type}`, e.g. `default_cards`).
 *
 * This is the metadata ingestion boundary: it validates Scryfall's raw
 * snake_case payload so the download client knows where to fetch the dump and
 * when it last changed. Provider knowledge (Scryfall's wire format), not an API
 * DTO. Only the fields we actually read are declared — Zod strips the rest, so
 * the schema stays small and survives Scryfall adding fields.
 *
 * `updated_at` is the incremental hook: the worker compares it against its last
 * sync to decide whether to re-download the (multi-GB) dump. Kept as a string
 * (ISO 8601) — the consumer parses it if needed.
 */
export const ScryfallBulkDataSchema = z.object({
  download_uri: z.string(),
  updated_at: z.string(),
  size: z.number(),
});

export type ScryfallBulkData = z.infer<typeof ScryfallBulkDataSchema>;
