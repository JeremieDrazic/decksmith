import type { NormalizedCard, NormalizedFace, NormalizedPrint } from '@decksmith/scryfall';

/**
 * The write-ready shape of one chunk, produced by `groupChunk` and consumed by
 * `upsertChunk`.
 *
 * The `default_cards` dump has one row per *printing* (~90k), but only ~30k
 * unique oracle cards — the same `Card` (and its faces) recurs once per
 * printing. `groupChunk` deduplicates so a card and its faces are written only
 * on their first sighting across the whole run, while every print is kept
 * (each is unique by `scryfallId`).
 *
 * The three lists are written in this declared order — `cards` → `faces` →
 * `prints` — to satisfy foreign keys: a `CardPrint`/`CardFace` cannot be
 * inserted before its parent `Card` exists (`CardPrint → Card` is
 * `onDelete: Restrict`; `CardFace → Card` is `onDelete: Cascade`).
 */
export type GroupedChunk = {
  cards: NormalizedCard[];
  faces: NormalizedFace[];
  prints: NormalizedPrint[];
};
