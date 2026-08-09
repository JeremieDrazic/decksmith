import { JSONParser } from '@streamparser/json-whatwg';

import { isCollectibleCard } from '../is-collectible-card/index.js';
import { normalizeCard } from '../normalize-card/index.js';
import type { NormalizedCardBundle } from '../normalize-card/normalized-card.types.js';
import { ScryfallCardSchema } from '../schemas/scryfall-card.js';
import type { StreamNormalizedCardsOptions } from './stream-normalized-cards.types.js';

/**
 * Streams a Scryfall `default_cards` bulk dump into normalized card bundles,
 * one at a time, without ever holding the whole (multi-GB) file in memory.
 *
 * The raw bytes flow through a streaming JSON parser that emits each top-level
 * array element (`paths: ['$.*']`) as it completes. Each row is validated,
 * filtered, and normalized:
 * - invalid rows are skipped and reported via `onInvalidRow` (never thrown, so
 *   one bad card can't abort a 90k-row sync);
 * - non-collectible cards (digital, oversized, memorabilia…) are skipped
 *   silently — that's expected filtering, not an error;
 * - valid, collectible rows are yielded as {@link NormalizedCardBundle}.
 *
 * Being an async generator gives us backpressure for free: the parser only
 * advances when the consumer pulls the next card, so a slow DB write upstream
 * naturally pauses parsing instead of flooding memory.
 *
 * A failure of the stream itself (network drop, structurally broken JSON) throws
 * and propagates out of the iteration — that's fatal, unlike a single bad row.
 *
 * @param byteStream - The dump's raw bytes (e.g. `fetch(...).body`)
 * @param options - Optional hooks; see {@link StreamNormalizedCardsOptions}
 * @yields One normalized bundle per valid, collectible card
 */
export async function* streamNormalizedCards(
  byteStream: ReadableStream<Uint8Array>,
  options: StreamNormalizedCardsOptions = {}
): AsyncGenerator<NormalizedCardBundle> {
  const parser = new JSONParser({ paths: ['$.*'] });
  const parsed = byteStream.pipeThrough(parser);

  let index = 0;
  for await (const { value } of parsed) {
    const result = ScryfallCardSchema.safeParse(value);
    if (!result.success) {
      options.onInvalidRow?.(result.error, index);
    } else if (isCollectibleCard(result.data)) {
      yield normalizeCard(result.data);
    }
    index += 1;
  }
}
