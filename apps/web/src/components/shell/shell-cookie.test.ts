import { describe, expect, it } from 'vitest';

import { parseWideFromCookieString, WIDE_COOKIE, writeWideCookie } from './shell-cookie';

describe('parseWideFromCookieString', () => {
  it('is true for the wide value (happy path)', () => {
    expect(parseWideFromCookieString(`${WIDE_COOKIE}=1`)).toBe(true);
  });

  it('is false for the narrow value', () => {
    expect(parseWideFromCookieString(`${WIDE_COOKIE}=0`)).toBe(false);
  });

  it('is false when the cookie is absent', () => {
    expect(parseWideFromCookieString('other=x')).toBe(false);
  });
});

describe('writeWideCookie', () => {
  it('round-trips through the document — true, then overwritten to false', () => {
    writeWideCookie(true);
    expect(parseWideFromCookieString(document.cookie)).toBe(true);

    writeWideCookie(false);
    expect(parseWideFromCookieString(document.cookie)).toBe(false);
  });
});
