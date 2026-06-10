import * as React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** @default "default" */
  tone?: 'default' | 'accent' | 'success' | 'warning' | 'error' | 'info';
  /** Show a leading status dot. */
  dot?: boolean;
}

/** Compact status/metadata pill. For MTG color identity use the WUBRG components instead. */
export function Badge(props: BadgeProps): React.JSX.Element;
