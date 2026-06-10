import * as React from 'react';

export interface CardThumbProps extends React.HTMLAttributes<HTMLDivElement> {
  name?: string;
  /** Mana cost in MTG notation ("{2}{U}{B}"). */
  cost?: string | Array<string | number>;
  /** Color identity for the placeholder gradient when `art` is absent. */
  colors?: string | string[];
  /** Real Scryfall artwork URL. */
  art?: string;
  rarity?: 'common' | 'uncommon' | 'rare' | 'mythic';
  /** Quantity owned — shows an "N×" stamp. */
  owned?: number;
  width?: number;
}

/**
 * A single MTG card tile: art, gradient overlay, name, mana cost, rarity.
 * @startingPoint section="MTG" subtitle="Card tile with art, name & mana cost" viewport="700x320"
 */
export function CardThumb(props: CardThumbProps): React.JSX.Element;
