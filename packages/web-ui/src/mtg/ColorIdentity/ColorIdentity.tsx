import { getColorIdentityName, sortColorIdentity } from '@decksmith/domain';
import type { ColorIdentity as ColorIdentityType } from '@decksmith/domain';
import { cn } from '../../lib/cn';
import { ManaSymbol } from '../ManaSymbol/ManaSymbol';

export type ColorIdentityProps = {
  identity: ColorIdentityType;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

export function ColorIdentity({ identity, size = 'md', className }: ColorIdentityProps) {
  const sorted = sortColorIdentity(identity);
  const name = getColorIdentityName(identity);

  if (sorted.length === 0) return null;

  return (
    <span
      role="img"
      aria-label={name}
      className={cn('inline-flex items-center gap-0.5', className)}
    >
      {sorted.map((color) => (
        <ManaSymbol key={color} symbol={color} size={size} />
      ))}
    </span>
  );
}
