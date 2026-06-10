import * as React from 'react';

export interface FormatBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** e.g. "Commander", "Modern", "Standard". */
  format?: string;
  /** "accent" highlights the active/primary format. */
  tone?: 'default' | 'accent';
}

/** Printed stamp/seal for a deck format — crisp 4px corners, mono caps. */
export function FormatBadge(props: FormatBadgeProps): React.JSX.Element;
