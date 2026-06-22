import type { ColorIdentity, MtgColor } from '../colors';

const WUBRG_ORDER: Record<MtgColor, number> = {
  w: 0,
  u: 1,
  b: 2,
  r: 3,
  g: 4,
  c: 5,
};

/**
 * Sorts a color identity into canonical WUBRG order.
 * @param identity - Array of MTG colors in any order
 * @returns New array sorted W → U → B → R → G → C
 */
export function sortColorIdentity(identity: ColorIdentity): ColorIdentity {
  return [...identity].sort((a, b) => WUBRG_ORDER[a] - WUBRG_ORDER[b]);
}
