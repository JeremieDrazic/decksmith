import * as React from 'react';

export interface StatRowProps extends React.HTMLAttributes<HTMLDivElement> {
  label: React.ReactNode;
  value: React.ReactNode;
  /** Color the value with the accent. */
  accent?: boolean;
  /** @default "between" */
  align?: 'between' | 'start';
}

/** A labeled numeric stat in JetBrains Mono for stats panels and summaries. */
export function StatRow(props: StatRowProps): React.JSX.Element;
