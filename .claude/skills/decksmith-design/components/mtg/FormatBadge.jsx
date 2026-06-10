import React from 'react';

/**
 * FormatBadge — a printed stamp/seal for a deck's format (Commander, Modern…).
 * Intentionally crisp: 4px radius (--radius-sm), mono caps, ruled border.
 * `tone="accent"` highlights the active/primary format.
 */
export function FormatBadge({ format = 'Commander', tone = 'default', style, ...rest }) {
  const accent = tone === 'accent';
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        height: 20,
        padding: '0 8px',
        // stamp/seal — crisp printed corners, not rounded
        borderRadius: 'var(--radius-sm)',
        border: `1px solid ${accent ? 'var(--accent-border)' : 'var(--border)'}`,
        background: accent ? 'var(--accent-subtle)' : 'var(--surface-raised)',
        color: accent ? 'var(--accent-text)' : 'var(--text-muted)',
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-xs)',
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        ...style,
      }}
      {...rest}
    >
      {format}
    </span>
  );
}
