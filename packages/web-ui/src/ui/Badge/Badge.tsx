import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../../lib/cn';

const badgeVariants = cva(
  [
    'inline-flex w-fit items-center gap-1.5',
    'rounded-badge border',
    'font-mono font-semibold whitespace-nowrap',
    'leading-none',
  ],
  {
    variants: {
      tone: {
        default: 'bg-surface-raised text-text-muted border-border',
        accent: 'bg-accent-subtle text-accent-text border-accent-border',
        success: 'bg-success-subtle text-success-text border-transparent',
        warning: 'bg-warning-subtle text-warning-text border-transparent',
        error: 'bg-error-subtle text-error-text border-transparent',
        info: 'bg-info-subtle text-info-text border-transparent',
      },
      size: {
        sm: 'h-5 px-2 text-[10px] [&_svg:not([class*="size-"])]:size-3',
        md: 'h-6 px-2.5 text-xs [&_svg:not([class*="size-"])]:size-3.5',
      },
    },
    defaultVariants: {
      tone: 'default',
      size: 'md',
    },
  }
);

export type BadgeProps = React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & {
    /** Leading status dot — same color as the text. */
    dot?: boolean;
  };

/**
 * Compact read-only label for system status, counts, and metadata.
 * For MTG color identity use ColorIdentity. For user-created labels use Tag.
 *
 * @example
 * <Badge tone="success" dot>Synced</Badge>
 * <Badge tone="warning">3 missing</Badge>
 */
export function Badge({ className, tone, size, dot, children, ...props }: BadgeProps) {
  return (
    <span data-slot="badge" className={cn(badgeVariants({ tone, size }), className)} {...props}>
      {dot ? (
        <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-current" />
      ) : null}
      {children}
    </span>
  );
}
