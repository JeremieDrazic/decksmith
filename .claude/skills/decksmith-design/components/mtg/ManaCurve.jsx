import React from 'react';

const MTG = {
  w: 'var(--mtg-white)',
  u: 'var(--mtg-blue)',
  b: 'var(--mtg-black)',
  r: 'var(--mtg-red)',
  g: 'var(--mtg-green)',
  c: 'var(--mtg-colorless)',
  multi: 'var(--mtg-multi)',
};

/**
 * ManaCurve — vertical bar chart of card counts by converted mana cost.
 * `data` is an array of buckets: { cmc: '0'|'1'|…|'6+', count, color? }.
 * Bars are colored by their MTG `color` token (WUBRG) or the accent.
 */
export function ManaCurve({ data = [], height = 110, style, ...rest }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height, ...style }} {...rest}>
      {data.map((d, i) => {
        const h = Math.round((d.count / max) * (height - 22));
        const fill = d.color ? MTG[d.color] || 'var(--accent)' : 'var(--accent)';
        return (
          <div
            key={i}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span
              style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)' }}
            >
              {d.count}
            </span>
            <div
              style={{
                width: '100%',
                height: Math.max(h, 3),
                background: fill,
                borderRadius: '4px 4px 0 0',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18)',
                transition: 'height var(--duration-slow) var(--ease-spring)',
              }}
            />
            <span
              style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-faint)' }}
            >
              {d.cmc}
            </span>
          </div>
        );
      })}
    </div>
  );
}
