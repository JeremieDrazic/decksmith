import { describe, expect, it, vi } from 'vitest';

import type { NormalizedCardBundle } from '../normalize-card/normalized-card.types.js';
import { streamNormalizedCards } from './index.js';

// A minimal, valid, collectible raw Scryfall row; each fixture derives from it.
const validCard = {
  oracle_id: '4457ed35-7c10-48c8-9776-456485fdf070',
  name: 'Lightning Bolt',
  cmc: 1,
  color_identity: ['R'],
  layout: 'normal',
  legalities: { commander: 'legal' },
  scryfall_uri: 'https://scryfall.com/card/lea/161',
  id: 'e3285e6b-3e79-4d7c-bf96-d920f973b122',
  set: 'lea',
  set_name: 'Limited Edition Alpha',
  collector_number: '161',
  rarity: 'common',
  finishes: ['nonfoil'],
  games: ['paper', 'mtgo'],
  set_type: 'core',
};

// Valid schema, but digital-only → isCollectibleCard drops it.
const digitalCard = { ...validCard, id: 'digital-id', games: ['arena', 'mtgo'] };

// Wrong type for cmc → fails schema validation.
const invalidCard = { ...validCard, id: 'invalid-id', cmc: 'not-a-number' };

/** Turns raw rows into the JSONL byte stream the client consumes (one per line). */
function toByteStream(rows: unknown[]): ReadableStream<Uint8Array> {
  const jsonl = rows.map((row) => JSON.stringify(row)).join('\n');
  const body = new Response(jsonl).body;
  if (!body) throw new Error('expected a response body');
  return body;
}

async function collect(
  rows: unknown[],
  options?: Parameters<typeof streamNormalizedCards>[1]
): Promise<NormalizedCardBundle[]> {
  const bundles: NormalizedCardBundle[] = [];
  for await (const bundle of streamNormalizedCards(toByteStream(rows), options)) {
    bundles.push(bundle);
  }
  return bundles;
}

describe('streamNormalizedCards', () => {
  it('yields only valid, collectible cards', async () => {
    const bundles = await collect([validCard, digitalCard, invalidCard]);

    expect(bundles).toHaveLength(1);
    expect(bundles[0]?.card.name).toBe('Lightning Bolt');
  });

  it('reports invalid rows via onInvalidRow with their index, without throwing', async () => {
    const onInvalidRow = vi.fn();

    await collect([validCard, digitalCard, invalidCard], { onInvalidRow });

    expect(onInvalidRow).toHaveBeenCalledTimes(1);
    expect(onInvalidRow).toHaveBeenCalledWith(expect.anything(), 2);
  });

  it('skips non-collectible cards silently (no yield, no onInvalidRow)', async () => {
    const onInvalidRow = vi.fn();

    const bundles = await collect([digitalCard], { onInvalidRow });

    expect(bundles).toHaveLength(0);
    expect(onInvalidRow).not.toHaveBeenCalled();
  });
});
