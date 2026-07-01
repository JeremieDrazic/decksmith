import { describe, expect, it } from 'vitest';

import { HexColorSchema, PaginationInputSchema, SlugSchema, UuidSchema } from './common.js';

// ---------------------------------------------------------------------------
// UuidSchema
// ---------------------------------------------------------------------------

describe('UuidSchema', () => {
  it('accepts a valid UUID', () => {
    expect(UuidSchema.safeParse('a1b2c3d4-e5f6-7890-abcd-ef1234567890').success).toBe(true);
  });

  it('rejects a non-UUID string', () => {
    expect(UuidSchema.safeParse('not-a-uuid').success).toBe(false);
  });

  it('rejects an empty string', () => {
    expect(UuidSchema.safeParse('').success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// PaginationInputSchema
// ---------------------------------------------------------------------------

describe('PaginationInputSchema', () => {
  it('applies default values when no input given', () => {
    const result = PaginationInputSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it('coerces string numbers from query params', () => {
    const result = PaginationInputSchema.safeParse({ page: '2', limit: '50' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(50);
    }
  });

  it('rejects page = 0', () => {
    expect(PaginationInputSchema.safeParse({ page: 0 }).success).toBe(false);
  });

  it('rejects limit above 100', () => {
    expect(PaginationInputSchema.safeParse({ limit: 101 }).success).toBe(false);
  });

  it('rejects negative values', () => {
    expect(PaginationInputSchema.safeParse({ page: -1 }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// HexColorSchema
// ---------------------------------------------------------------------------

describe('HexColorSchema', () => {
  it('accepts a valid hex color', () => {
    expect(HexColorSchema.safeParse('#3B82F6').success).toBe(true);
    expect(HexColorSchema.safeParse('#ffffff').success).toBe(true);
  });

  it('rejects a hex color without the # prefix', () => {
    expect(HexColorSchema.safeParse('3B82F6').success).toBe(false);
  });

  it('rejects a shorthand hex (#RGB)', () => {
    expect(HexColorSchema.safeParse('#FFF').success).toBe(false);
  });

  it('rejects non-hex characters', () => {
    expect(HexColorSchema.safeParse('#GGGGGG').success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// SlugSchema
// ---------------------------------------------------------------------------

describe('SlugSchema', () => {
  it('accepts a valid slug', () => {
    expect(SlugSchema.safeParse('my-deck-name').success).toBe(true);
    expect(SlugSchema.safeParse('deck123').success).toBe(true);
  });

  it('rejects slugs with uppercase letters', () => {
    expect(SlugSchema.safeParse('My-Deck').success).toBe(false);
  });

  it('rejects slugs with leading or trailing hyphens', () => {
    expect(SlugSchema.safeParse('-deck').success).toBe(false);
    expect(SlugSchema.safeParse('deck-').success).toBe(false);
  });

  it('rejects slugs with consecutive hyphens', () => {
    expect(SlugSchema.safeParse('my--deck').success).toBe(false);
  });

  it('rejects slugs with spaces or special characters', () => {
    expect(SlugSchema.safeParse('my deck').success).toBe(false);
    expect(SlugSchema.safeParse('deck_name').success).toBe(false);
  });

  it('rejects an empty string', () => {
    expect(SlugSchema.safeParse('').success).toBe(false);
  });

  it('rejects strings over 100 characters', () => {
    expect(SlugSchema.safeParse('a'.repeat(101)).success).toBe(false);
  });
});
