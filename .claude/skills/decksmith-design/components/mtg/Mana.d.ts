import * as React from 'react';

export interface ManaProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** w/u/b/r/g/c/x or a number (generic mana). */
  symbol?: string | number;
  /** @default "md" */
  size?: 'sm' | 'md' | 'lg';
}

/** A single mana symbol — canonical mana-font glyph on a WUBRG-tinted pill. Never a colored circle. */
export function Mana(props: ManaProps): React.JSX.Element;
