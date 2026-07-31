import type { ScryfallCard } from '../schemas/scryfall-card.js';

/**
 * Tells whether a Scryfall card is a real, paper, collectible card worth
 * ingesting — used to filter the bulk dump before normalization.
 *
 * Drops, in order: digital-only cards (no `paper` in `games`), oversized cards
 * (Commander/box toppers), memorabilia (gold-bordered, art cards), and Scryfall
 * `art_series` (which carry no type line or cmc). Tokens and emblems are kept on
 * purpose — they matter for proxies and deck-size rules downstream.
 *
 * @param card - A validated Scryfall bulk row
 * @returns `true` if the card should be ingested, `false` if it should be dropped
 */
export function isCollectibleCard(card: ScryfallCard): boolean {
  if (!card.games.includes('paper')) return false;
  if (card.oversized === true) return false;
  if (card.set_type === 'memorabilia') return false;
  if (card.layout === 'art_series') return false;
  return true;
}
