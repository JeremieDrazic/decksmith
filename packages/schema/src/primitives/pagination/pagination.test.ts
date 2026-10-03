import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { makePaginatedSchema, toPaginated } from './pagination.js';

const StringPage = makePaginatedSchema(z.string());

describe('makePaginatedSchema', () => {
  it('accepts a well-formed page and validates each item against the schema', () => {
    const result = StringPage.parse({ data: ['a', 'b'], total: 2, page: 1, limit: 20 });
    expect(result.data).toEqual(['a', 'b']);
    expect(result.total).toBe(2);
  });

  it('accepts an empty page', () => {
    expect(StringPage.safeParse({ data: [], total: 0, page: 1, limit: 20 }).success).toBe(true);
  });

  it('rejects items that violate the element schema', () => {
    expect(StringPage.safeParse({ data: [1], total: 1, page: 1, limit: 20 }).success).toBe(false);
  });

  it('rejects a negative total', () => {
    expect(StringPage.safeParse({ data: [], total: -1, page: 1, limit: 20 }).success).toBe(false);
  });

  it('rejects a non-positive page or limit', () => {
    expect(StringPage.safeParse({ data: [], total: 0, page: 0, limit: 20 }).success).toBe(false);
    expect(StringPage.safeParse({ data: [], total: 0, page: 1, limit: 0 }).success).toBe(false);
  });
});

describe('toPaginated', () => {
  it('wraps the items and copies the pagination counters', () => {
    const page = toPaginated(['a', 'b'], { total: 42, page: 2, limit: 20 });
    expect(page).toEqual({ data: ['a', 'b'], total: 42, page: 2, limit: 20 });
  });

  it('preserves item order and keeps the same array reference', () => {
    const data = ['x', 'y', 'z'];
    const page = toPaginated(data, { total: 3, page: 1, limit: 20 });
    expect(page.data).toBe(data);
  });

  it('handles an empty page (total can exceed the page contents)', () => {
    expect(toPaginated([], { total: 0, page: 1, limit: 20 })).toEqual({
      data: [],
      total: 0,
      page: 1,
      limit: 20,
    });
  });

  it('produces an envelope that satisfies makePaginatedSchema', () => {
    const page = toPaginated(['a'], { total: 1, page: 1, limit: 20 });
    expect(StringPage.safeParse(page).success).toBe(true);
  });
});
