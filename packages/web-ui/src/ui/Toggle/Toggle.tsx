import { Toggle as TogglePrimitive } from '@base-ui/react/toggle';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/cn';
import { CONTROL_HEIGHT } from '../../lib/sizing/control-height';
import { ICON_INLINE } from '../../lib/sizing/icon-inline';

export const toggleBaseClasses = [
  'group/toggle inline-flex items-center justify-center gap-1',
  'rounded-interactive whitespace-nowrap',
  'font-display font-medium',
  'select-none cursor-pointer',
  'transition-[background-color,border-color,color,opacity] duration-fast ease-out',
  'outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
  'focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
  'disabled:pointer-events-none disabled:opacity-[0.38]',
  '[&_svg]:pointer-events-none [&_svg]:shrink-0',
  // Pressed state — accent-subtle bg + accent text color
  'aria-pressed:bg-accent-subtle aria-pressed:text-accent-text',
] as const;

export const toggleVariantStyles = {
  ghost: 'bg-transparent text-text-muted hover:bg-accent-subtle hover:text-text',
  secondary: [
    'border border-border bg-transparent text-text-muted',
    'hover:bg-accent-subtle hover:text-text',
    'aria-pressed:border-accent-border',
  ],
} as const;

export const toggleVariants = cva(toggleBaseClasses, {
  variants: {
    variant: toggleVariantStyles,
    size: {
      xs: `${CONTROL_HEIGHT.xs} px-1.5 text-xs ${ICON_INLINE.xs}`,
      sm: `${CONTROL_HEIGHT.sm} px-2 text-xs ${ICON_INLINE.sm}`,
      md: `${CONTROL_HEIGHT.md} px-2.5 text-sm ${ICON_INLINE.md}`,
      lg: `${CONTROL_HEIGHT.lg} px-2.5 text-sm ${ICON_INLINE.lg}`,
    },
  },
  defaultVariants: {
    variant: 'ghost',
    size: 'md',
  },
});

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
