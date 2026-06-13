import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../../lib/cn';

const iconButtonVariants = cva(
  [
    // Layout — square, icon centered
    'inline-flex items-center justify-center',
    // Shape
    'rounded-interactive border border-transparent',
    // Interaction base
    'select-none cursor-pointer',
    // Positioning context for the absolute loading spinner
    'relative',
    'transition-[transform,box-shadow,background-color,border-color,color,opacity]',
    'duration-fast ease-out',
    // Focus ring
    'outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
    'focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
    'disabled:opacity-[0.38] disabled:cursor-not-allowed disabled:pointer-events-none',
  ],
  {
    variants: {
      variant: {
        primary: ['bg-accent text-on-accent', 'hover:bg-accent-hover'],
        secondary: [
          'bg-transparent text-accent-text border-accent-border',
          'hover:bg-accent-subtle',
          'active:bg-transparent',
        ],
        ghost: [
          'bg-transparent text-text-muted',
          'hover:bg-accent-subtle hover:text-text',
          'active:text-accent-text',
        ],
        destructive: ['bg-error text-on-error', 'hover:bg-error-hover'],
      },
      size: {
        xs: 'h-6 w-6',
        sm: 'h-8 w-8',
        md: 'h-9 w-9',
        lg: 'h-11 w-11',
      },
    },
    defaultVariants: {
      variant: 'ghost',
      size: 'md',
    },
  }
);

// Icon pixel size matched to button height so the icon fills ~44–50% of the surface
const iconSizeMap = {
  xs: '[&>svg]:size-3',
  sm: '[&>svg]:size-4',
  md: '[&>svg]:size-5',
  lg: '[&>svg]:size-6',
} as const;

export type IconButtonProps = Omit<React.ComponentProps<'button'>, 'aria-label' | 'children'> &
  VariantProps<typeof iconButtonVariants> & {
    /** The icon to render. Should be a single SVG element. */
    icon: React.ReactNode;
    /** Required — the only accessible name (no visible label). */
    'aria-label': string;
    /** Renders a spinner and blocks interaction without applying disabled styling. */
    isLoading?: boolean;
    /**
     * Screen-reader label announced during loading (e.g. "Saving…").
     * Defaults to the button's aria-label if not provided.
     */
    loadingLabel?: string;
  };

function IconButtonSpinner() {
  return (
    <svg
      className="motion-safe:animate-spin size-[1.1em]"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 22 6.477 22 12h-4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

/**
 * A square button containing a single icon, with no visible label.
 * Identical variants and sizes to Button; aria-label is required.
 *
 * @example
 * <IconButton icon={<PlusIcon />} aria-label="Add card" onClick={handleAdd} />
 *
 * @example
 * <IconButton
 *   variant="destructive"
 *   icon={<TrashIcon />}
 *   aria-label="Delete deck"
 *   isLoading={isPending}
 *   loadingLabel="Deleting…"
 * />
 */
export function IconButton({
  ref,
  className,
  variant,
  size = 'md',
  icon,
  'aria-label': ariaLabel,
  isLoading = false,
  loadingLabel,
  disabled,
  onClick,
  ...props
}: IconButtonProps) {
  return (
    <button
      {...props}
      data-slot="button"
      type="button"
      ref={ref}
      disabled={disabled}
      onClick={isLoading ? undefined : onClick}
      aria-busy={isLoading ? true : undefined}
      aria-label={isLoading && loadingLabel ? loadingLabel : ariaLabel}
      className={cn(
        iconButtonVariants({ variant, size }),
        isLoading && 'cursor-wait pointer-events-none',
        className
      )}
    >
      {/* visibility:hidden preserves layout while spinner is shown */}
      <span
        aria-hidden={isLoading ? true : undefined}
        className={cn(
          'inline-flex items-center justify-center',
          iconSizeMap[size ?? 'md'],
          isLoading && 'invisible'
        )}
      >
        {icon}
      </span>

      {isLoading ? (
        <span className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
          <IconButtonSpinner />
        </span>
      ) : null}
    </button>
  );
}
