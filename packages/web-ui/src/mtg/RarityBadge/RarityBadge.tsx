import type { Rarity } from '@decksmith/domain';
import { cva } from 'class-variance-authority';

import { cn } from '../../lib/cn';

type RarityConfig = {
  fill: string;
  label: string;
};

const RARITY_MAP = {
  common: { fill: 'fill-rarity-common', label: 'Common' },
  uncommon: { fill: 'fill-rarity-uncommon', label: 'Uncommon' },
  rare: { fill: 'fill-rarity-rare', label: 'Rare' },
  mythic: { fill: 'fill-rarity-mythic', label: 'Mythic Rare' },
} satisfies Record<Rarity, RarityConfig>;

const badge = cva('inline-block flex-none', {
  variants: {
    size: {
      sm: 'size-icon-sm',
      md: 'size-icon-md',
      lg: 'size-icon-lg',
    },
  },
  defaultVariants: { size: 'md' },
});

export type RarityBadgeProps = {
  rarity: Rarity;
  size?: 'sm' | 'md' | 'lg';
  'aria-label'?: string;
  className?: string;
};

export function RarityBadge({
  rarity,
  size = 'md',
  'aria-label': ariaLabel,
  className,
}: RarityBadgeProps) {
  const cfg = RARITY_MAP[rarity];

  return (
    <svg
      role="img"
      aria-label={ariaLabel ?? cfg.label}
      viewBox="0 0 32 32"
      focusable="false"
      className={cn(badge({ size }), className)}
    >
      <polygon points="16,2 30,16 16,30 2,16" className={cfg.fill} />
    </svg>
  );
}
