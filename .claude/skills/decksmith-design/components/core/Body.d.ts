import * as React from 'react';

export interface BodyProps extends React.HTMLAttributes<HTMLElement> {
  size?: 'sm' | 'base' | 'lg';
  tone?: 'default' | 'muted' | 'faint' | 'accent';
  weight?: 400 | 500 | 600 | 700;
  /** Switch to JetBrains Mono for stats, prices, counts. */
  mono?: boolean;
  as?: any;
}

/** Body copy at the encapsulated text scale; `mono` for numeric data. */
export function Body(props: BodyProps): React.JSX.Element;
