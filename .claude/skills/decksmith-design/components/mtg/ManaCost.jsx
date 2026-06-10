import React from 'react';
import { Mana } from './Mana.jsx';

/**
 * ManaCost — a sequence of mana symbols. Accepts a cost string in MTG
 * notation ("{2}{U}{B}") or an array of symbols (["2","u","b"]).
 */
export function ManaCost({ cost = '', size = 'md', gap = 2, style, ...rest }) {
  const symbols = Array.isArray(cost)
    ? cost
    : (cost.match(/\{([^}]+)\}/g) || []).map((s) => s.slice(1, -1));
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap, ...style }} {...rest}>
      {symbols.map((s, i) => (
        <Mana key={i} symbol={s} size={size} />
      ))}
    </span>
  );
}
