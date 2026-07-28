/**
 * Lowercase color key for the mana-symbol RENDERER — indexes MANA_PATHS (SVG glyphs) and the
 * FILL/FILL_FG class maps. Deliberately distinct from domain `MtgColor` (uppercase card color
 * IDENTITY): this is a presentation glyph key, not identity data, so it stays lowercase alongside
 * the other lowercase mana-symbol keys ('x', 'wp', '2w', …) that `parseManaCost` produces.
 */
export type ManaGlyphColor = 'w' | 'u' | 'b' | 'r' | 'g' | 'c';

export type SplitDef = {
  type: 'split';
  left: ManaGlyphColor;
  right: ManaGlyphColor;
  label: string;
};

export type PhyrexianDef = {
  type: 'phyrexian';
  color: ManaGlyphColor;
  label: string;
};

export type HybridDef = SplitDef | PhyrexianDef;

// Hybrid mana symbol definitions.
// 'split' covers both two-color ({W/U}) and 2-generic ({2/W}) hybrids —
// the generic side is represented as 'c' (colorless), keeping the type space minimal.
export const HYBRID_DEFS = {
  // Two-color hybrid — allied pairs
  wu: { type: 'split', left: 'w', right: 'u', label: '{W/U}' },
  ub: { type: 'split', left: 'u', right: 'b', label: '{U/B}' },
  br: { type: 'split', left: 'b', right: 'r', label: '{B/R}' },
  rg: { type: 'split', left: 'r', right: 'g', label: '{R/G}' },
  gw: { type: 'split', left: 'g', right: 'w', label: '{G/W}' },
  // Two-color hybrid — enemy pairs
  wb: { type: 'split', left: 'w', right: 'b', label: '{W/B}' },
  ur: { type: 'split', left: 'u', right: 'r', label: '{U/R}' },
  bg: { type: 'split', left: 'b', right: 'g', label: '{B/G}' },
  rw: { type: 'split', left: 'r', right: 'w', label: '{R/W}' },
  gu: { type: 'split', left: 'g', right: 'u', label: '{G/U}' },
  // 2-generic hybrid — colorless left, color right
  '2w': { type: 'split', left: 'c', right: 'w', label: '{2/W}' },
  '2u': { type: 'split', left: 'c', right: 'u', label: '{2/U}' },
  '2b': { type: 'split', left: 'c', right: 'b', label: '{2/B}' },
  '2r': { type: 'split', left: 'c', right: 'r', label: '{2/R}' },
  '2g': { type: 'split', left: 'c', right: 'g', label: '{2/G}' },
  // Phyrexian mana
  wp: { type: 'phyrexian', color: 'w', label: '{W/P}' },
  up: { type: 'phyrexian', color: 'u', label: '{U/P}' },
  bp: { type: 'phyrexian', color: 'b', label: '{B/P}' },
  rp: { type: 'phyrexian', color: 'r', label: '{R/P}' },
  gp: { type: 'phyrexian', color: 'g', label: '{G/P}' },
  cp: { type: 'phyrexian', color: 'c', label: '{C/P}' },
} as const satisfies Record<string, HybridDef>;

export type HybridSym = keyof typeof HYBRID_DEFS;
