/** A value that can appear in a query string, or be omitted when `undefined`. */
type QueryValue = string | number | boolean | readonly (string | number | boolean)[] | undefined;

/**
 * Serialises a flat params object into a URL query string, ready to append to a
 * path.
 *
 * - Array values are joined with commas (`colors: ['R', 'U']` → `colors=R,U`),
 *   matching a CSV-style API contract.
 * - `undefined` values and empty arrays are omitted — an absent param means
 *   "not set", never an empty match.
 * - Keys and values are percent-encoded with `encodeURIComponent` (a core
 *   ECMAScript global — no DOM/Node lib needed, so this stays isomorphic).
 *
 * Returns the suffix **including** the leading `?` (e.g. `?a=b&c=1`), or an empty
 * string when nothing is set — so callers can always write `` `${path}${qs}` ``.
 *
 * @typeParam T - The concrete params shape (inferred from the call site)
 * @param params - A flat object of scalar or array values
 * @returns `?key=value&…`, or `''` when no param is set
 */
export function toQueryString<T extends Record<string, QueryValue>>(params: T): string {
  const pairs: string[] = [];

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) {
      continue;
    }

    if (Array.isArray(value)) {
      if (value.length > 0) {
        pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(value.join(','))}`);
      }
    } else {
      pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
    }
  }

  return pairs.length > 0 ? `?${pairs.join('&')}` : '';
}
