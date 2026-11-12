/** One year in seconds — the default lifetime for a persisted preference cookie. */
export const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/** Options for {@link writeCookie}. */
export type WriteCookieOptions = {
  /** Lifetime in seconds. Omit for a session cookie (cleared when the browser closes). */
  maxAgeSeconds?: number;
  /** CSRF-hardening scope sent with the cookie. @default 'Lax' */
  sameSite?: 'Lax' | 'Strict' | 'None';
};

/**
 * Write a cookie from the browser. Client-only — it assigns `document.cookie`.
 *
 * Always scoped to `path=/` so the cookie is sent on every route. Read it back
 * with `readCookie` from `@decksmith/utils`.
 *
 * @param name - Cookie name.
 * @param value - Cookie value, written as-is (URL-encode first if it may contain `;`).
 * @param options - Lifetime and SameSite scope — see {@link WriteCookieOptions}.
 */
export function writeCookie(name: string, value: string, options: WriteCookieOptions = {}): void {
  const { maxAgeSeconds, sameSite = 'Lax' } = options;

  const parts = [`${name}=${value}`, 'path=/', `SameSite=${sameSite}`];
  if (maxAgeSeconds !== undefined) parts.push(`max-age=${maxAgeSeconds}`);

  // oxlint-disable-next-line unicorn/no-document-cookie -- the one intentional cookie write for the repo; Cookie Store API is async, unusable in sync UI handlers
  document.cookie = parts.join(';');
}
