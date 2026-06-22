import { cn } from '../../lib/cn';
import { MANA_PATHS, MANA_VIEWBOXES } from './mana-paths';

export type ManaIconProps = {
  /** MTG symbol key: w/u/b/r/g/c/x/s/e/p/tap/untap, generic number 0–20, or special (half/y/z).
   *  Hybrid symbols belong to ManaSymbol — ManaIcon handles single-path icons only. */
  symbol: string | number;
  /** Size in pixels — rendered as a square SVG */
  size?: number;
  className?: string;
};

export function ManaIcon({ symbol, size = 20, className }: ManaIconProps) {
  const key = String(symbol).toLowerCase();
  const path = MANA_PATHS[key as keyof typeof MANA_PATHS];

  if (path === undefined) return null;

  const viewBox = MANA_VIEWBOXES[key] ?? '0 0 32 32';

  return (
    <svg
      viewBox={viewBox}
      width={size}
      height={size}
      aria-hidden
      focusable="false"
      className={cn('inline-block flex-none', className)}
    >
      <path fill="currentColor" d={path} />
    </svg>
  );
}
