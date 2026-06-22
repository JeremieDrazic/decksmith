import { describe, expect, it } from 'vitest';
import { sortColorIdentity } from './sort-color-identity';

describe('sortColorIdentity', () => {
  it('returns already-sorted identity unchanged', () => {
    expect(sortColorIdentity(['w', 'u', 'b'])).toEqual(['w', 'u', 'b']);
  });

  it('sorts an unsorted identity to WUBRG order', () => {
    expect(sortColorIdentity(['g', 'w', 'u'])).toEqual(['w', 'u', 'g']);
  });

  it('sorts all five colors to WUBRG order', () => {
    expect(sortColorIdentity(['r', 'g', 'w', 'b', 'u'])).toEqual(['w', 'u', 'b', 'r', 'g']);
  });

  it('places colorless last', () => {
    expect(sortColorIdentity(['c', 'w'])).toEqual(['w', 'c']);
  });

  it('handles a single color', () => {
    expect(sortColorIdentity(['r'])).toEqual(['r']);
  });

  it('returns empty array for empty input', () => {
    expect(sortColorIdentity([])).toEqual([]);
  });

  it('does not mutate the original array', () => {
    const original: ['g', 'w'] = ['g', 'w'];
    sortColorIdentity(original);
    expect(original).toEqual(['g', 'w']);
  });
});
