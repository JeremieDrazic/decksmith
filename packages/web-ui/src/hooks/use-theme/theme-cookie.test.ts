import { describe, expect, it } from 'vitest';

import { DEFAULT_THEME, parseThemeFromCookieString } from './theme-cookie';

describe('parseThemeFromCookieString', () => {
  it('parses light from a full cookie string', () => {
    expect(parseThemeFromCookieString('decksmith-theme=light')).toBe('light');
  });

  it('parses dark from a full cookie string', () => {
    expect(parseThemeFromCookieString('decksmith-theme=dark')).toBe('dark');
  });

  it('parses correctly when the cookie is not first in the string', () => {
    expect(parseThemeFromCookieString('lang=en; decksmith-theme=light; other=foo')).toBe('light');
  });

  it('returns DEFAULT_THEME when given a raw value instead of a cookie string', () => {
    // getCookie() returns the value directly — passing it to this function is a misuse.
    expect(parseThemeFromCookieString('light')).toBe(DEFAULT_THEME);
  });

  it('returns DEFAULT_THEME when the cookie key is absent', () => {
    expect(parseThemeFromCookieString('lang=en; other=foo')).toBe(DEFAULT_THEME);
  });

  it('returns DEFAULT_THEME when the stored value is invalid', () => {
    expect(parseThemeFromCookieString('decksmith-theme=system')).toBe(DEFAULT_THEME);
  });
});
