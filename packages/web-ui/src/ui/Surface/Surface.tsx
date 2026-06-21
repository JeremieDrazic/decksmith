'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../../lib/cn';

// ─── surfaceVariants ──────────────────────────────────────────────────────────
// Exported for internal reuse by Card.tsx — NOT re-exported from Surface/index.ts
// or the package root. Keep this out of the public API.

export const surfaceVariants = cva(['relative block rounded-surface border'], {
  variants: {
    variant: {
      /**
       * Default. Sits on the page background — uses the lowest elevation token
       * (`bg-surface`) with a subtle border to read as a container without competing
       * with its siblings.
       */
      surface: 'bg-surface border-border-subtle',
      /**
       * Sits on a `bg-surface` background — uses `bg-surface-raised` and a slightly
       * more prominent border. Useful for panels nested inside a Surface or Card.
       */
      raised: 'bg-surface-raised border-border',
    },
    padding: {
      none: 'p-0',
      sm: 'p-3',
      md: 'p-5',
      lg: 'p-6',
    },
  },
  defaultVariants: {
    variant: 'surface',
    padding: 'none',
  },
});

// ─── Surface ──────────────────────────────────────────────────────────────────

export type SurfaceProps = React.ComponentProps<'div'> & VariantProps<typeof surfaceVariants>;

/**
 * Bare surface primitive: background color + 1px border + rounded corners.
 * No padding, no shadow — those belong to `Card`.
 *
 * Use `Surface` when you need a raw container that matches the design system
 * token vocabulary (`bg-surface`, `bg-surface-raised`) without any card-specific
 * visual weight. Compose content freely inside.
 *
 * @example
 * <Surface variant="raised" padding="md">
 *   <p>Nested content on a raised background.</p>
 * </Surface>
 */
export function Surface({ ref, className, variant, padding, ...props }: SurfaceProps) {
  return (
    <div
      data-slot="surface"
      ref={ref}
      className={cn(surfaceVariants({ variant, padding }), className)}
      {...props}
    />
  );
}
