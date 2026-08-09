import { createInterface } from 'node:readline';
import { Readable } from 'node:stream';

import { isCollectibleCard } from '../is-collectible-card/index.js';
import { normalizeCard } from '../normalize-card/index.js';
import type { NormalizedCardBundle } from '../normalize-card/normalized-card.types.js';
import { ScryfallCardSchema } from '../schemas/scryfall-card.js';
import type { StreamNormalizedCardsOptions } from './stream-normalized-cards.types.js';

/**
 * Parses one JSONL line into a normalized bundle, or returns null when the line
 * should yield nothing: a JSON syntax error or a schema mismatch is reported via
 * `onInvalidRow` (never thrown, so one bad line can't abort a 90k-row sync); a
 * valid but non-collectible card is skipped silently.
 */
function normalizeLine(
  line: string,
  index: number,
  options: StreamNormalizedCardsOptions
): NormalizedCardBundle | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(line);
  } catch (error) {
    options.onInvalidRow?.(error, index);
    return null;
  }

  const result = ScryfallCardSchema.safeParse(parsed);
  if (!result.success) {
    options.onInvalidRow?.(result.error, index);
    return null;
  }

  if (!isCollectibleCard(result.data)) {
    return null;
  }

  return normalizeCard(result.data);
}

/**
 * Streams a Scryfall `default_cards` bulk dump into normalized card bundles, one
 * at a time, without ever holding the whole (multi-GB) file in memory.
 *
 * The dump is JSONL — one JSON card object per line, already decompressed by
 * {@link fetchBulkStream}. We hand the byte stream to Node's built-in `readline`
 * (via `Readable.fromWeb`), which does all the line-splitting plumbing —
 * buffering partial lines and normalizing `\r\n` — so we just iterate lines.
 * Each line is parsed, validated, filtered, and normalized:
 * - invalid lines (bad JSON or failing `ScryfallCardSchema`) are skipped and
 *   reported via `onInvalidRow`;
 * - non-collectible cards (digital, oversized, memorabilia…) are skipped
 *   silently — that's expected filtering, not an error;
 * - valid, collectible lines are yielded as {@link NormalizedCardBundle}.
 *
 * Being an async generator gives us backpressure for free: readline only
 * advances when the consumer pulls the next card, so a slow DB write upstream
 * naturally pauses reading instead of flooding memory.
 *
 * A failure of the stream itself (network drop, broken gzip) throws and
 * propagates out of the iteration — that's fatal, unlike a single bad line.
 *
 * @param byteStream - The dump's decompressed bytes (from {@link fetchBulkStream})
 * @param options - Optional hooks; see {@link StreamNormalizedCardsOptions}
 * @yields One normalized bundle per valid, collectible card
 */
export async function* streamNormalizedCards(
  byteStream: ReadableStream<Uint8Array>,
  options: StreamNormalizedCardsOptions = {}
): AsyncGenerator<NormalizedCardBundle> {
  const lines = createInterface({
    input: Readable.fromWeb(byteStream),
    crlfDelay: Infinity, // treat \r\n as a single line break
  });

  let index = 0;
  for await (const line of lines) {
    if (line.trim() === '') {
      continue;
    }

    const bundle = normalizeLine(line, index, options);
    if (bundle) {
      yield bundle;
    }
    index += 1;
  }
}
