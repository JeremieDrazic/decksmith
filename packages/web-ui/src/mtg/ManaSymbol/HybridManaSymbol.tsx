import { useId } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/cn';
import { MANA_PATHS } from '../ManaIcon/mana-paths';
import type { MtgColor } from '@decksmith/domain';
import type { HybridDef } from '../ManaIcon/hybrid-defs';

type HybridManaSymbolProps = {
  def: HybridDef;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const FILL: Record<MtgColor, string> = {
  w: 'fill-mtg-white',
  u: 'fill-mtg-blue',
  b: 'fill-mtg-black',
  r: 'fill-mtg-red',
  g: 'fill-mtg-green',
  c: 'fill-mtg-colorless',
};

const FILL_FG: Record<MtgColor, string> = {
  w: 'fill-mtg-white-fg',
  u: 'fill-mtg-blue-fg',
  b: 'fill-mtg-black-fg',
  r: 'fill-mtg-red-fg',
  g: 'fill-mtg-green-fg',
  c: 'fill-mtg-colorless-fg',
};

// inline-block (not inline-flex) so that size-full on the SVG child fills the pip cleanly
const pip = cva(
  'inline-block rounded-badge flex-none overflow-hidden [box-shadow:inset_0_-1px_2px_rgba(0,0,0,0.35),inset_0_1px_1px_rgba(255,255,255,0.25)]',
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

// Icon scale: 0.4 × 32 SVG units = 12.8 units wide.
// Icon center in scaled space = (16 × 0.4, 16 × 0.4) = (6.4, 6.4).
// Centroid of top-left half-circle ≈ (11, 11) → translate(11 - 6.4, 11 - 6.4)
// Centroid of bottom-right half-circle ≈ (21, 21) → translate(21 - 6.4, 21 - 6.4)
const ICON_SCALE = 0.4;
const TL_ICON = `translate(4.6, 4.6) scale(${ICON_SCALE})`;
const BR_ICON = `translate(14.6, 14.6) scale(${ICON_SCALE})`;

// Endpoints of the diagonal divider — "/" split through circle center (16,16), r=15.
// y = -x + 32 intersects the circle at these two points.
const DIV = { x1: 5.4, y1: 26.6, x2: 26.6, y2: 5.4 };

export function HybridManaSymbol({ def, size = 'md', className }: HybridManaSymbolProps) {
  const rawId = useId();
  // useId() returns strings like ":r0:" — strip non-alphanumeric chars for safe SVG IDs
  const id = rawId.replaceAll(/[^a-zA-Z0-9]/g, '');
  const tlId = `tl${id}`;
  const brId = `br${id}`;

  if (def.type === 'phyrexian') {
    return (
      <span role="img" aria-label={def.label} className={cn(pip({ size }), className)}>
        <svg viewBox="0 0 32 32" aria-hidden focusable="false" className="block size-full">
          <circle cx="16" cy="16" r="15" className={FILL[def.color]} />
          <path d={MANA_PATHS.p} className={FILL_FG[def.color]} />
        </svg>
      </span>
    );
  }

  // Split: top-left triangle = def.left color, bottom-right triangle = def.right color.
  // "/" diagonal through center clips each full circle to its half.
  const leftPath = MANA_PATHS[def.left as keyof typeof MANA_PATHS];
  const rightPath = MANA_PATHS[def.right as keyof typeof MANA_PATHS];

  return (
    <span role="img" aria-label={def.label} className={cn(pip({ size }), className)}>
      <svg viewBox="0 0 32 32" aria-hidden focusable="false" className="block size-full">
        <defs>
          {/* "/" diagonal split — upper-left ◤ and lower-right ◢ triangles */}
          <clipPath id={tlId}>
            <polygon points="0,32 0,0 32,0" />
          </clipPath>
          <clipPath id={brId}>
            <polygon points="32,0 32,32 0,32" />
          </clipPath>
        </defs>

        {/* Background halves — each full circle clipped to its triangle */}
        <circle cx="16" cy="16" r="15" clipPath={`url(#${tlId})`} className={FILL[def.left]} />
        <circle cx="16" cy="16" r="15" clipPath={`url(#${brId})`} className={FILL[def.right]} />

        {/* Diagonal divider — visible only inside the circle */}
        <line
          x1={DIV.x1}
          y1={DIV.y1}
          x2={DIV.x2}
          y2={DIV.y2}
          stroke="black"
          strokeOpacity={0.2}
          strokeWidth={0.75}
        />

        {/* Mana icons, scaled and offset to each half's centroid, clipped to their region */}
        <g clipPath={`url(#${tlId})`}>
          <g transform={TL_ICON}>
            <path d={leftPath} className={FILL_FG[def.left]} />
          </g>
        </g>
        <g clipPath={`url(#${brId})`}>
          <g transform={BR_ICON}>
            <path d={rightPath} className={FILL_FG[def.right]} />
          </g>
        </g>
      </svg>
    </span>
  );
}
