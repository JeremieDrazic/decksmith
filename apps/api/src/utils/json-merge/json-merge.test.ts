import { describe, expect, it } from 'vitest';

import { mergeJsonField } from './json-merge.js';

describe('mergeJsonField', () => {
  it('returns existing value unchanged when partial is undefined', () => {
    const existing = { a: 1, b: 2 };
    expect(mergeJsonField(existing, undefined)).toBe(existing);
  });

  it('shallow-merges partial fields into existing object', () => {
    const existing = { a: 1, b: 2 };
    const result = mergeJsonField(existing, { b: 99, c: 3 });
    expect(result).toEqual({ a: 1, b: 99, c: 3 });
  });

  it('does not mutate the existing object', () => {
    const existing = { a: 1 };
    mergeJsonField(existing, { a: 2 });
    expect(existing.a).toBe(1);
  });
});
