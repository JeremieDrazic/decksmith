import { describe, expect, it } from 'vitest';
import { getColorIdentityName } from './get-color-identity-name';

describe('getColorIdentityName', () => {
  it('returns mono-color names', () => {
    expect(getColorIdentityName(['w'])).toBe('White');
    expect(getColorIdentityName(['u'])).toBe('Blue');
    expect(getColorIdentityName(['b'])).toBe('Black');
    expect(getColorIdentityName(['r'])).toBe('Red');
    expect(getColorIdentityName(['g'])).toBe('Green');
  });

  it('returns colorless for empty identity', () => {
    expect(getColorIdentityName([])).toBe('Colorless');
  });

  it('returns Colorless for explicit colorless', () => {
    expect(getColorIdentityName(['c'])).toBe('Colorless');
  });

  it('returns guild names regardless of input order', () => {
    expect(getColorIdentityName(['w', 'u'])).toBe('Azorius');
    expect(getColorIdentityName(['u', 'w'])).toBe('Azorius');
    expect(getColorIdentityName(['b', 'r'])).toBe('Rakdos');
    expect(getColorIdentityName(['g', 'u'])).toBe('Simic');
  });

  it('returns shard names', () => {
    expect(getColorIdentityName(['b', 'u', 'w'])).toBe('Esper');
    expect(getColorIdentityName(['r', 'b', 'u'])).toBe('Grixis');
    expect(getColorIdentityName(['w', 'g', 'r'])).toBe('Naya');
  });

  it('returns clan/wedge names', () => {
    expect(getColorIdentityName(['g', 'w', 'b'])).toBe('Abzan');
    expect(getColorIdentityName(['r', 'u', 'w'])).toBe('Jeskai');
    expect(getColorIdentityName(['u', 'g', 'b'])).toBe('Sultai');
  });

  it('returns nephilim names', () => {
    expect(getColorIdentityName(['r', 'w', 'u', 'b'])).toBe('Yore-Tiller');
    expect(getColorIdentityName(['g', 'u', 'b', 'r'])).toBe('Glint-Eye');
  });

  it('returns Five-Color for WUBRG', () => {
    expect(getColorIdentityName(['w', 'u', 'b', 'r', 'g'])).toBe('Five-Color');
    expect(getColorIdentityName(['g', 'r', 'b', 'u', 'w'])).toBe('Five-Color');
  });

  it('returns uppercase key fallback for unknown combinations', () => {
    expect(getColorIdentityName(['w', 'c'])).toBe('WC');
  });
});
