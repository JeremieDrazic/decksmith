import React from 'react';

const SIZES = {
  sm: { fontSize: 'var(--text-sm)', lineHeight: 'var(--leading-sm)' },
  base: { fontSize: 'var(--text-base)', lineHeight: 'var(--leading-base)' },
  lg: { fontSize: 'var(--text-lg)', lineHeight: 'var(--leading-lg)' },
};

const TONES = {
  default: 'var(--text)',
  muted: 'var(--text-muted)',
  faint: 'var(--text-faint)',
  accent: 'var(--accent-text)',
};

/**
 * Body — paragraph / inline body copy at the encapsulated text scale.
 * Use `mono` for stats, prices, counts (switches to JetBrains Mono).
 */
export function Body({
  size = 'base',
  tone = 'default',
  weight = 400,
  mono = false,
  as = 'p',
  style,
  children,
  ...rest
}) {
  const Tag = as;
  return (
    <Tag
      style={{
        margin: 0,
        fontFamily: mono ? 'var(--font-mono)' : 'var(--font-body)',
        color: TONES[tone] || TONES.default,
        fontWeight: weight,
        ...SIZES[size],
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
