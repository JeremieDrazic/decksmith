import React from 'react';

// Symbol → background token + glyph foreground. Uses MTG color identity
// tokens (never semantic tokens) and renders the canonical mana-font glyph.
const SYMBOLS = {
  w: { bg: 'var(--mtg-white)', fg: '#1a160b', cls: 'ms-w' },
  u: { bg: 'var(--mtg-blue)', fg: '#fff', cls: 'ms-u' },
  b: { bg: 'var(--mtg-black)', fg: '#cdb8e0', cls: 'ms-b' },
  r: { bg: 'var(--mtg-red)', fg: '#fff', cls: 'ms-r' },
  g: { bg: 'var(--mtg-green)', fg: '#fff', cls: 'ms-g' },
  c: { bg: 'var(--mtg-colorless)', fg: '#1a160b', cls: 'ms-c' },
  x: { bg: 'var(--mtg-colorless)', fg: '#1a160b', cls: 'ms-x' },
};

const SIZES = { sm: 16, md: 20, lg: 26 };

/**
 * Mana — a single mana symbol rendered as the canonical mana-font glyph on a
 * WUBRG-tinted circular pill. `symbol` is one of w/u/b/r/g/c/x or a number
 * (generic mana). Never a colored circle or plain text.
 */
export function Mana({ symbol = 'c', size = 'md', style, ...rest }) {
  const key = String(symbol).toLowerCase();
  const dim = SIZES[size] || SIZES.md;
  const isNum = /^\d+$/.test(key);
  const cfg = isNum
    ? { bg: 'var(--mtg-colorless)', fg: '#1a160b', cls: 'ms-' + key }
    : SYMBOLS[key] || SYMBOLS.c;
  return (
    <span
      title={`{${String(symbol).toUpperCase()}}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: dim,
        height: dim,
        borderRadius: 'var(--radius-badge)',
        background: cfg.bg,
        color: cfg.fg,
        boxShadow: 'inset 0 -1px 2px rgba(0,0,0,0.35), inset 0 1px 1px rgba(255,255,255,0.25)',
        fontSize: dim * 0.62,
        flex: 'none',
        ...style,
      }}
      {...rest}
    >
      <i className={`ms ${cfg.cls}`} aria-hidden />
    </span>
  );
}
