import { readCookie } from '@decksmith/utils';
import { ONE_YEAR_SECONDS, writeCookie } from '@decksmith/web-ui';

/**
 * Per-browser shell preferences the server has to know to paint the right frame
 * on the first render — no flash on reload for a returning visitor.
 *
 * - `wide`: is the viewport at the rail breakpoint (desktop) or below (mobile)?
 * - `folded`: has the user collapsed the desktop rail to its icons?
 *
 * Both are booleans encoded as `'1'` / `'0'`; the server reads the value via
 * `getCookie`, the client parses `document.cookie`. Not `httpOnly` — the browser
 * writes them.
 */

export const WIDE_COOKIE = 'decksmith-shell-wide';
export const FOLDED_COOKIE = 'decksmith-shell-folded';

/** Cookie value for a true flag; absence — or any other value — reads as false. */
export const TRUE_COOKIE_VALUE = '1';
const FALSE_COOKIE_VALUE = '0';

function parseBoolCookie(cookieStr: string, name: string): boolean {
  return readCookie(cookieStr, name) === TRUE_COOKIE_VALUE;
}

function writeBoolCookie(name: string, value: boolean): void {
  writeCookie(name, value ? TRUE_COOKIE_VALUE : FALSE_COOKIE_VALUE, {
    maxAgeSeconds: ONE_YEAR_SECONDS,
  });
}

/** Parse the viewport-shape flag (client). The server compares `getCookie` to `TRUE_COOKIE_VALUE`. */
export function parseWideFromCookieString(cookieStr: string): boolean {
  return parseBoolCookie(cookieStr, WIDE_COOKIE);
}

/** Remember the measured viewport shape for the next request. Client-only. */
export function writeWideCookie(wide: boolean): void {
  writeBoolCookie(WIDE_COOKIE, wide);
}

/** Parse the rail-folded preference (client). The server compares `getCookie` to `TRUE_COOKIE_VALUE`. */
export function parseFoldedFromCookieString(cookieStr: string): boolean {
  return parseBoolCookie(cookieStr, FOLDED_COOKIE);
}

/** Remember whether the user collapsed the rail. Client-only. */
export function writeFoldedCookie(folded: boolean): void {
  writeBoolCookie(FOLDED_COOKIE, folded);
}
