import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../../lib/cn';

/**
 * CVA variants factory — exported so consumers can apply button styles to
 * arbitrary elements (e.g. <a className={buttonVariants({ variant: 'primary' })} href="…">)
 * without needing an asChild slot.
 */
export const buttonVariants = cva(
  [
    // Layout
    'inline-flex items-center justify-center whitespace-nowrap',
    // Shape
    'rounded-interactive border border-transparent',
    // Typography
    'font-display font-semibold',
    // Interaction base
    'select-none cursor-pointer',
    // Positioning context for the absolute loading spinner
    'relative',
    // Explicit property list — avoids animating layout/paint properties unintentionally
    'transition-[transform,box-shadow,background-color,border-color,color,opacity]',
    'duration-fast ease-out',
    // Focus ring — border-focus token flips amber (dark) / violet (light)
    'outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
    'focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
    // pointer-events-none prevents hover styles from firing while disabled
    'disabled:opacity-[0.38] disabled:cursor-not-allowed disabled:pointer-events-none',
    // Press effect — snaps down 1px on active, instant timing for tactile feel
    'active:translate-y-px active:duration-instant',
  ],
  {
    variants: {
      variant: {
        primary: ['bg-accent text-on-accent', 'hover:bg-accent-hover hover:shadow-accent'],
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
        destructive: [
          'bg-error-subtle text-error-text border-error',
          'hover:bg-error hover:text-on-error',
        ],
      },
      size: {
        xs: 'h-6 px-2 text-xs',
        sm: 'h-8 px-3 text-xs',
        md: 'h-9 px-4 text-sm',
        lg: 'h-11 px-6 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export type ButtonProps = React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    /** Renders a spinner and blocks interaction without applying disabled styling. */
    isLoading?: boolean;
    /**
     * Screen-reader label announced during loading (e.g. "Saving…").
     * Overrides the button's visible label in the accessibility tree.
     * Provide a localised string — this prop is intentionally not defaulted.
     */
    loadingLabel?: string;
    /** Icon rendered before the label. Hidden (not removed) during loading. */
    startIcon?: React.ReactNode;
    /** Icon rendered after the label. Hidden (not removed) during loading. */
    endIcon?: React.ReactNode;
  };

function ButtonSpinner() {
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
 * Primary interactive element. Supports four semantic variants, three sizes,
 * and controlled loading/disabled states.
 *
 * @example
 * <Button variant="primary" startIcon={<PlusIcon />} onClick={handleSave}>
 *   Save deck
 * </Button>
 *
 * @example
 * <Button variant="destructive" isLoading={isPending} loadingLabel="Deleting…">
 *   Delete deck
 * </Button>
 */
export function Button({
  ref,
  className,
  variant,
  size,
  isLoading = false,
  loadingLabel,
  startIcon,
  endIcon,
  disabled,
  children,
  'aria-label': ariaLabel,
  onClick,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      data-slot="button"
      {...props}
      ref={ref}
      disabled={disabled}
      onClick={isLoading ? undefined : onClick}
      aria-busy={isLoading ? true : undefined}
      aria-label={isLoading && loadingLabel ? loadingLabel : ariaLabel}
      className={cn(
        buttonVariants({ variant, size }),
        isLoading && 'cursor-wait pointer-events-none',
        className
      )}
    >
      {/* visibility:hidden preserves layout width while the spinner is shown */}
      <span
        aria-hidden={isLoading ? true : undefined}
        className={cn('inline-flex items-center gap-2', isLoading && 'invisible')}
      >
        {startIcon ? (
          <span className="shrink-0 [&>svg]:size-[1em]" aria-hidden="true">
            {startIcon}
          </span>
        ) : null}
        {children}
        {endIcon ? (
          <span className="shrink-0 [&>svg]:size-[1em]" aria-hidden="true">
            {endIcon}
          </span>
        ) : null}
      </span>

      {isLoading ? (
        <span className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
          <ButtonSpinner />
        </span>
      ) : null}
    </button>
  );
}
