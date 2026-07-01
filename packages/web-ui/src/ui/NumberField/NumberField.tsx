import { NumberField as NumberFieldPrimitive } from '@base-ui/react/number-field';
import { cva, type VariantProps } from 'class-variance-authority';
import { Minus, MoveHorizontal, Plus } from 'lucide-react';
import * as React from 'react';

import { cn } from '../../lib/cn';
import { CONTROL_HEIGHT } from '../../lib/sizing/control-height';

// ─── NumberField ──────────────────────────────────────────────────────────────

export type NumberFieldProps = NumberFieldPrimitive.Root.Props;

/**
 * Numeric input with increment/decrement steppers and optional drag-to-scrub.
 * Wraps all sub-parts — use with NumberFieldGroup, NumberFieldScrubArea, etc.
 *
 * @example Basic
 * <NumberField min={0} max={4} defaultValue={1}>
 *   <NumberFieldGroup>
 *     <NumberFieldDecrement />
 *     <NumberFieldInput />
 *     <NumberFieldIncrement />
 *   </NumberFieldGroup>
 * </NumberField>
 *
 * @example With label scrub
 * <NumberField min={0}>
 *   <NumberFieldScrubArea>
 *     <FieldLabel>Quantity</FieldLabel>
 *   </NumberFieldScrubArea>
 *   <NumberFieldGroup>
 *     <NumberFieldDecrement />
 *     <NumberFieldInput />
 *     <NumberFieldIncrement />
 *   </NumberFieldGroup>
 * </NumberField>
 */
export function NumberField(props: NumberFieldProps) {
  return <NumberFieldPrimitive.Root data-slot="number-field" {...props} />;
}

// ─── NumberFieldGroup ─────────────────────────────────────────────────────────

const numberFieldGroupVariants = cva(
  [
    'relative flex w-fit items-center',
    'rounded-interactive border border-border-interactive bg-surface',
    'transition-[border-color,box-shadow] duration-fast',
    // Focus ring via :has — same pattern as InputGroup
    '[&:has([data-slot=number-field-control]:focus-visible)]:border-border-focus',
    '[&:has([data-slot=number-field-control]:focus-visible)]:ring-2',
    '[&:has([data-slot=number-field-control]:focus-visible)]:ring-border-focus',
    '[&:has([data-slot=number-field-control]:focus-visible)]:ring-offset-2',
    '[&:has([data-slot=number-field-control]:focus-visible)]:ring-offset-bg',
    '[&:has(:disabled)]:cursor-not-allowed',
    // Whole-field disabled: fade the group only when the input itself is disabled,
    // not when a single stepper is disabled at a min/max boundary.
    '[&:has([data-slot=number-field-control]:disabled)]:opacity-disabled',
    '[&:has([aria-invalid=true])]:border-error',
    '[&:has([aria-invalid=true])]:ring-2 [&:has([aria-invalid=true])]:ring-error/20',
  ],
  {
    variants: {
      size: {
        sm: [CONTROL_HEIGHT.sm, 'text-xs [&_svg]:size-3'],
        md: [CONTROL_HEIGHT.md, 'text-sm [&_svg]:size-4'],
        lg: [CONTROL_HEIGHT.lg, 'text-sm [&_svg]:size-5'],
      },
    },
    defaultVariants: { size: 'md' },
  }
);

export type NumberFieldGroupProps = NumberFieldPrimitive.Group.Props &
  VariantProps<typeof numberFieldGroupVariants>;

/**
 * Visual container for the stepper controls — owns the border, focus ring,
 * and height. Place Decrement, Input, and Increment inside.
 * The `size` prop cascades SVG sizes to all children automatically.
 */
export function NumberFieldGroup({ className, size, ...props }: NumberFieldGroupProps) {
  return (
    <NumberFieldPrimitive.Group
      data-slot="number-field-group"
      className={cn(numberFieldGroupVariants({ size }), className)}
      {...props}
    />
  );
}

// ─── NumberFieldDecrement ─────────────────────────────────────────────────────

export type NumberFieldDecrementProps = NumberFieldPrimitive.Decrement.Props;

/** Stepper button that decrements the value by `step`. */
export function NumberFieldDecrement({
  className,
  'aria-label': ariaLabel = 'Decrease',
  ...props
}: NumberFieldDecrementProps) {
  return (
    <NumberFieldPrimitive.Decrement
      data-slot="number-field-step"
      aria-label={ariaLabel}
      className={cn(
        'flex h-full items-center px-2.5',
        'rounded-l-interactive border-r border-border-interactive',
        'text-text-muted transition-colors duration-fast',
        'hover:bg-surface-hover hover:text-text',
        'outline-none focus-visible:bg-surface-hover',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-disabled',
        className
      )}
      {...props}
    >
      <Minus aria-hidden />
    </NumberFieldPrimitive.Decrement>
  );
}

// ─── NumberFieldInput ─────────────────────────────────────────────────────────

export type NumberFieldInputProps = NumberFieldPrimitive.Input.Props;

/** The native numeric input. No border — belongs to NumberFieldGroup. */
export function NumberFieldInput({ className, ...props }: NumberFieldInputProps) {
  return (
    <NumberFieldPrimitive.Input
      data-slot="number-field-control"
      className={cn(
        'h-full w-16 min-w-0 bg-transparent',
        'text-center tabular-nums text-text',
        'outline-none',
        'placeholder:text-text-faint',
        className
      )}
      {...props}
    />
  );
}

// ─── NumberFieldIncrement ─────────────────────────────────────────────────────

export type NumberFieldIncrementProps = NumberFieldPrimitive.Increment.Props;

/** Stepper button that increments the value by `step`. */
export function NumberFieldIncrement({
  className,
  'aria-label': ariaLabel = 'Increase',
  ...props
}: NumberFieldIncrementProps) {
  return (
    <NumberFieldPrimitive.Increment
      data-slot="number-field-step"
      aria-label={ariaLabel}
      className={cn(
        'flex h-full items-center px-2.5',
        'rounded-r-interactive border-l border-border-interactive',
        'text-text-muted transition-colors duration-fast',
        'hover:bg-surface-hover hover:text-text',
        'outline-none focus-visible:bg-surface-hover',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-disabled',
        className
      )}
      {...props}
    >
      <Plus aria-hidden />
    </NumberFieldPrimitive.Increment>
  );
}

// ─── NumberFieldScrubCursor ───────────────────────────────────────────────────

export type NumberFieldScrubCursorProps = NumberFieldPrimitive.ScrubAreaCursor.Props;

/**
 * Floating cursor rendered during drag-to-scrub (uses Pointer Lock API).
 * Bundled inside NumberFieldScrubArea by default — export separately for
 * custom cursor designs.
 */
export function NumberFieldScrubCursor({ className, ...props }: NumberFieldScrubCursorProps) {
  return (
    <NumberFieldPrimitive.ScrubAreaCursor
      data-slot="number-field-scrub-cursor"
      className={cn(
        'flex items-center gap-1.5',
        'rounded-badge border border-border bg-surface px-2 py-1 shadow-popover',
        'font-mono text-xs text-text-muted',
        className
      )}
      {...props}
    >
      <MoveHorizontal aria-hidden className="size-3.5 shrink-0" />
    </NumberFieldPrimitive.ScrubAreaCursor>
  );
}

// ─── NumberFieldScrubArea ─────────────────────────────────────────────────────

export type NumberFieldScrubAreaProps = NumberFieldPrimitive.ScrubArea.Props & {
  /** Whether to render the built-in scrub cursor. @default true */
  showCursor?: boolean;
};

/**
 * Invisible drag zone — drag left/right to decrement/increment the value.
 * Wrap a label or any element to make it scrub-enabled (Figma-style).
 * Renders a floating cursor indicator during drag (suppressed in Safari —
 * Pointer Lock API not supported).
 *
 * @example
 * <NumberFieldScrubArea>
 *   <FieldLabel>Quantity</FieldLabel>
 * </NumberFieldScrubArea>
 */
export function NumberFieldScrubArea({
  className,
  showCursor = true,
  children,
  ...props
}: NumberFieldScrubAreaProps) {
  return (
    <NumberFieldPrimitive.ScrubArea
      data-slot="number-field-scrub-area"
      className={cn('cursor-ew-resize select-none', className)}
      {...props}
    >
      {children}
      {showCursor ? <NumberFieldScrubCursor /> : null}
    </NumberFieldPrimitive.ScrubArea>
  );
}

// ─── NumberFieldValue (read-only display) ─────────────────────────────────────

export type NumberFieldValueProps = React.ComponentProps<'output'>;

/**
 * Read-only display of the current value — useful for compact contexts (e.g.
 * card quantity badge) where you show the number without the full input chrome.
 * Renders a semantic `<output>` element.
 */
export function NumberFieldValue({ className, ...props }: NumberFieldValueProps) {
  return (
    <output
      data-slot="number-field-value"
      className={cn('tabular-nums text-text', className)}
      {...props}
    />
  );
}
