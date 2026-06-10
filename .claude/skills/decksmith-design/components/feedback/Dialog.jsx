import React from 'react';

/**
 * Dialog — centered modal with backdrop. Controlled via `open` + `onClose`.
 * Spring-scales in on open; backdrop click and Esc close it.
 */
export function Dialog({ open, onClose, title, footer, width = 440, children, style }) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      onMouseDown={(e) => e.target === e.currentTarget && onClose && onClose()}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 'var(--z-modal)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: 'rgba(8, 7, 14, 0.62)',
        backdropFilter: 'blur(3px)',
        animation: 'dsFade var(--duration-page) var(--ease-out)',
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        style={{
          width,
          maxWidth: '100%',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-modal)',
          boxShadow: 'var(--shadow-lg)',
          animation: 'dsPop var(--duration-story) var(--ease-spring)',
          overflow: 'hidden',
          ...style,
        }}
      >
        {title && (
          <div style={{ padding: '18px 22px 0' }}>
            <h2
              style={{
                margin: 0,
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 'var(--text-xl)',
                color: 'var(--text)',
              }}
            >
              {title}
            </h2>
          </div>
        )}
        <div
          style={{
            padding: '14px 22px 20px',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            lineHeight: 'var(--leading-base)',
          }}
        >
          {children}
        </div>
        {footer && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 10,
              padding: '14px 22px',
              borderTop: '1px solid var(--border-subtle)',
              background: 'var(--surface-raised)',
            }}
          >
            {footer}
          </div>
        )}
      </div>
      <style>{`@keyframes dsFade{from{opacity:0}to{opacity:1}}@keyframes dsPop{from{opacity:0;transform:scale(0.94)}to{opacity:1;transform:scale(1)}}`}</style>
    </div>
  );
}
