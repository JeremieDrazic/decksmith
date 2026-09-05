import { describe, expect, it } from 'vitest';

import { CardSearchQuerySchema, CardSortSchema } from './search.js';

describe('CardSearchQuerySchema', () => {
  it('applies page/limit defaults on an empty query', () => {
    const result = CardSearchQuerySchema.parse({});
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.query).toBeUndefined();
  });

  it('trims query and rejects a blank one', () => {
    expect(CardSearchQuerySchema.parse({ query: '  bolt ' }).query).toBe('bolt');
    expect(CardSearchQuerySchema.safeParse({ query: '   ' }).success).toBe(false);
  });

  it('coerces numeric params from their string form', () => {
    const result = CardSearchQuerySchema.parse({ page: '3', limit: '50', cmcMin: '2' });
    expect(result.page).toBe(3);
    expect(result.limit).toBe(50);
    expect(result.cmcMin).toBe(2);
  });

  it('rejects a limit outside 1..100', () => {
    expect(CardSearchQuerySchema.safeParse({ limit: '200' }).success).toBe(false);
    expect(CardSearchQuerySchema.safeParse({ limit: '0' }).success).toBe(false);
  });

  it('parses colors from a comma-separated value, trimming and dropping empties', () => {
    expect(CardSearchQuerySchema.parse({ colors: 'R,U' }).colors).toEqual(['R', 'U']);
    expect(CardSearchQuerySchema.parse({ colors: 'R, U,' }).colors).toEqual(['R', 'U']);
  });

  it('rejects an unknown color', () => {
    expect(CardSearchQuerySchema.safeParse({ colors: 'R,X' }).success).toBe(false);
  });

  it('rejects an unknown rarity', () => {
    expect(CardSearchQuerySchema.safeParse({ rarities: 'rare,foo' }).success).toBe(false);
  });

  it('lowercases set codes to match stored values', () => {
    expect(CardSearchQuerySchema.parse({ sets: 'LEA,M11' }).sets).toEqual(['lea', 'm11']);
  });

  it('accepts a known format and rejects an unknown one', () => {
    expect(CardSearchQuerySchema.parse({ format: 'commander' }).format).toBe('commander');
    expect(CardSearchQuerySchema.safeParse({ format: 'pauperz' }).success).toBe(false);
  });

  it('accepts an inclusive cmc range, including equal bounds (exact cmc)', () => {
    expect(CardSearchQuerySchema.parse({ cmcMin: '3', cmcMax: '3' }).cmcMin).toBe(3);
    expect(CardSearchQuerySchema.safeParse({ cmcMin: '2', cmcMax: '5' }).success).toBe(true);
    expect(CardSearchQuerySchema.safeParse({ cmcMin: '4' }).success).toBe(true);
  });

  it('rejects an inverted cmc range with the CMC_RANGE_INVALID code', () => {
    const result = CardSearchQuerySchema.safeParse({ cmcMin: '5', cmcMax: '2' });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('CMC_RANGE_INVALID');
  });
});

describe('CardSortSchema', () => {
  it('accepts the four sort keys', () => {
    for (const key of ['relevance', 'name', 'cmc', 'released']) {
      expect(CardSortSchema.parse(key)).toBe(key);
    }
  });

  it('rejects an unknown sort key', () => {
    expect(CardSortSchema.safeParse('power').success).toBe(false);
  });
});
