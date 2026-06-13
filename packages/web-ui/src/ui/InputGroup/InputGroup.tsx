// InputGroup — composite input with addons. Slot: input-group-control.
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/cn';
import { Button } from '../Button/Button';
import { Input } from '../Input/Input';
import { Textarea } from '../Textarea/Textarea';

// ─── InputGroup ───────────────────────────────────────────────────────────────

export type InputGroupProps = React.ComponentProps<'div'>;

/**
 * Horizontal (or vertical) composition of an input with text/button addons.
 * The container owns the border and focus ring — inner controls strip their own.
 *
 * @example
 * <InputGroup>
 *   <InputGroupAddon>https://</InputGroupAddon>
 *   <InputGroupInput placeholder="your-site.com" />
 * </InputGroup>
 */
export function InputGroup({ className, ...props }: InputGroupProps) {
  return (
    <div
      data-slot="input-group"
      role="group"
      className={cn(
        'group/input-group relative flex h-9 w-full min-w-0 items-center',
        'rounded-interactive border border-border bg-surface',
        'transition-[border-color,box-shadow] duration-fast outline-none',
        // Focus ring — [&:has(...)] form required (has-[...] built-in variant generates no CSS in v4+Vite)
        '[&:has([data-slot=input-group-control]:focus-visible)]:border-border-focus',
        '[&:has([data-slot=input-group-control]:focus-visible)]:ring-2',
        '[&:has([data-slot=input-group-control]:focus-visible)]:ring-border-focus',
        '[&:has([data-slot=input-group-control]:focus-visible)]:ring-offset-2',
        '[&:has([data-slot=input-group-control]:focus-visible)]:ring-offset-bg',
        // Error state
        '[&:has([aria-invalid=true])]:border-error',
        '[&:has([aria-invalid=true])]:ring-2',
        '[&:has([aria-invalid=true])]:ring-error/20',
        // Disabled state
        '[&:has(:disabled)]:opacity-[0.38] [&:has(:disabled)]:cursor-not-allowed',
        // Textarea → height auto
        '[&:has(>textarea)]:h-auto',
        // Block-aligned addons → height auto, column layout
        '[&:has(>[data-align=block-start])]:h-auto [&:has(>[data-align=block-start])]:flex-col',
        '[&:has(>[data-align=block-end])]:h-auto [&:has(>[data-align=block-end])]:flex-col',
        className
      )}
      {...props}
    />
  );
}

// ─── InputGroupAddon ──────────────────────────────────────────────────────────

const inputGroupAddonVariants = cva(
  [
    'flex h-auto cursor-text items-center justify-center gap-2 py-1.5',
    'text-sm font-medium text-text-muted select-none',
    'group-data-[disabled=true]/input-group:opacity-[0.38]',
    '[&>svg:not([class*="size-"])]:size-4',
  ],
  {
    variants: {
      align: {
        'inline-start': [
          'order-first pl-2',
          '[&:has(>button)]:ml-[-0.3rem]',
          '[&:has(>kbd)]:ml-[-0.15rem]',
        ],
        'inline-end': [
          'order-last pr-2',
          '[&:has(>button)]:mr-[-0.3rem]',
          '[&:has(>kbd)]:mr-[-0.15rem]',
        ],
        'block-start': 'order-first w-full justify-start px-2.5 pt-2',
        'block-end': 'order-last w-full justify-start px-2.5 pb-2',
      },
    },
    defaultVariants: {
      align: 'inline-start',
    },
  }
);

export type InputGroupAddonProps = React.ComponentProps<'div'> &
  VariantProps<typeof inputGroupAddonVariants>;

/**
 * Text or icon label inside an InputGroup, with configurable alignment.
 * Clicking the addon (outside a button) delegates focus to the nearest input or textarea.
 *
 * @example
 * <InputGroupAddon>https://</InputGroupAddon>
 * <InputGroupAddon align="inline-end"><InputGroupButton>Go</InputGroupButton></InputGroupAddon>
 */
export function InputGroupAddon({
  className,
  align = 'inline-start',
  ...props
}: InputGroupAddonProps) {
  return (
    <div
      data-slot="input-group-addon"
      data-align={align}
      className={cn(inputGroupAddonVariants({ align }), className)}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('button')) return;
        e.currentTarget.parentElement?.querySelector<HTMLElement>('input, textarea')?.focus();
      }}
      {...props}
    />
  );
}

// ─── InputGroupButton ─────────────────────────────────────────────────────────

const inputGroupButtonVariants = cva(
  // SVG sizing: descendant combinator (_) required — SVG is inside Button's inner <span>
  ['flex items-center gap-2 shadow-none', '[&_svg:not([class*="size-"])]:size-[1em]'],
  {
    variants: {
      size: {
        sm: ['h-7 px-2 text-xs', 'rounded-[calc(var(--radius-interactive)-2px)]'],
        'icon-sm': ['size-7 p-0', 'rounded-[calc(var(--radius-interactive)-2px)]'],
        xs: [
          'h-5 gap-1 px-1.5 text-xs',
          'rounded-[calc(var(--radius-interactive)-3px)]',
          '[&_svg:not([class*="size-"])]:size-3.5',
        ],
        'icon-xs': ['size-5 p-0', 'rounded-[calc(var(--radius-interactive)-3px)]'],
      },
    },
    defaultVariants: {
      size: 'sm',
    },
  }
);

export type InputGroupButtonProps = Omit<React.ComponentProps<typeof Button>, 'size' | 'type'> &
  VariantProps<typeof inputGroupButtonVariants> & {
    type?: 'button' | 'submit' | 'reset';
  };

/**
 * A button inside an InputGroup addon. Sizes are proportional to the h-9 container.
 *
 * @example
 * <InputGroupAddon align="inline-end">
 *   <InputGroupButton size="icon-sm" aria-label="Search">
 *     <SearchIcon />
 *   </InputGroupButton>
 * </InputGroupAddon>
 */
export function InputGroupButton({
  className,
  type = 'button',
  variant = 'ghost',
  size = 'sm',
  ...props
}: InputGroupButtonProps) {
  return (
    <Button
      type={type}
      variant={variant}
      className={cn(inputGroupButtonVariants({ size }), className)}
      {...props}
    />
  );
}

// ─── InputGroupText ────────────────────────────────────────────────────────────

export type InputGroupTextProps = React.ComponentProps<'span'>;

/**
 * Plain text label inside an InputGroup (e.g. "https://", "€", ".com").
 * Use InputGroupAddon when you need alignment control or click-to-focus behaviour.
 */
export function InputGroupText({ className, ...props }: InputGroupTextProps) {
  return (
    <span
      className={cn(
        'flex items-center gap-2 text-sm text-text-muted',
        '[&_svg]:pointer-events-none [&_svg:not([class*="size-"])]:size-4',
        className
      )}
      {...props}
    />
  );
}

// ─── InputGroupInput ──────────────────────────────────────────────────────────

export type InputGroupInputProps = React.ComponentProps<typeof Input>;

/**
 * Input stripped of its own border/ring for use inside InputGroup.
 * The container owns the focus ring, border, and rounded corners.
 */
export function InputGroupInput({ className, ...props }: InputGroupInputProps) {
  return (
    <Input
      data-slot="input-group-control"
      className={cn(
        'flex-1 rounded-none border-0 bg-transparent shadow-none',
        'ring-0 focus-visible:ring-0 disabled:bg-transparent aria-invalid:ring-0',
        className
      )}
      {...props}
    />
  );
}

// ─── InputGroupTextarea ───────────────────────────────────────────────────────

export type InputGroupTextareaProps = React.ComponentProps<typeof Textarea>;

/**
 * Textarea stripped of its own border/ring for use inside InputGroup.
 * Pair with `<InputGroupAddon align="block-start">` for a label above.
 */
export function InputGroupTextarea({ className, ...props }: InputGroupTextareaProps) {
  return (
    <Textarea
      data-slot="input-group-control"
      className={cn(
        'flex-1 resize-none rounded-none border-0 bg-transparent py-2 shadow-none',
        'ring-0 focus-visible:ring-0 disabled:bg-transparent aria-invalid:ring-0',
        className
      )}
      {...props}
    />
  );
}
