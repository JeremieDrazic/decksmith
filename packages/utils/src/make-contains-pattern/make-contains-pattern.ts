/**
 * Builds a SQL `LIKE` "contains" pattern for a search term, escaping LIKE
 * wildcards so the user's input is matched literally.
 *
 * `%` and `_` are LIKE wildcards; `\` is Postgres's default escape character.
 * Escaping all three means a term like "50%" searches for the literal text
 * "50%" instead of "50" followed by anything.
 *
 * Case is the caller's concern: pass a lowercased term (and compare against
 * `lower(column)`) for a case-insensitive match.
 *
 * @param term - Raw search term (already cased as desired)
 * @returns A pattern ready to bind to a `LIKE` clause, e.g. `%bolt%`
 *
 * @example
 * makeContainsPattern('bolt') // '%bolt%'
 * makeContainsPattern('50%')  // '%50\\%%' — the % is escaped, matched literally
 */
export function makeContainsPattern(term: string): string {
  const escaped = term.replaceAll(/[\\%_]/g, String.raw`\$&`);
  return `%${escaped}%`;
}
