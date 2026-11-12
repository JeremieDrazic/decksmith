/**
 * Read a single cookie's value from a raw cookie string.
 *
 * Pure — it does not touch `document.cookie`; pass that (or a request's Cookie
 * header) in. Matches the cookie name exactly, so a lookup of `foo` never picks
 * up `xfoo`, and keeps a value that itself contains `=` (e.g. base64) intact.
 *
 * @param cookieString - A `name=value; name=value` string (e.g. `document.cookie`).
 * @param name - The cookie name to look up.
 * @returns The raw (still URL-encoded) value — an empty string if the cookie is
 *   present but has no value — or `undefined` when the cookie is absent.
 */
export function readCookie(cookieString: string, name: string): string | undefined {
  for (const part of cookieString.split(';')) {
    const separator = part.indexOf('=');
    if (separator === -1) continue;
    if (part.slice(0, separator).trim() === name) return part.slice(separator + 1);
  }
  return undefined;
}
