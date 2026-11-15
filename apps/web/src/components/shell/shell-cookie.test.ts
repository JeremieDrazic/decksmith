import { describe, expect, it } from 'vitest';

import {
  FOLDED_COOKIE,
  parseFoldedFromCookieString,
  parseWideFromCookieString,
  WIDE_COOKIE,
  writeFoldedCookie,
  writeWideCookie,
} from './shell-cookie';

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

describe('parseFoldedFromCookieString', () => {
  it('is true for the folded value (happy path)', () => {
    expect(parseFoldedFromCookieString(`${FOLDED_COOKIE}=1`)).toBe(true);
  });

  it('is false for the unfolded value', () => {
    expect(parseFoldedFromCookieString(`${FOLDED_COOKIE}=0`)).toBe(false);
  });

  it('is false when the cookie is absent', () => {
    expect(parseFoldedFromCookieString('other=x')).toBe(false);
  });
});

describe('writeFoldedCookie', () => {
  it('round-trips through the document — true, then overwritten to false', () => {
    writeFoldedCookie(true);
    expect(parseFoldedFromCookieString(document.cookie)).toBe(true);

    writeFoldedCookie(false);
    expect(parseFoldedFromCookieString(document.cookie)).toBe(false);
  });
});
