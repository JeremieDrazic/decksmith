import { describe, expect, it } from 'vitest';
import { getColorIdentityName } from './get-color-identity-name';

describe('getColorIdentityName', () => {
  it('returns mono-color names', () => {
    expect(getColorIdentityName(['W'])).toBe('White');
    expect(getColorIdentityName(['U'])).toBe('Blue');
    expect(getColorIdentityName(['B'])).toBe('Black');
    expect(getColorIdentityName(['R'])).toBe('Red');
    expect(getColorIdentityName(['G'])).toBe('Green');
  });

  it('returns colorless for empty identity', () => {
    expect(getColorIdentityName([])).toBe('Colorless');
  });

  it('returns Colorless for explicit colorless', () => {
    expect(getColorIdentityName(['C'])).toBe('Colorless');
  });

  it('returns guild names regardless of input order', () => {
    expect(getColorIdentityName(['W', 'U'])).toBe('Azorius');
    expect(getColorIdentityName(['U', 'W'])).toBe('Azorius');
    expect(getColorIdentityName(['B', 'R'])).toBe('Rakdos');
    expect(getColorIdentityName(['G', 'U'])).toBe('Simic');
  });

  it('returns shard names', () => {
    expect(getColorIdentityName(['B', 'U', 'W'])).toBe('Esper');
    expect(getColorIdentityName(['R', 'B', 'U'])).toBe('Grixis');
    expect(getColorIdentityName(['W', 'G', 'R'])).toBe('Naya');
  });

  it('returns clan/wedge names', () => {
    expect(getColorIdentityName(['G', 'W', 'B'])).toBe('Abzan');
    expect(getColorIdentityName(['R', 'U', 'W'])).toBe('Jeskai');
    expect(getColorIdentityName(['U', 'G', 'B'])).toBe('Sultai');
  });

  it('returns nephilim names', () => {
    expect(getColorIdentityName(['R', 'W', 'U', 'B'])).toBe('Yore-Tiller');
    expect(getColorIdentityName(['G', 'U', 'B', 'R'])).toBe('Glint-Eye');
  });

  it('returns Five-Color for WUBRG', () => {
    expect(getColorIdentityName(['W', 'U', 'B', 'R', 'G'])).toBe('Five-Color');
    expect(getColorIdentityName(['G', 'R', 'B', 'U', 'W'])).toBe('Five-Color');
  });

  it('returns the sorted key fallback for unknown combinations', () => {
    expect(getColorIdentityName(['W', 'C'])).toBe('WC');
  });
});
