import * as React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Enable hover lift + accent glow (decks, tiles, list rows). */
  interactive?: boolean;
  /** CSS padding value. @default "var(--space-5)" */
  padding?: string;
}

/**
 * Foundational surface with tactile depth — inner highlight, border, and an
 * accent glow on hover when interactive.
 * @startingPoint section="Core" subtitle="Surface card with hover glow" viewport="700x220"
 */
export function Card(props: CardProps): React.JSX.Element;
