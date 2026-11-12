import { describe, expect, it } from 'vitest';

import { readCookie } from './read-cookie.js';

describe('readCookie', () => {
  it('returns the value of a named cookie (happy path)', () => {
    expect(readCookie('a=1; b=2; c=3', 'b')).toBe('2');
  });

  it('tolerates the spacing browsers use after each semicolon', () => {
    expect(readCookie('theme=dark; lang=fr', 'lang')).toBe('fr');
  });

  it('returns undefined when the cookie is absent', () => {
    expect(readCookie('a=1', 'missing')).toBeUndefined();
  });

  it('matches the name exactly — a lookup of "foo" ignores "xfoo"', () => {
    expect(readCookie('xfoo=wrong; foo=right', 'foo')).toBe('right');
  });

  it('keeps a value that itself contains "=" (e.g. base64)', () => {
    expect(readCookie('token=ab=cd==', 'token')).toBe('ab=cd==');
  });

  it('distinguishes a present-but-empty cookie from an absent one', () => {
    expect(readCookie('a=; b=2', 'a')).toBe('');
    expect(readCookie('', 'a')).toBeUndefined();
  });
});
