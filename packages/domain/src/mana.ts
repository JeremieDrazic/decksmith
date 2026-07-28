/** Single MTG color — the card/deck COLOR IDENTITY, uppercase canonical form.
 *  Matches Scryfall and packages/schema `ColorSchema` ('W','U','B','R','G','C'), so color-identity
 *  data flows through the app in one casing end-to-end.
 *  NOTE: this is NOT a mana-symbol render key. The renderer uses its own lowercase glyph keys
 *  (`ManaGlyphColor` in packages/web-ui) — a color identity is data, a glyph key is presentation. */
export type MtgColor = 'W' | 'U' | 'B' | 'R' | 'G' | 'C';

/** Ordered list of colors representing a card or deck's color identity. */
export type ColorIdentity = MtgColor[];

/** Snow mana symbol {S} — distinct from colored mana, relevant for format legality. */
export type SnowMana = 's';

/** Variable generic costs: X, Y, Z. */
export type VariableMana = 'x' | 'y' | 'z';
