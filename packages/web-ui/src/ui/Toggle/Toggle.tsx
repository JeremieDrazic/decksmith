import { Toggle as TogglePrimitive } from '@base-ui/react/toggle';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/cn';

export const toggleVariants = cva(
  [
    'group/toggle inline-flex items-center justify-center gap-1',
    'rounded-interactive whitespace-nowrap',
    'font-display font-medium',
    'select-none cursor-pointer',
    'transition-[background-color,border-color,color,opacity] duration-fast ease-out',
    'outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
    'focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
    'disabled:pointer-events-none disabled:opacity-[0.38]',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4',
    // Pressed state — accent-subtle bg + accent text color
    'aria-pressed:bg-accent-subtle aria-pressed:text-accent-text',
  ],
  {
    variants: {
      variant: {
        ghost: 'bg-transparent text-text-muted hover:bg-accent-subtle hover:text-text',
        secondary: [
          'border border-border bg-transparent text-text-muted',
          'hover:bg-accent-subtle hover:text-text',
          'aria-pressed:border-accent-border',
        ],
      },
      size: {
        xs: 'h-6 min-w-6 px-1.5 text-xs',
        sm: 'h-7 min-w-7 px-2 text-xs',
        md: 'h-8 min-w-8 px-2.5 text-sm',
        lg: 'h-9 min-w-9 px-2.5 text-sm',
      },
    },
    defaultVariants: {
      variant: 'ghost',
      size: 'md',
    },
  }
);

export type ToggleProps = TogglePrimitive.Props & VariantProps<typeof toggleVariants>;

/**
 * A two-state button that toggles between pressed and unpressed.
 * Accessible name must be provided via children or aria-label (icon-only use).
 * State is managed by base-ui — aria-pressed is set automatically.
 *
 * @example
 * <Toggle aria-label="Bold">
 *   <BoldIcon />
 * </Toggle>
 *
 * @example
 * <Toggle variant="secondary" defaultPressed>
 *   Commander
 * </Toggle>
 */
export function Toggle({ className, variant, size, ...props }: ToggleProps) {
  return (
    <TogglePrimitive
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  );
}
