import React from 'react';

const TONES = {
  default: { bar: 'var(--accent)', icon: '◈' },
  success: { bar: 'var(--success)', icon: '✓' },
  warning: { bar: 'var(--warning)', icon: '⚠' },
  error: { bar: 'var(--error)', icon: '✗' },
  info: { bar: 'var(--info)', icon: 'i' },
};

/**
 * Toast — a notification card with a tone accent bar, title, and optional
 * description. Compose several inside a fixed corner stack.
 */
export function Toast({ tone = 'default', title, children, onClose, style, ...rest }) {
  const t = TONES[tone] || TONES.default;
  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        gap: 12,
        width: 320,
        padding: '14px 16px 14px 16px',
        background: 'var(--surface-raised)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-surface)',
        boxShadow: 'var(--shadow-overlay)',
        overflow: 'hidden',
        ...style,
      }}
      {...rest}
    >
      <span
        style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: t.bar }}
      />
      <span
        style={{
          flex: 'none',
          width: 22,
          height: 22,
          borderRadius: 'var(--radius-badge)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: t.bar,
          color: '#0f0e17',
          fontSize: 12,
          fontWeight: 700,
        }}
      >
        {t.icon}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && (
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              fontSize: 'var(--text-sm)',
              color: 'var(--text)',
            }}
          >
            {title}
          </div>
        )}
        {children && (
          <div
            style={{
              marginTop: 2,
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-xs)',
              color: 'var(--text-muted)',
              lineHeight: 1.5,
            }}
          >
            {children}
          </div>
        )}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Dismiss"
          style={{
            flex: 'none',
            background: 'none',
            border: 'none',
            color: 'var(--text-faint)',
            cursor: 'pointer',
            fontSize: 16,
            lineHeight: 1,
            padding: 0,
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}
