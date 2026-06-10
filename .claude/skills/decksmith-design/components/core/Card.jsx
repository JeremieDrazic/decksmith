import React from 'react';

/**
 * Card — the foundational surface. Subtle inner highlight + border give it
 * tactile depth; on hover it lifts with an amber/violet accent glow.
 * Set `interactive` for the hover treatment (decks, list rows, tiles).
 */
export function Card({
  interactive = false,
  padding = 'var(--space-5)',
  style,
  children,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const lift = interactive && hover;
  return (
    <div
      onMouseEnter={() => interactive && setHover(true)}
      onMouseLeave={() => interactive && setHover(false)}
      style={{
        position: 'relative',
        background: 'var(--surface)',
        border: `1px solid ${lift ? 'var(--accent-border)' : 'var(--border-subtle)'}`,
        borderRadius: 'var(--radius-surface)',
        padding,
        boxShadow: lift
          ? 'var(--shadow-card), var(--shadow-accent), var(--shadow-inset)'
          : 'var(--shadow-card), var(--shadow-inset)',
        transform: lift ? 'translateY(-2px)' : 'none',
        transition:
          'transform var(--duration-normal) var(--ease-out), box-shadow var(--duration-normal) var(--ease-out), border-color var(--duration-normal) var(--ease-out)',
        cursor: interactive ? 'pointer' : 'default',
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
