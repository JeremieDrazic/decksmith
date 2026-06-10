import React from 'react';
import { useInteraction } from './interaction.js';

const SIZES = {
  sm: { height: 32, padding: '0 12px', fontSize: 'var(--text-sm)', gap: 6 },
  md: { height: 40, padding: '0 16px', fontSize: 'var(--text-sm)', gap: 8 },
  lg: { height: 48, padding: '0 22px', fontSize: 'var(--text-base)', gap: 8 },
};

function variantStyle(variant, { hover, pressed }) {
  switch (variant) {
    case 'secondary':
      return {
        background: hover ? 'var(--surface-hover)' : 'var(--surface-raised)',
        color: 'var(--text)',
        border: '1px solid var(--border)',
      };
    case 'ghost':
      return {
        background: hover ? 'var(--surface-hover)' : 'transparent',
        color: 'var(--text-muted)',
        border: '1px solid transparent',
      };
    case 'destructive':
      return {
        background: hover ? 'var(--error)' : 'var(--error-subtle)',
        color: hover ? '#fff' : 'var(--error-text)',
        border: '1px solid var(--error)',
      };
    case 'primary':
    default:
      return {
        background: hover ? 'var(--accent-hover)' : 'var(--accent)',
        color: 'var(--on-accent)',
        border: '1px solid transparent',
        boxShadow: hover ? 'var(--shadow-accent)' : 'none',
      };
  }
}

/**
 * Button — the primary action control. Variants: primary (accent), secondary,
 * ghost, destructive. Sizes sm / md / lg. Optional leading/trailing icon.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  iconLeft,
  iconRight,
  fullWidth = false,
  style,
  children,
  ...rest
}) {
  const { hover, pressed, focus, handlers } = useInteraction();
  const sz = SIZES[size] || SIZES.md;
  const v = variantStyle(variant, { hover: hover && !disabled, pressed });

  return (
    <button
      type="button"
      disabled={disabled}
      {...handlers}
      style={{
        display: fullWidth ? 'flex' : 'inline-flex',
        width: fullWidth ? '100%' : undefined,
        alignItems: 'center',
        justifyContent: 'center',
        gap: sz.gap,
        height: sz.height,
        padding: sz.padding,
        fontFamily: 'var(--font-display)',
        fontWeight: 600,
        fontSize: sz.fontSize,
        lineHeight: 1,
        whiteSpace: 'nowrap',
        borderRadius: 'var(--radius-interactive)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        transform: pressed && !disabled ? 'translateY(1px)' : 'none',
        transition:
          'background var(--duration-fast) var(--ease-out), box-shadow var(--duration-normal) var(--ease-out), transform var(--duration-instant) var(--ease-out)',
        outline: focus ? '2px solid var(--border-focus)' : 'none',
        outlineOffset: 2,
        ...v,
        ...style,
      }}
      {...rest}
    >
      {iconLeft}
      {children}
      {iconRight}
    </button>
  );
}
