import { Toggle as TogglePrimitive } from '@base-ui/react/toggle';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../../lib/cn';
import { ICON_IN_CONTROL } from '../../lib/sizing/icon-in-control';
import { CONTROL_SQUARE } from '../../lib/sizing/control-square';
import { toggleBaseClasses, toggleVariantStyles } from '../Toggle/Toggle';

const iconToggleVariants = cva(toggleBaseClasses, {
  variants: {
    variant: toggleVariantStyles,
    size: {
      xs: `${CONTROL_SQUARE.xs} ${ICON_IN_CONTROL.xs}`,
      sm: `${CONTROL_SQUARE.sm} ${ICON_IN_CONTROL.sm}`,
      md: `${CONTROL_SQUARE.md} ${ICON_IN_CONTROL.md}`,
      lg: `${CONTROL_SQUARE.lg} ${ICON_IN_CONTROL.lg}`,
    },
  },
  defaultVariants: {
    variant: 'ghost',
    size: 'md',
  },
});

export type IconToggleProps = Omit<TogglePrimitive.Props, 'children'> &
  VariantProps<typeof iconToggleVariants> & {
    /** The icon to render. Should be a single SVG element. */
    icon: React.ReactNode;
    /** Required — the only accessible name (no visible label). */
    'aria-label': string;
  };

/**
 * A square icon-only toggle. Identical variants and sizes to Toggle.
 * aria-label is required — there is no visible label.
 * State is managed by base-ui — aria-pressed is set automatically.
 *
 * @example
 * <IconToggle icon={<BoldIcon />} aria-label="Bold" />
 *
 * @example
 * <IconToggle icon={<MoonIcon />} aria-label="Dark mode" variant="secondary" defaultPressed />
 */
export function IconToggle({ className, variant, size, icon, ...props }: IconToggleProps) {
  return (
    <TogglePrimitive
      data-slot="icon-toggle"
      className={cn(iconToggleVariants({ variant, size, className }))}
      {...props}
    >
      {icon}
    </TogglePrimitive>
  );
}
