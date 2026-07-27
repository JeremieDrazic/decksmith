import { describe, expect, it } from 'vitest';

import { parsePrice } from './prices.js';

describe('parsePrice', () => {
  it('parses a valid price string to a number', () => {
    expect(parsePrice('12.99')).toBe(12.99);
    expect(parsePrice('0')).toBe(0);
    expect(parsePrice('1000')).toBe(1000);
  });

  it('returns null for null and empty string', () => {
    expect(parsePrice(null)).toBeNull();
    expect(parsePrice('')).toBeNull();
  });

  it('returns null for a non-numeric string', () => {
    expect(parsePrice('abc')).toBeNull();
  });

  it('returns null for a negative price (violates the nonnegative contract)', () => {
    expect(parsePrice('-1.50')).toBeNull();
  });

  it('returns null for a partial-numeric string (no silent partial parse)', () => {
    expect(parsePrice('12.99abc')).toBeNull();
  });
});
