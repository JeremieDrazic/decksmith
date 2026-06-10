import React from 'react';

const TONES = {
  default: { bg: 'var(--surface-raised)', fg: 'var(--text-muted)', bd: 'var(--border)' },
  accent: { bg: 'var(--accent-subtle)', fg: 'var(--accent-text)', bd: 'var(--accent-border)' },
  success: { bg: 'var(--success-subtle)', fg: 'var(--success-text)', bd: 'transparent' },
  warning: { bg: 'var(--warning-subtle)', fg: 'var(--warning-text)', bd: 'transparent' },
  error: { bg: 'var(--error-subtle)', fg: 'var(--error-text)', bd: 'transparent' },
  info: { bg: 'var(--info-subtle)', fg: 'var(--info-text)', bd: 'transparent' },
};

/**
 * Badge — compact status/metadata pill. Tones: default, accent, success,
 * warning, error, info. Use `dot` for a leading status dot. For MTG color
 * identity use the WUBRG components, not a badge.
 */
export function Badge({ tone = 'default', dot = false, style, children, ...rest }) {
  const t = TONES[tone] || TONES.default;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        height: 22,
        padding: '0 10px',
        borderRadius: 'var(--radius-badge)',
        background: t.bg,
        color: t.fg,
        border: `1px solid ${t.bd}`,
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-xs)',
        fontWeight: 600,
        letterSpacing: '0.02em',
        whiteSpace: 'nowrap',
        ...style,
      }}
      {...rest}
    >
      {dot && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: 'var(--radius-badge)',
            background: 'currentColor',
          }}
        />
      )}
      {children}
    </span>
  );
}
