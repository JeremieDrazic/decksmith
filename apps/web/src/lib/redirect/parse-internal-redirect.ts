/**
 * Validate a `redirectTo` search param, returning it only if it is a safe
 * INTERNAL path — otherwise `undefined`.
 *
 * A safe path starts with a single `/` that is NOT followed by another `/` or a
 * `\`. This rejects protocol-relative URLs (`//evil.com`) and backslash tricks
 * (`/\evil.com`) that browsers can resolve to an external origin — the classic
 * open-redirect vector. Absolute URLs (`https://…`) and non-strings are rejected too.
 *
 * @param value - The raw search param value (unknown, from the URL)
 * @returns The value if it is a safe internal path, otherwise undefined
 */
export function parseInternalRedirect(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  return /^\/(?![/\\])/.test(value) ? value : undefined;
}
