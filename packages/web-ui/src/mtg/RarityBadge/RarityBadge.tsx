import type { Rarity } from '@decksmith/domain';
import { cva } from 'class-variance-authority';

import { cn } from '../../lib/cn';
import { ICON_SIZE } from '../../lib/sizing/icon-size';

type RarityConfig = {
  fill: string;
  label: string;
};

const RARITY_MAP = {
  common: { fill: 'fill-rarity-common', label: 'Common' },
  uncommon: { fill: 'fill-rarity-uncommon', label: 'Uncommon' },
  rare: { fill: 'fill-rarity-rare', label: 'Rare' },
  special: { fill: 'fill-rarity-special', label: 'Special' },
  mythic: { fill: 'fill-rarity-mythic', label: 'Mythic Rare' },
  bonus: { fill: 'fill-rarity-bonus', label: 'Bonus' },
} satisfies Record<Rarity, RarityConfig>;

const badge = cva('inline-block flex-none', {
  variants: {
    size: {
      sm: ICON_SIZE.sm,
      md: ICON_SIZE.md,
      lg: ICON_SIZE.lg,
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
