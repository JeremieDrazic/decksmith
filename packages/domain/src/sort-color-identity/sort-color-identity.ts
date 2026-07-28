import type { ColorIdentity, MtgColor } from '../mana.js';

function getOrder(color: MtgColor): number {
  switch (color) {
    case 'W': {
      return 0;
    }
    case 'U': {
      return 1;
    }
    case 'B': {
      return 2;
    }
    case 'R': {
      return 3;
    }
    case 'G': {
      return 4;
    }
    case 'C': {
      return 5;
    }
  }
}

/**
 * Sorts a color identity into canonical WUBRG order.
 * @param identity - Array of MTG colors in any order
 * @returns New array sorted W → U → B → R → G → C
 */
export function sortColorIdentity(identity: ColorIdentity): ColorIdentity {
  return [...identity].sort((a, b) => getOrder(a) - getOrder(b));
}
