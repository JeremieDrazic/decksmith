import React from 'react';

// Coverage tier → glyph + status color. Owned ≥80% green, partial amber, low red.
function tier(pct) {
  if (pct >= 80) return { glyph: '✓', color: 'var(--success-text)', bd: 'var(--success)' };
  if (pct >= 50) return { glyph: '⚠', color: 'var(--warning-text)', bd: 'var(--warning)' };
  return { glyph: '✗', color: 'var(--error-text)', bd: 'var(--error)' };
}

/**
 * CoverageStamp — collection coverage as a card-stamp: ✓ green / ⚠ amber /
 * ✗ red with the percentage. Crisp 4px stamp corners.
 */
export function CoverageStamp({ percent = 0, showPercent = true, style, ...rest }) {
  const t = tier(percent);
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        height: 20,
        padding: '0 7px',
        borderRadius: 'var(--radius-sm)', // stamp
        border: `1px solid ${t.bd}`,
        color: t.color,
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-xs)',
        fontWeight: 600,
        ...style,
      }}
      {...rest}
    >
      <span aria-hidden style={{ fontSize: '0.95em' }}>
        {t.glyph}
      </span>
      {showPercent && <span>{Math.round(percent)}%</span>}
    </span>
  );
}
