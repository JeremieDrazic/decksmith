import * as React from 'react';

export interface CoverageStampProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Owned percentage 0–100. ≥80 green ✓, ≥50 amber ⚠, else red ✗. */
  percent?: number;
  showPercent?: boolean;
}

/** Collection-coverage card stamp: ✓ / ⚠ / ✗ with percentage. */
export function CoverageStamp(props: CoverageStampProps): React.JSX.Element;
