/** Single MTG color, lowercase canonical form used throughout Decksmith.
 *  Scryfall uses uppercase ("W","U"…) — normalize on ingest in packages/scryfall. */
export type MtgColor = 'w' | 'u' | 'b' | 'r' | 'g' | 'c';

/** Ordered list of colors representing a card or deck's color identity. */
export type ColorIdentity = MtgColor[];

/** Snow mana symbol {S} — distinct from colored mana, relevant for format legality. */
export type SnowMana = 's';

/** Variable generic costs: X, Y, Z. */
export type VariableMana = 'x' | 'y' | 'z';
