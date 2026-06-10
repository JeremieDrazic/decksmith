import React from 'react';

/**
 * Tooltip — wraps a trigger and shows a small label on hover/focus.
 * `side` positions the bubble (top/bottom/left/right).
 */
export function Tooltip({ label, side = 'top', children, style }) {
  const [show, setShow] = React.useState(false);
  const pos = {
    top: { bottom: '100%', left: '50%', transform: 'translateX(-50%) translateY(-6px)' },
    bottom: { top: '100%', left: '50%', transform: 'translateX(-50%) translateY(6px)' },
    left: { right: '100%', top: '50%', transform: 'translateY(-50%) translateX(-6px)' },
    right: { left: '100%', top: '50%', transform: 'translateY(-50%) translateX(6px)' },
  }[side];
  return (
    <span
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      {children}
      {show && (
        <span
          role="tooltip"
          style={{
            position: 'absolute',
            ...pos,
            zIndex: 'var(--z-tooltip)',
            padding: '6px 9px',
            background: 'var(--surface-raised)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-surface)',
            boxShadow: 'var(--shadow-md)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-xs)',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            ...style,
          }}
        >
          {label}
        </span>
      )}
    </span>
  );
}
