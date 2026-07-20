import type { ColorIdentity } from '../mana.js';
import { sortColorIdentity } from '../sort-color-identity/index.js';

// Canonical MTG color combination names — sorted WUBRG key → lore name.
// Mono: color names. Guilds: Ravnica. Shards: Alara. Clans/Wedges: Tarkir. Nephilim: Ravnica.
// Keys are WUBRG-sorted (W=0 U=1 B=2 R=3 G=4 C=5) — always produced by sortColorIdentity.
const IDENTITY_NAMES: Record<string, string> = {
  // Colorless
  c: 'Colorless',
  // Mono
  w: 'White',
  u: 'Blue',
  b: 'Black',
  r: 'Red',
  g: 'Green',
  // Guilds (Ravnica) — ally pairs then enemy pairs
  wu: 'Azorius',
  ub: 'Dimir',
  br: 'Rakdos',
  rg: 'Gruul',
  wg: 'Selesnya',
  wb: 'Orzhov',
  ur: 'Izzet',
  bg: 'Golgari',
  wr: 'Boros',
  ug: 'Simic',
  // Shards (Alara)
  wub: 'Esper',
  ubr: 'Grixis',
  brg: 'Jund',
  wrg: 'Naya',
  wug: 'Bant',
  // Clans & Wedges (Tarkir)
  wbg: 'Abzan',
  wur: 'Jeskai',
  ubg: 'Sultai',
  wbr: 'Mardu',
  urg: 'Temur',
  // Nephilim (Ravnica)
  wubr: 'Yore-Tiller',
  ubrg: 'Glint-Eye',
  wbrg: 'Dune-Brood',
  wurg: 'Ink-Treader',
  wubg: 'Witch-Maw',
  // Five-color
  wubrg: 'Five-Color',
};

/**
 * Returns the canonical MTG name for a color identity.
 * @param identity - Array of MTG colors in any order
 * @returns Lore name (e.g. "Azorius") or sorted uppercase key as fallback (e.g. "WUC")
 */
export function getColorIdentityName(identity: ColorIdentity): string {
  if (identity.length === 0) return 'Colorless';
  const key = sortColorIdentity(identity).join('');
  return IDENTITY_NAMES[key] ?? key.toUpperCase();
}
