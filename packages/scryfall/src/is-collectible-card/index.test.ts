import { describe, expect, it } from 'vitest';

import type { ScryfallCard } from '../schemas/scryfall-card.js';
import { isCollectibleCard } from './index.js';

// A minimal, valid, collectible paper card; each test overrides one field.
const base: ScryfallCard = {
  oracle_id: '4457ed35-7c10-48c8-9776-456485fdf070',
  name: 'Lightning Bolt',
  color_identity: ['R'],
  cmc: 1,
  layout: 'normal',
  legalities: { commander: 'legal' },
  scryfall_uri: 'https://scryfall.com/card/lea/161',
  id: 'e3285e6b-3e79-4d7c-bf96-d920f973b122',
  set: 'lea',
  collector_number: '161',
  rarity: 'common',
  finishes: ['nonfoil'],
  games: ['paper', 'mtgo'],
  set_type: 'core',
};

describe('isCollectibleCard', () => {
  it('keeps a normal paper card', () => {
    expect(isCollectibleCard(base)).toBe(true);
  });

  it('drops a digital-only card (no paper in games)', () => {
    expect(isCollectibleCard({ ...base, games: ['arena', 'mtgo'] })).toBe(false);
  });

  it('drops an oversized card', () => {
    expect(isCollectibleCard({ ...base, oversized: true })).toBe(false);
  });

  it('drops a memorabilia card', () => {
    expect(isCollectibleCard({ ...base, set_type: 'memorabilia' })).toBe(false);
  });

  it('drops an art_series card', () => {
    expect(isCollectibleCard({ ...base, layout: 'art_series' })).toBe(false);
  });
});
