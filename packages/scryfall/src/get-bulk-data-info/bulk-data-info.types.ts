/**
 * Metadata describing a Scryfall bulk dump, in our camelCase vocabulary —
 * the output of {@link getBulkDataInfo}.
 *
 * `updatedAt` is the incremental hook: the worker compares it against its last
 * sync to decide whether to re-download the (multi-GB) dump. Kept as an ISO 8601
 * string — the consumer parses it if needed.
 */
export type BulkDataInfo = {
  downloadUri: string;
  updatedAt: string;
  size: number;
};
