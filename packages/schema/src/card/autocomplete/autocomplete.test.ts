import { describe, expect, it } from 'vitest';

import { CardAutocompleteQuerySchema, CardAutocompleteResponseSchema } from './autocomplete.js';

const validResult = {
  oracleId: '00000000-0000-0000-0000-000000000000',
  name: 'Lightning Bolt',
  manaCost: '{R}',
  typeLine: 'Instant',
  colors: ['R'],
  cmc: 1,
  imageUrl: null,
};

describe('CardAutocompleteQuerySchema', () => {
  it('accepts a query of at least 3 characters', () => {
    expect(CardAutocompleteQuerySchema.parse({ query: 'lig' }).query).toBe('lig');
  });

  it('trims before checking the minimum length', () => {
    expect(CardAutocompleteQuerySchema.parse({ query: '  bolt ' }).query).toBe('bolt');
    expect(CardAutocompleteQuerySchema.safeParse({ query: '  ab ' }).success).toBe(false);
  });

  it('rejects a query shorter than 3 characters', () => {
    expect(CardAutocompleteQuerySchema.safeParse({ query: 'ab' }).success).toBe(false);
  });

  it('rejects a missing query (required, no browse mode)', () => {
    expect(CardAutocompleteQuerySchema.safeParse({}).success).toBe(false);
  });
});

describe('CardAutocompleteResponseSchema', () => {
  it('accepts an empty list', () => {
    expect(CardAutocompleteResponseSchema.safeParse([]).success).toBe(true);
  });

  it('accepts a list of valid search-result items', () => {
    expect(CardAutocompleteResponseSchema.safeParse([validResult]).success).toBe(true);
  });

  it('rejects a malformed item', () => {
    expect(CardAutocompleteResponseSchema.safeParse([{}]).success).toBe(false);
  });
});
