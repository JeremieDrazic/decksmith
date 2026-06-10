import React from 'react';

/**
 * Label — small uppercase overline / form label. Encapsulates the xs scale
 * with wide tracking used for metadata, field labels, and section eyebrows.
 */
export function Label({ tone = 'muted', as = 'span', style, children, ...rest }) {
  const Tag = as;
  const color =
    tone === 'accent'
      ? 'var(--accent-text)'
      : tone === 'default'
        ? 'var(--text)'
        : 'var(--text-muted)';
  return (
    <Tag
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-xs)',
        lineHeight: 'var(--leading-xs)',
        fontWeight: 600,
        letterSpacing: 'var(--tracking-wide)',
        textTransform: 'uppercase',
        color,
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
