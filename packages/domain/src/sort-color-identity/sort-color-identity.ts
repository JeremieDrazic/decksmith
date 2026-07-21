import type { ColorIdentity, MtgColor } from '../mana.js';

function getOrder(color: MtgColor): number {
  switch (color) {
    case 'w': {
      return 0;
    }
    case 'u': {
      return 1;
    }
    case 'b': {
      return 2;
    }
    case 'r': {
      return 3;
    }
    case 'g': {
      return 4;
    }
    case 'c': {
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
