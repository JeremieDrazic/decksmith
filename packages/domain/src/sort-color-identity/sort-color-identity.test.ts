import { describe, expect, it } from 'vitest';
import { sortColorIdentity } from './sort-color-identity';

describe('sortColorIdentity', () => {
  it('returns already-sorted identity unchanged', () => {
    expect(sortColorIdentity(['W', 'U', 'B'])).toEqual(['W', 'U', 'B']);
  });

  it('sorts an unsorted identity to WUBRG order', () => {
    expect(sortColorIdentity(['G', 'W', 'U'])).toEqual(['W', 'U', 'G']);
  });

  it('sorts all five colors to WUBRG order', () => {
    expect(sortColorIdentity(['R', 'G', 'W', 'B', 'U'])).toEqual(['W', 'U', 'B', 'R', 'G']);
  });

  it('places colorless last', () => {
    expect(sortColorIdentity(['C', 'W'])).toEqual(['W', 'C']);
  });

  it('handles a single color', () => {
    expect(sortColorIdentity(['R'])).toEqual(['R']);
  });

  it('returns empty array for empty input', () => {
    expect(sortColorIdentity([])).toEqual([]);
  });

  it('does not mutate the original array', () => {
    const original: ['G', 'W'] = ['G', 'W'];
    sortColorIdentity(original);
    expect(original).toEqual(['G', 'W']);
  });
});
