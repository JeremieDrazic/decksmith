import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../../lib/cn';

const tagVariants = cva(
  [
    'inline-flex w-fit items-center gap-1',
    'rounded-badge border',
    'font-mono font-medium whitespace-nowrap',
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
        sm: 'h-5 pl-2 pr-1 text-[10px]',
        md: 'h-6 pl-2.5 pr-1.5 text-xs',
      },
    },
    defaultVariants: {
      tone: 'default',
      size: 'md',
    },
  }
);

type WithDismiss = {
  onDismiss: () => void;
  /**
   * Screen-reader label for the dismiss button. Provide a localised string.
   * Required when onDismiss is set — intentionally not defaulted.
   */
  dismissLabel: string;
};

type WithoutDismiss = {
  onDismiss?: never;
  dismissLabel?: never;
};

export type TagProps = React.ComponentProps<'span'> &
  VariantProps<typeof tagVariants> &
  (WithDismiss | WithoutDismiss);

function TagDismissButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        'shrink-0 rounded-full -mr-0.5',
        'opacity-60 hover:opacity-100',
        'transition-opacity duration-fast',
        'outline-none focus-visible:ring-1 focus-visible:ring-border-focus',
        '[&>svg]:size-3'
      )}
    >
      <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path
          d="M2 2l8 8M10 2l-8 8"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}

/**
 * User-created label — collection tags, deck labels, filters.
 * Dismissible via onDismiss + a localised dismissLabel.
 * For system status use Badge instead.
 *
 * @example
 * <Tag>Competitive</Tag>
 *
 * @example
 * <Tag tone="accent" onDismiss={() => removeTag(id)} dismissLabel="Remove Foil tag">
 *   Foil
 * </Tag>
 */
export function Tag({
  className,
  tone,
  size,
  onDismiss,
  dismissLabel,
  children,
  ...props
}: TagProps) {
  return (
    <span data-slot="tag" className={cn(tagVariants({ tone, size }), className)} {...props}>
      {children}
      {onDismiss ? <TagDismissButton onClick={onDismiss} label={dismissLabel} /> : null}
    </span>
  );
}
