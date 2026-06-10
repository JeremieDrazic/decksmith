import React from 'react';
import { ColorIdentity } from './ColorIdentity.jsx';
import { FormatBadge } from './FormatBadge.jsx';
import { CoverageStamp } from './CoverageStamp.jsx';
import { artGradient } from './artGradient.js';

/**
 * DeckCard — the signature deck tile (MTG Arena style): commander artwork as a
 * blurred background under a dark gradient, with deck name, format stamp, WUBRG
 * color identity, card count, collection coverage, and price. Pass `art` for
 * real commander artwork; otherwise a color-identity gradient stands in.
 */
export function DeckCard({
  name = 'Untitled Deck',
  commander = '',
  format = 'Commander',
  colors = '',
  count = 0,
  coverage,
  price,
  art,
  updated,
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
        borderRadius: 'var(--radius-surface)',
        overflow: 'hidden',
        border: `1px solid ${hover ? 'var(--accent-border)' : 'var(--border-subtle)'}`,
        minHeight: 188,
        boxShadow: hover ? 'var(--shadow-lg), var(--shadow-accent)' : 'var(--shadow-md)',
        transform: hover ? 'translateY(-3px)' : 'none',
        transition:
          'transform var(--duration-normal) var(--ease-out), box-shadow var(--duration-normal) var(--ease-out), border-color var(--duration-normal) var(--ease-out)',
        cursor: 'pointer',
        ...style,
      }}
      {...rest}
    >
      {/* blurred commander art background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: art ? `center 25%/cover url(${art})` : artGradient(colors),
          filter: 'blur(2px) saturate(1.1)',
          transform: hover ? 'scale(1.08)' : 'scale(1.04)',
          transition: 'transform var(--duration-story) var(--ease-out)',
        }}
      />
      {/* grain + dark gradient overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'var(--ds-grain)',
          opacity: 0.05,
          mixBlendMode: 'overlay',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(to top, rgba(15,14,23,0.95) 6%, rgba(15,14,23,0.62) 46%, rgba(15,14,23,0.25) 100%)',
        }}
      />
      {/* content */}
      <div
        style={{
          position: 'relative',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 16,
          minHeight: 188,
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <FormatBadge format={format} tone="accent" />
          {typeof coverage === 'number' && <CoverageStamp percent={coverage} />}
        </div>
        <div>
          <ColorIdentity colors={colors} size="sm" style={{ marginBottom: 8 }} />
          <h3
            style={{
              margin: 0,
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 'var(--text-xl)',
              color: '#f5f3fb',
              letterSpacing: '-0.01em',
              textShadow: '0 1px 4px rgba(0,0,0,0.6)',
            }}
          >
            {name}
          </h3>
          {commander && (
            <p
              style={{
                margin: '2px 0 10px',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
                color: 'rgba(232,228,245,0.7)',
              }}
            >
              {commander}
            </p>
          )}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              color: 'rgba(232,228,245,0.85)',
            }}
          >
            <span>{count} cards</span>
            {price != null && <span style={{ color: 'var(--brand)' }}>{price}</span>}
            {updated && <span style={{ color: 'rgba(232,228,245,0.5)' }}>{updated}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
