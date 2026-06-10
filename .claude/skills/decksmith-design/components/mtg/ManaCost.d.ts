import * as React from 'react';

export interface ManaCostProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Cost in MTG notation ("{2}{U}{B}") or an array of symbols. */
  cost?: string | Array<string | number>;
  size?: 'sm' | 'md' | 'lg';
  gap?: number;
}

/** A sequence of mana symbols rendered from a cost string or array. */
export function ManaCost(props: ManaCostProps): React.JSX.Element;
