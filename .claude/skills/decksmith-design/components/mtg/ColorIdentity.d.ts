import * as React from 'react';

export interface ColorIdentityProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Colors as "wubrg" string or array; rendered in canonical WUBRG order. */
  colors?: string | string[];
  size?: 'sm' | 'md' | 'lg';
}

/** A deck's WUBRG color identity as an ordered row of mana pips. */
export function ColorIdentity(props: ColorIdentityProps): React.JSX.Element;
