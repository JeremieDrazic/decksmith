import { Loader2 } from 'lucide-react';

import { cn } from '../../lib/cn';
import { ICON_SIZE } from '../../lib/sizing/icon-size';

// ─── Spinner ──────────────────────────────────────────────────────────────────

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg';

export type SpinnerProps = {
  /** Visual size of the spinner. @default 'md' */
  size?: SpinnerSize;
  className?: string;
};

/**
 * Loading indicator — a spinning `Loader2` icon from Lucide.
 * Respects `prefers-reduced-motion` via `motion-safe:animate-spin`.
 * Hidden from the a11y tree (`aria-hidden`) — announce loading state
 * on the parent element via `aria-busy` or `aria-label`.
 *
 * @example
 * <Spinner size="sm" />
 */
export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <Loader2
      aria-hidden="true"
      className={cn('motion-safe:animate-spin', ICON_SIZE[size], className)}
    />
  );
}
