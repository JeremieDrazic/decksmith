import React from 'react';

/**
 * StatRow — a labeled numeric stat in JetBrains Mono. Used in stats panels,
 * collection summaries, and deck headers. `accent` colors the value.
 */
export function StatRow({ label, value, accent = false, align = 'between', style, ...rest }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: align === 'between' ? 'space-between' : 'flex-start',
        gap: 12,
        ...style,
      }}
      {...rest}
    >
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-xs)',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-base)',
          fontWeight: 600,
          color: accent ? 'var(--accent-text)' : 'var(--text)',
        }}
      >
        {value}
      </span>
    </div>
  );
}
