import React from 'react';

const SIZES = { sm: 28, md: 36, lg: 44 };

/**
 * Avatar — circular user mark. Renders an image when `src` is set, otherwise
 * initials on an accent-tinted background.
 */
export function Avatar({ src, name = '', size = 'md', style, ...rest }) {
  const dim = SIZES[size] || SIZES.md;
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: dim,
        height: dim,
        borderRadius: 'var(--radius-badge)',
        background: src ? 'var(--surface-raised)' : 'var(--accent-subtle)',
        border: '1px solid var(--accent-border)',
        color: 'var(--accent-text)',
        fontFamily: 'var(--font-display)',
        fontWeight: 600,
        fontSize: dim * 0.38,
        overflow: 'hidden',
        flex: 'none',
        ...style,
      }}
      {...rest}
    >
      {src ? (
        <img src={src} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        initials || '?'
      )}
    </span>
  );
}
