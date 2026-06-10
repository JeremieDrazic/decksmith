import * as React from 'react';

export interface DeckCardProps extends React.HTMLAttributes<HTMLDivElement> {
  name?: string;
  /** Commander name shown under the title. */
  commander?: string;
  format?: string;
  /** WUBRG color identity ("wubrg" or array). */
  colors?: string | string[];
  count?: number;
  /** Collection coverage percent 0–100. */
  coverage?: number;
  /** Pre-formatted price string, e.g. "142 €". */
  price?: string;
  /** Real commander artwork URL; falls back to a color-identity gradient. */
  art?: string;
  /** Relative time, e.g. "2d ago". */
  updated?: string;
}

/**
 * The signature deck tile — commander art blurred under a dark gradient, with
 * format stamp, WUBRG identity, count, coverage, and price (MTG Arena style).
 * @startingPoint section="MTG" subtitle="Deck tile with commander art & coverage" viewport="700x260"
 */
export function DeckCard(props: DeckCardProps): React.JSX.Element;
