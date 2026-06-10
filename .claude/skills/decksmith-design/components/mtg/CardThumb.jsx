import React from 'react';
import { ManaCost } from './ManaCost.jsx';
import { RarityDot } from './RarityDot.jsx';
import { artGradient } from './artGradient.js';

/**
 * CardThumb — a single MTG card tile: artwork, dark gradient overlay, name,
 * mana cost, and an optional rarity dot. Pass `art` for a real Scryfall image;
 * otherwise a color-identity gradient stands in.
 */
export function CardThumb({
  name = 'Unknown Card',
  cost = '',
  colors = '',
  art,
  rarity,
  owned,
  width = 150,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative',
        width,
        aspectRatio: '0.72',
        borderRadius: 'var(--radius-surface)',
        overflow: 'hidden',
        border: `1px solid ${hover ? 'var(--accent-border)' : 'var(--border)'}`,
        background: art ? `center/cover url(${art})` : artGradient(colors),
        boxShadow: hover ? 'var(--shadow-md), var(--shadow-accent)' : 'var(--shadow-sm)',
        transform: hover ? 'translateY(-2px)' : 'none',
        transition: 'all var(--duration-normal) var(--ease-out)',
        cursor: 'pointer',
        ...style,
      }}
      {...rest}
    >
      {/* grain */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'var(--ds-grain)',
          opacity: 0.04,
          mixBlendMode: 'overlay',
        }}
      />
      {/* bottom protection gradient */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(to top, rgba(15,14,23,0.92) 0%, rgba(15,14,23,0.45) 38%, transparent 62%)',
        }}
      />
      {typeof owned === 'number' && (
        <span
          style={{
            position: 'absolute',
            top: 8,
            left: 8,
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            fontWeight: 600,
            padding: '2px 6px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(15,14,23,0.7)',
            color: owned > 0 ? 'var(--success-text)' : 'var(--text-faint)',
          }}
        >
          {owned}×
        </span>
      )}
      <div style={{ position: 'absolute', left: 10, right: 10, bottom: 9 }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 5 }}>
          <ManaCost cost={cost} size="sm" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {rarity && <RarityDot rarity={rarity} size="sm" />}
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              fontSize: 'var(--text-sm)',
              color: '#f5f3fb',
              lineHeight: 1.2,
              textShadow: '0 1px 3px rgba(0,0,0,0.6)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {name}
          </span>
        </div>
      </div>
    </div>
  );
}
