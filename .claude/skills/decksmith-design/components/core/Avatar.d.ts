import * as React from 'react';

export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Image URL; falls back to initials when absent. */
  src?: string;
  /** Full name — used for initials and alt text. */
  name?: string;
  /** @default "md" */
  size?: 'sm' | 'md' | 'lg';
}

/** Circular user mark — image or accent-tinted initials. */
export function Avatar(props: AvatarProps): React.JSX.Element;
