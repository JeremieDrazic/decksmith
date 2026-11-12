import { readCookie } from '@decksmith/utils';
import { ONE_YEAR_SECONDS, writeCookie } from '@decksmith/web-ui';

/**
 * Remembers the viewport class this browser last measured, so a returning
 * visitor gets the right navigation on the very first server render.
 *
 * The server cannot measure the window; without this seed it would always send
 * the mobile floor and a desktop reload would flash the bottom bar before the
 * rail appeared. The shell writes the measured value back on every render; the
 * `_authenticated` loader reads it to pick the shape it renders.
 */

/** Cookie key for SSR navigation-shape resolution. */
export const WIDE_COOKIE = 'decksmith-shell-wide';

/** Value meaning "wide" (desktop rail). Anything else — or no cookie — means narrow. */
export const WIDE_COOKIE_VALUE = '1';

/** Value written for the narrow (mobile bottom-nav) shape. */
const NARROW_COOKIE_VALUE = '0';

/**
 * Parse the shell-wide flag from a raw cookie string (client-side).
 * The server reads the value via `getCookie` and compares to `WIDE_COOKIE_VALUE`.
 *
 * @param cookieStr - Raw cookie string (e.g. `document.cookie`).
 * @returns `true` for the wide shape, `false` when absent or any other value.
 */
export function parseWideFromCookieString(cookieStr: string): boolean {
  return readCookie(cookieStr, WIDE_COOKIE) === WIDE_COOKIE_VALUE;
}

/**
 * Remember this browser's current viewport class for the next request.
 * Client-only.
 *
 * @param wide - `true` when the viewport is at or above the rail breakpoint.
 */
export function writeWideCookie(wide: boolean): void {
  writeCookie(WIDE_COOKIE, wide ? WIDE_COOKIE_VALUE : NARROW_COOKIE_VALUE, {
    maxAgeSeconds: ONE_YEAR_SECONDS,
  });
}
