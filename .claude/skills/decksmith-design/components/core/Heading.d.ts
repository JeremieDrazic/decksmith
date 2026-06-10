import * as React from 'react';

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /** Heading level 1–6 (also picks a default size). @default 2 */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Override the size token. */
  size?: 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  weight?: 400 | 500 | 600 | 700 | 800;
  tone?: 'default' | 'muted' | 'accent';
  /** Render as a different element/component. */
  as?: any;
}

/** Display heading — encapsulates the type scale so features never use raw size tokens. */
export function Heading(props: HeadingProps): React.JSX.Element;
