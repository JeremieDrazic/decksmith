import { describe, expect, it } from 'vitest';

import { makeContainsPattern } from './make-contains-pattern.js';

describe('makeContainsPattern', () => {
  it('wraps a plain term in % … %', () => {
    expect(makeContainsPattern('bolt')).toBe('%bolt%');
  });

  it('escapes a literal % so it is not treated as a wildcard', () => {
    expect(makeContainsPattern('50%')).toBe(String.raw`%50\%%`);
  });

  it('escapes a literal _ so it is not treated as a single-char wildcard', () => {
    expect(makeContainsPattern('a_b')).toBe(String.raw`%a\_b%`);
  });

  it('escapes a literal backslash', () => {
    expect(makeContainsPattern(String.raw`a\b`)).toBe(String.raw`%a\\b%`);
  });

  it('handles an empty term', () => {
    expect(makeContainsPattern('')).toBe('%%');
  });
});
