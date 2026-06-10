import React from 'react';
import { useInteraction } from './interaction.js';

const SIZES = { sm: 32, md: 40, lg: 44 };

/**
 * IconButton — square, icon-only control. Same variants as Button. Always
 * pass an `aria-label`. Default size hits the 44px touch target at `lg`.
 */
export function IconButton({
  variant = 'ghost',
  size = 'md',
  disabled = false,
  style,
  children,
  ...rest
}) {
  const { hover, pressed, focus, handlers } = useInteraction();
  const dim = SIZES[size] || SIZES.md;
  const active = hover && !disabled;

  const variants = {
    ghost: {
      background: active ? 'var(--surface-hover)' : 'transparent',
      color: 'var(--text-muted)',
      border: '1px solid transparent',
    },
    secondary: {
      background: active ? 'var(--surface-hover)' : 'var(--surface-raised)',
      color: 'var(--text)',
      border: '1px solid var(--border)',
    },
    primary: {
      background: active ? 'var(--accent-hover)' : 'var(--accent)',
      color: 'var(--on-accent)',
      border: '1px solid transparent',
    },
  };

  return (
    <button
      type="button"
      disabled={disabled}
      {...handlers}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: dim,
        height: dim,
        borderRadius: 'var(--radius-interactive)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        transform: pressed && !disabled ? 'translateY(1px)' : 'none',
        transition: 'background var(--duration-fast) var(--ease-out)',
        outline: focus ? '2px solid var(--border-focus)' : 'none',
        outlineOffset: 2,
        ...(variants[variant] || variants.ghost),
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
