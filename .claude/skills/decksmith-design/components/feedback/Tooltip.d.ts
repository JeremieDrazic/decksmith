import * as React from 'react';

export interface TooltipProps {
  label: React.ReactNode;
  /** @default "top" */
  side?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactNode;
  style?: React.CSSProperties;
}

/** Wraps a trigger and shows a small label on hover/focus. */
export function Tooltip(props: TooltipProps): React.JSX.Element;
