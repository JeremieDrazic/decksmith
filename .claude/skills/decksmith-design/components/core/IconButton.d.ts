import * as React from 'react';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** @default "ghost" */
  variant?: 'ghost' | 'secondary' | 'primary';
  /** @default "md" — use "lg" (44px) for mobile touch targets. */
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  /** Provide an accessible name for the icon-only control. */
  'aria-label': string;
}

/** Square, icon-only button. Always pass an aria-label. */
export function IconButton(props: IconButtonProps): React.JSX.Element;
