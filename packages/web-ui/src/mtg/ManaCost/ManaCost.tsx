import { parseManaCost } from '@decksmith/domain';
import { cn } from '../../lib/cn';
import { ManaSymbol } from '../ManaSymbol/ManaSymbol';

export type ManaCostProps = {
  /** Raw mana cost string in MTG notation, e.g. "{2}{W}{U/B}" or "{X}{G}{G}" */
  cost: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

export function ManaCost({ cost, size = 'md', className }: ManaCostProps) {
  const symbols = parseManaCost(cost);

  if (symbols.length === 0) return null;

  return (
    <span className={cn('inline-flex items-center gap-0.5', className)}>
      {symbols.map((sym, i) => (
        // Position is the semantic identity in a mana cost — same symbol can repeat ({W}{W})
        // oxlint-disable-next-line react/no-array-index-key
        <ManaSymbol key={`${sym}-${i}`} symbol={sym} size={size} />
      ))}
    </span>
  );
}
