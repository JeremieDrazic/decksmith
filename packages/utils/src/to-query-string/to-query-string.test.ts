import { describe, expect, it } from 'vitest';

import { toQueryString } from './to-query-string.js';

describe('toQueryString', () => {
  it('serialises scalar values with a leading ?', () => {
    expect(toQueryString({ query: 'bolt', page: 1, limit: 20 })).toBe(
      '?query=bolt&page=1&limit=20'
    );
  });

  it('joins array values with commas', () => {
    expect(toQueryString({ colors: ['R', 'U'], rarities: ['rare'] })).toBe(
      '?colors=R%2CU&rarities=rare'
    );
  });

  it('omits undefined values', () => {
    expect(toQueryString({ query: 'bolt', format: undefined })).toBe('?query=bolt');
  });

  it('omits empty arrays (absent filter, not an empty match)', () => {
    expect(toQueryString({ query: 'bolt', colors: [] })).toBe('?query=bolt');
  });

  it('stringifies numbers and booleans', () => {
    expect(toQueryString({ page: 2, foil: true })).toBe('?page=2&foil=true');
  });

  it('percent-encodes special characters', () => {
    expect(toQueryString({ query: 'lightning bolt' })).toBe('?query=lightning%20bolt');
  });

  it('returns an empty string when nothing is set', () => {
    expect(toQueryString({})).toBe('');
    expect(toQueryString({ a: undefined, b: [] })).toBe('');
  });
});
