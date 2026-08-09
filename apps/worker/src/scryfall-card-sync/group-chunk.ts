import type { NormalizedCardBundle } from '@decksmith/scryfall';

import type { GroupedChunk } from './group-chunk.types.js';

/**
 * Turns a chunk of normalized bundles into three write-ready lists, ordered for
 * foreign-key safety (`cards` → `faces` → `prints`).
 *
 * Deduplication: the `default_cards` dump carries one row per printing, so the
 * same oracle card recurs many times. Using `seenOracleIds` as a run-wide
 * accumulator, a card and its faces are emitted only on their first sighting —
 * across the entire run, not just this chunk — while every print is always
 * emitted (each is unique by `scryfallId`). A print whose card was seen in an
 * earlier chunk still has its foreign key satisfied, because that card was
 * committed by the earlier chunk's transaction.
 *
 * No I/O; deterministic given its inputs. The only effect is the documented
 * mutation of `seenOracleIds`.
 *
 * @param bundles - The bundles in this chunk (one per Scryfall row)
 * @param seenOracleIds - Oracle IDs already emitted earlier in the run.
 *   **Mutated in place**: every newly emitted card's `oracleId` is added, so the
 *   next chunk sees it as already written. Callers create one empty `Set` per
 *   run and thread it through every `groupChunk` call.
 * @returns The chunk's cards, faces, and prints, in FK-safe write order
 */
export function groupChunk(
  bundles: NormalizedCardBundle[],
  seenOracleIds: Set<string>
): GroupedChunk {
  const cards: GroupedChunk['cards'] = [];
  const faces: GroupedChunk['faces'] = [];
  const prints: GroupedChunk['prints'] = [];

  for (const bundle of bundles) {
    prints.push(bundle.print);

    if (!seenOracleIds.has(bundle.card.oracleId)) {
      seenOracleIds.add(bundle.card.oracleId);
      cards.push(bundle.card);
      faces.push(...bundle.faces);
    }
  }

  return { cards, faces, prints };
}
