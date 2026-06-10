import React from 'react';

const SIZES = {
  xs: { fontSize: 'var(--text-xs)', lineHeight: 'var(--leading-xs)' },
  sm: { fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-sm)' },
  base: { fontSize: 'var(--text-base)', lineHeight: 'var(--leading-base)' },
  lg: { fontSize: 'var(--text-lg)', lineHeight: 'var(--leading-lg)' },
  xl: { fontSize: 'var(--text-xl)', lineHeight: 'var(--leading-xl)' },
  '2xl': { fontSize: 'var(--text-2xl)', lineHeight: 'var(--leading-2xl)' },
  '3xl': { fontSize: 'var(--text-3xl)', lineHeight: 'var(--leading-3xl)' },
  '4xl': { fontSize: 'var(--text-4xl)', lineHeight: 'var(--leading-4xl)' },
};

const TONES = {
  default: 'var(--text)',
  muted: 'var(--text-muted)',
  accent: 'var(--accent-text)',
};

/**
 * Heading — encapsulates the display type scale so feature components never
 * reference raw size tokens. Renders an <h1>–<h6> (via `as`) or any element.
 */
export function Heading({
  level = 2,
  size,
  weight = 700,
  tone = 'default',
  as,
  style,
  children,
  ...rest
}) {
  const Tag = as || `h${level}`;
  const resolvedSize = size || ['4xl', '3xl', '2xl', 'xl', 'lg', 'base'][level - 1] || '2xl';
  return (
    <Tag
      style={{
        margin: 0,
        fontFamily: 'var(--font-display)',
        letterSpacing: 'var(--tracking-tight)',
        color: TONES[tone] || TONES.default,
        fontWeight: weight,
        ...SIZES[resolvedSize],
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
