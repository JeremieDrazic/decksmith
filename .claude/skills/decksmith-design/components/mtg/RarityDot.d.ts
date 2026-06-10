import * as React from 'react';

export interface RarityDotProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** @default "common" */
  rarity?: 'common' | 'uncommon' | 'rare' | 'mythic';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

/** Colored dot encoding card rarity, following the MTG set-symbol convention. */
export function RarityDot(props: RarityDotProps): React.JSX.Element;
