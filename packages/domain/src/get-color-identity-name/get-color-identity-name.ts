import type { ColorIdentity } from '../mana.js';
import { sortColorIdentity } from '../sort-color-identity/index.js';

// Canonical MTG color combination names — sorted WUBRG key → lore name.
// Mono: color names. Guilds: Ravnica. Shards: Alara. Clans/Wedges: Tarkir. Nephilim: Ravnica.
// Keys are WUBRG-sorted (W=0 U=1 B=2 R=3 G=4 C=5) — always produced by sortColorIdentity.
const IDENTITY_NAMES: Record<string, string> = {
  // Colorless
  C: 'Colorless',
  // Mono
  W: 'White',
  U: 'Blue',
  B: 'Black',
  R: 'Red',
  G: 'Green',
  // Guilds (Ravnica) — ally pairs then enemy pairs
  WU: 'Azorius',
  UB: 'Dimir',
  BR: 'Rakdos',
  RG: 'Gruul',
  WG: 'Selesnya',
  WB: 'Orzhov',
  UR: 'Izzet',
  BG: 'Golgari',
  WR: 'Boros',
  UG: 'Simic',
  // Shards (Alara)
  WUB: 'Esper',
  UBR: 'Grixis',
  BRG: 'Jund',
  WRG: 'Naya',
  WUG: 'Bant',
  // Clans & Wedges (Tarkir)
  WBG: 'Abzan',
  WUR: 'Jeskai',
  UBG: 'Sultai',
  WBR: 'Mardu',
  URG: 'Temur',
  // Nephilim (Ravnica)
  WUBR: 'Yore-Tiller',
  UBRG: 'Glint-Eye',
  WBRG: 'Dune-Brood',
  WURG: 'Ink-Treader',
  WUBG: 'Witch-Maw',
  // Five-color
  WUBRG: 'Five-Color',
};

/**
 * Returns the canonical MTG name for a color identity.
 * @param identity - Array of MTG colors in any order
 * @returns Lore name (e.g. "Azorius") or the sorted key as fallback (e.g. "WUC")
 */
export function getColorIdentityName(identity: ColorIdentity): string {
  if (identity.length === 0) return 'Colorless';
  // Colors are already uppercase (MtgColor), so the joined key matches IDENTITY_NAMES directly.
  const key = sortColorIdentity(identity).join('');
  return IDENTITY_NAMES[key] ?? key;
}
