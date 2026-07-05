import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../../lib/cn';

// ─── skeletonVariants ─────────────────────────────────────────────────────────

const skeletonVariants = cva('block bg-border-subtle motion-safe:animate-pulse', {
  variants: {
    /**
     * Shape controls border-radius only — aligned with the DS radius role vocabulary.
     * Dimension (width/height) always comes from the caller via `className`.
     */
    shape: {
      /** Inline text placeholder — adds a default height of 1rem. Width via className. */
      text: 'rounded-badge h-4',
      /** Control placeholder (input, button, checkbox, toggle). Size via className. */
      control: 'rounded-interactive',
      /** Block placeholder (card, panel, image). Default shape. */
      block: 'rounded-surface',
      /** Circle placeholder (avatar, radio, pip). Pass a square size via className. */
      circle: 'rounded-badge',
    },
  },
  defaultVariants: { shape: 'block' },
});

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export type SkeletonProps = React.ComponentProps<'div'> & VariantProps<typeof skeletonVariants>;

/**
 * Loading placeholder — a pulsing block that mimics content shape while data is loading.
 *
 * Compose multiple `Skeleton` elements to match your layout. Specific assemblies
 * (e.g. `AuthSkeleton`) belong colocated to their screen — not in the design system.
 *
 * Hidden from assistive technology (`aria-hidden`). Announce loading state on the
 * parent container via `aria-busy` or `aria-label`.
 *
 * The pulse animation is suppressed automatically under `prefers-reduced-motion`.
 *
 * @example
 * // Text line
 * <Skeleton shape="text" className="w-48" />
 *
 * @example
 * // Card placeholder
 * <div aria-busy="true" aria-label="Loading card">
 *   <Skeleton className="h-40 w-full" />
 * </div>
 *
 * @example
 * // Avatar
 * <Skeleton shape="circle" className="size-10" />
 */
export function Skeleton({ ref, className, shape, ...props }: SkeletonProps) {
  return (
    <div
      ref={ref}
      data-slot="skeleton"
      aria-hidden="true"
      className={cn(skeletonVariants({ shape }), className)}
      {...props}
    />
  );
}
