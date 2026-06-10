import React from 'react';

// Rarity → set-symbol color. Common grey, uncommon silver, rare gold, mythic orange.
const RARITY = {
  common: { color: '#9aa3ab', label: 'Common' },
  uncommon: { color: '#c8cdd4', label: 'Uncommon' },
  rare: { color: 'var(--brand)', label: 'Rare' },
  mythic: { color: '#e0701f', label: 'Mythic' },
};

const SIZES = { sm: 9, md: 11, lg: 13 };

/**
 * RarityDot — a colored dot encoding card rarity (common/uncommon/rare/mythic),
 * optionally with its label. Color follows the MTG set-symbol convention.
 */
export function RarityDot({ rarity = 'common', size = 'md', showLabel = false, style, ...rest }) {
  const r = RARITY[rarity] || RARITY.common;
  const dim = SIZES[size] || SIZES.md;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, ...style }} {...rest}>
      <span
        style={{
          width: dim,
          height: dim,
          borderRadius: 'var(--radius-badge)',
          background: r.color,
          boxShadow: 'inset 0 -1px 1px rgba(0,0,0,0.3)',
          flex: 'none',
        }}
      />
      {showLabel && (
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            color: 'var(--text-muted)',
          }}
        >
          {r.label}
        </span>
      )}
    </span>
  );
}
