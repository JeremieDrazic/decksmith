import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../../lib/cn';

const buttonGroupVariants = cva(
  [
    'flex w-fit items-stretch',
    // Focus ring on active child floats above siblings
    '*:focus-visible:relative *:focus-visible:z-10',
  ],
  {
    variants: {
      orientation: {
        horizontal: [
          // Remove radius on the shared (inner) sides of all data-slot children
          '*:data-slot:rounded-r-none',
          // Restore radius on the last data-slot child (no following sibling with data-slot)
          '[&>[data-slot]:not(:has(~[data-slot]))]:rounded-r-interactive!',
          // Remove radius on the left side of all non-first data-slot children
          '[&>[data-slot]~[data-slot]]:rounded-l-none',
          // Remove the left border on non-first children — prevents double 1px borders
          '[&>[data-slot]~[data-slot]]:border-l-0',
        ],
        vertical: [
          '*:data-slot:rounded-b-none',
          '[&>[data-slot]:not(:has(~[data-slot]))]:rounded-b-interactive!',
          '[&>[data-slot]~[data-slot]]:rounded-t-none',
          '[&>[data-slot]~[data-slot]]:border-t-0',
          'flex-col',
        ],
      },
    },
    defaultVariants: {
      orientation: 'horizontal',
    },
  }
);

export type ButtonGroupProps = React.ComponentProps<'div'> &
  VariantProps<typeof buttonGroupVariants>;

/**
 * Groups related buttons together with shared borders and adjusted corner radius.
 * Direct children must have a `data-slot` attribute (Button and IconButton already do).
 *
 * @example
 * <ButtonGroup aria-label="Text alignment">
 *   <Button variant="secondary">Left</Button>
 *   <Button variant="secondary">Center</Button>
 *   <Button variant="secondary">Right</Button>
 * </ButtonGroup>
 */
export function ButtonGroup({ className, orientation, children, ...props }: ButtonGroupProps) {
  return (
    <div
      role="group"
      data-slot="button-group"
      data-orientation={orientation ?? 'horizontal'}
      className={cn(buttonGroupVariants({ orientation }), className)}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * A thin line that visually divides buttons within a group.
 * Not needed when using the `outline` / `secondary` variant since those already have a border.
 *
 * @example
 * <ButtonGroup>
 *   <Button variant="primary">Save</Button>
 *   <ButtonGroupSeparator />
 *   <IconButton variant="primary" icon={<ChevronDownIcon />} aria-label="More options" />
 * </ButtonGroup>
 */
export function ButtonGroupSeparator({
  className,
  orientation = 'vertical',
  ...props
}: React.ComponentProps<'div'> & { orientation?: 'horizontal' | 'vertical' }) {
  return (
    <div
      data-slot="button-group-separator"
      data-orientation={orientation}
      className={cn(
        'relative self-stretch bg-border',
        orientation === 'vertical' ? 'my-px h-auto w-px' : 'mx-px h-px w-auto',
        className
      )}
      {...props}
    />
  );
}

/**
 * A non-interactive label element styled to match the height and border of adjacent buttons.
 * Useful for prefixes/suffixes (e.g. "$", "kg", "@").
 * Accepts a `render` prop to change the underlying element (e.g. `<label />`).
 *
 * @example
 * <ButtonGroup>
 *   <ButtonGroupText>$</ButtonGroupText>
 *   <Input placeholder="0.00" />
 * </ButtonGroup>
 *
 * @example
 * <ButtonGroup>
 *   <ButtonGroupText render={<label htmlFor="price" />}>Price</ButtonGroupText>
 *   <Input id="price" placeholder="0.00" />
 * </ButtonGroup>
 */
export function ButtonGroupText({ className, render, ...props }: useRender.ComponentProps<'div'>) {
  return useRender({
    defaultTagName: 'div',
    props: mergeProps<'div'>(
      {
        className: cn(
          'flex items-center gap-2 rounded-interactive border border-border bg-transparent px-3',
          'font-display text-sm font-medium text-text-muted',
          '[&_svg]:pointer-events-none [&_svg:not([class*="size-"])]:size-4',
          className
        ),
      },
      props
    ),
    render,
    state: {
      slot: 'button-group-text',
    },
  });
}
