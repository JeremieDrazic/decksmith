/**
 * Parses a raw MTG mana cost string into an array of symbol keys.
 * @param cost - MTG mana cost notation, e.g. "{2}{W}{U/B}"
 * @returns Lowercase symbol keys, e.g. ['2', 'w', 'ub']. Unknown symbols pass through — the
 *   renderer is responsible for fallback rendering, not the parser.
 */
export function parseManaCost(cost: string): string[] {
  if (typeof cost !== 'string') return [];
  const result: string[] = [];
  for (const match of cost.matchAll(/\{([^}]+)\}/g)) {
    const sym = match[1];
    if (sym !== undefined) result.push(sym.toLowerCase().replace('/', ''));
  }
  return result;
}
