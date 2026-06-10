import React from 'react';
import { Mana } from './Mana.jsx';

const ORDER = ['w', 'u', 'b', 'r', 'g'];

/**
 * ColorIdentity — a deck's WUBRG color identity as an ordered row of mana
 * pips. Pass `colors` as a string ("wubrg") or array; only present colors
 * are shown, always in canonical WUBRG order.
 */
export function ColorIdentity({ colors = '', size = 'sm', style, ...rest }) {
  const set = new Set(
    (Array.isArray(colors) ? colors : colors.split('')).map((c) => String(c).toLowerCase())
  );
  const present = ORDER.filter((c) => set.has(c));
  const list = present.length ? present : ['c'];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, ...style }} {...rest}>
      {list.map((c) => (
        <Mana key={c} symbol={c} size={size} />
      ))}
    </span>
  );
}
