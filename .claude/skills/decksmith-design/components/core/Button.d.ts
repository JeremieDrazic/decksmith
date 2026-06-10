import * as React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style. @default "primary" */
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  /** @default "md" */
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  /** Element rendered before the label (e.g. a Lucide icon). */
  iconLeft?: React.ReactNode;
  /** Element rendered after the label. */
  iconRight?: React.ReactNode;
  /** Stretch to fill the container width. */
  fullWidth?: boolean;
}

/**
 * Primary action control — accent-filled by default, with secondary, ghost
 * and destructive variants and three sizes.
 * @startingPoint section="Core" subtitle="Accent button with all variants" viewport="700x150"
 */
export function Button(props: ButtonProps): React.JSX.Element;
