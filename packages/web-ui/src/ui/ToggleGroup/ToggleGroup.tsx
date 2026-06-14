import { Toggle as TogglePrimitive } from '@base-ui/react/toggle';
import { ToggleGroup as ToggleGroupPrimitive } from '@base-ui/react/toggle-group';
import { type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../../lib/cn';
import { toggleVariants } from '../Toggle/Toggle';

type ToggleGroupContextValue = VariantProps<typeof toggleVariants> & {
  spacing?: number;
  orientation?: 'horizontal' | 'vertical';
};

const ToggleGroupContext = React.createContext<ToggleGroupContextValue>({
  size: 'md',
  variant: 'ghost',
  spacing: 2,
  orientation: 'horizontal',
});

export type ToggleGroupProps = ToggleGroupPrimitive.Props &
  VariantProps<typeof toggleVariants> & {
    spacing?: number;
    orientation?: 'horizontal' | 'vertical';
  };

/**
 * Groups Toggle items with shared variant, size, and layout configuration.
 * Use spacing=0 for an attached ButtonGroup-like layout.
 *
 * @example
 * <ToggleGroup aria-label="View mode">
 *   <ToggleGroupItem value="grid" aria-label="Grid"><GridIcon /></ToggleGroupItem>
 *   <ToggleGroupItem value="list" aria-label="List"><ListIcon /></ToggleGroupItem>
 * </ToggleGroup>
 *
 * @example
 * <ToggleGroup variant="secondary" spacing={0} aria-label="Format">
 *   <ToggleGroupItem value="standard">Standard</ToggleGroupItem>
 *   <ToggleGroupItem value="commander">Commander</ToggleGroupItem>
 * </ToggleGroup>
 */
export function ToggleGroup({
  className,
  variant,
  size,
  spacing = 2,
  orientation = 'horizontal',
  children,
  ...props
}: ToggleGroupProps) {
  return (
    <ToggleGroupPrimitive
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      data-spacing={spacing}
      data-orientation={orientation}
      style={{ '--gap': spacing } as React.CSSProperties}
      className={cn(
        'group/toggle-group flex w-fit flex-row items-center',
        'gap-[--spacing(var(--gap))]',
        'rounded-interactive',
        'data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch',
        className
      )}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ variant, size, spacing, orientation }}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive>
  );
}

export type ToggleGroupItemProps = TogglePrimitive.Props & VariantProps<typeof toggleVariants>;

/**
 * An individual toggle item inside a ToggleGroup.
 * Inherits variant and size from the parent ToggleGroup context.
 *
 * @example
 * <ToggleGroupItem value="bold" aria-label="Bold">
 *   <BoldIcon />
 * </ToggleGroupItem>
 */
export function ToggleGroupItem({
  className,
  children,
  variant,
  size,
  ...props
}: ToggleGroupItemProps) {
  const context = React.useContext(ToggleGroupContext);
  const resolvedVariant = context.variant ?? variant;
  const resolvedSize = context.size ?? size;

  return (
    <TogglePrimitive
      data-slot="toggle-group-item"
      data-variant={resolvedVariant}
      data-size={resolvedSize}
      data-spacing={context.spacing}
      className={cn(
        'shrink-0 focus:z-10 focus-visible:z-10',
        // spacing=0: remove inner radius and borders (attached layout)
        'group-data-[spacing=0]/toggle-group:rounded-none',
        'group-data-[spacing=0]/toggle-group:px-2',
        // restore radius on first/last items
        'group-data-[orientation=horizontal]/toggle-group:data-[spacing=0]:first:rounded-l-interactive',
        'group-data-[orientation=horizontal]/toggle-group:data-[spacing=0]:last:rounded-r-interactive',
        'group-data-[orientation=vertical]/toggle-group:data-[spacing=0]:first:rounded-t-interactive',
        'group-data-[orientation=vertical]/toggle-group:data-[spacing=0]:last:rounded-b-interactive',
        // secondary variant: remove inner borders when attached
        'group-data-[orientation=horizontal]/toggle-group:data-[spacing=0]:data-[variant=secondary]:border-l-0',
        'group-data-[orientation=horizontal]/toggle-group:data-[spacing=0]:data-[variant=secondary]:first:border-l',
        'group-data-[orientation=vertical]/toggle-group:data-[spacing=0]:data-[variant=secondary]:border-t-0',
        'group-data-[orientation=vertical]/toggle-group:data-[spacing=0]:data-[variant=secondary]:first:border-t',
        toggleVariants({ variant: resolvedVariant, size: resolvedSize }),
        className
      )}
      {...props}
    >
      {children}
    </TogglePrimitive>
  );
}
