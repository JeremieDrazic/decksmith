import * as React from 'react';

export interface ManaCurveBucket {
  /** Bucket label, e.g. "0", "1" … "6+". */
  cmc: string;
  count: number;
  /** MTG color token to fill the bar: w/u/b/r/g/c/multi. Defaults to accent. */
  color?: 'w' | 'u' | 'b' | 'r' | 'g' | 'c' | 'multi';
}

export interface ManaCurveProps extends React.HTMLAttributes<HTMLDivElement> {
  data?: ManaCurveBucket[];
  height?: number;
}

/** Vertical bar chart of card counts by converted mana cost, WUBRG-colored. */
export function ManaCurve(props: ManaCurveProps): React.JSX.Element;
