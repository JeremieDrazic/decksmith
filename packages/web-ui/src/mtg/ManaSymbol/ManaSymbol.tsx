import { cva } from 'class-variance-authority';
import { cn } from '../../lib/cn';
import { ManaIcon } from '../ManaIcon/ManaIcon';
import { HYBRID_DEFS } from '../ManaIcon/hybrid-defs';
import { HybridManaSymbol } from './HybridManaSymbol';

export type ManaSymbolProps = {
  /** MTG symbol: w/u/b/r/g/c/x, hybrid (wu/br/wp…), generic number (0–20),
   *  or special (s/e/tap/untap/half) */
  symbol: string | number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

type SymbolConfig = {
  bg: string;
  text: string;
  label: string;
};

// satisfies preserves literal object type — .c is SymbolConfig, not SymbolConfig | undefined
const SYMBOL_MAP = {
  w: { bg: 'bg-mtg-white', text: 'text-mtg-white-fg', label: 'White' },
  u: { bg: 'bg-mtg-blue', text: 'text-mtg-blue-fg', label: 'Blue' },
  b: { bg: 'bg-mtg-black', text: 'text-mtg-black-fg', label: 'Black' },
  r: { bg: 'bg-mtg-red', text: 'text-mtg-red-fg', label: 'Red' },
  g: { bg: 'bg-mtg-green', text: 'text-mtg-green-fg', label: 'Green' },
  c: { bg: 'bg-mtg-colorless', text: 'text-mtg-colorless-fg', label: 'Colorless' },
  x: { bg: 'bg-mtg-colorless', text: 'text-mtg-colorless-fg', label: 'X' },
  multi: { bg: 'bg-mtg-multi', text: 'text-mtg-multi-fg', label: 'Multicolor' },
} satisfies Record<string, SymbolConfig>;

// Icon sizes (px) — intentionally smaller than the pip so the colored background shows
const ICON_SIZES = { sm: 10, md: 13, lg: 17 } as const;

const pip = cva(
  'inline-flex items-center justify-center rounded-badge flex-none overflow-hidden [box-shadow:inset_0_-1px_2px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.25)]',
  {
    variants: {
      size: {
        sm: 'size-4',
        md: 'size-5',
        lg: 'size-[1.625rem]',
      },
    },
    defaultVariants: { size: 'md' },
  }
);

export function ManaSymbol({ symbol, size = 'md', className }: ManaSymbolProps) {
  const key = String(symbol).toLowerCase();

  const hybridDef = HYBRID_DEFS[key as keyof typeof HYBRID_DEFS];
  if (hybridDef !== undefined) {
    return <HybridManaSymbol def={hybridDef} size={size} className={className} />;
  }

  const isGeneric = /^\d+$/.test(key);
  const cfg: SymbolConfig = isGeneric
    ? { bg: 'bg-mtg-colorless', text: 'text-mtg-colorless-fg', label: `${key} generic mana` }
    : (SYMBOL_MAP[key as keyof typeof SYMBOL_MAP] ?? SYMBOL_MAP.c);

  return (
    <span
      role="img"
      aria-label={isGeneric ? cfg.label : `{${key.toUpperCase()}}`}
      className={cn(pip({ size }), cfg.bg, cfg.text, className)}
    >
      <ManaIcon symbol={key} size={ICON_SIZES[size]} />
    </span>
  );
}
