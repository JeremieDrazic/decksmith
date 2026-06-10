import * as React from 'react';

export interface LabelProps extends React.HTMLAttributes<HTMLElement> {
  tone?: 'muted' | 'default' | 'accent';
  as?: any;
}

/** Small uppercase overline / form label at the xs scale with wide tracking. */
export function Label(props: LabelProps): React.JSX.Element;
