'use client';

import { RadioGroup as RadioGroupPrimitive } from '@base-ui/react/radio-group';
import { Radio as RadioPrimitive } from '@base-ui/react/radio';
import * as React from 'react';

import { cn } from '../../lib/cn';

// ─── RadioGroup ───────────────────────────────────────────────────────────────

export type RadioGroupProps<Value = string> = RadioGroupPrimitive.Props<Value>;

/**
 * Provides shared state for a set of Radio buttons.
 * Handles keyboard navigation (arrow keys), value management, and form submission.
 * Always pair with FieldSet + FieldLegend for accessibility.
 *
 * @example
 * <FieldSet>
 *   <FieldLegend>Format</FieldLegend>
 *   <RadioGroup name="format" defaultValue="standard">
 *     <Radio value="standard">Standard</Radio>
 *     <Radio value="commander">Commander</Radio>
 *   </RadioGroup>
 * </FieldSet>
 */
export function RadioGroup<Value = string>({ className, ...props }: RadioGroupProps<Value>) {
  return (
    <RadioGroupPrimitive
      data-slot="radio-group"
      className={cn('flex flex-col gap-3', className)}
      {...props}
    />
  );
}

// ─── Radio ────────────────────────────────────────────────────────────────────

export type RadioProps<Value = string> = RadioPrimitive.Root.Props<Value> & {
  /** Label text rendered next to the button. */
  children?: React.ReactNode;
};

/**
 * A single radio option. Must be a descendant of RadioGroup.
 * The `value` prop is required — it identifies the option within the group.
 *
 * @example
 * <Radio value="commander">Commander</Radio>
 * <Radio value="legacy" disabled>Legacy (not available)</Radio>
 */
export function Radio<Value = string>({ className, children, ...props }: RadioProps<Value>) {
  return (
    <label
      data-slot="radio-item"
      className={cn(
        'flex items-center gap-2.5 w-fit',
        'text-sm text-text font-normal leading-none',
        'cursor-pointer select-none',
        'has-[span[data-disabled]]:cursor-not-allowed has-[span[data-disabled]]:opacity-[0.38]'
      )}
    >
      <RadioPrimitive.Root
        data-slot="radio"
        className={cn(
          'relative flex size-4 shrink-0 items-center justify-center rounded-full',
          'border border-border-interactive bg-surface',
          'data-[checked]:bg-accent data-[checked]:border-accent data-[checked]:text-on-accent',
          'outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-1 focus-visible:ring-offset-bg',
          'transition-colors duration-fast',
          className
        )}
        {...props}
      >
        <RadioPrimitive.Indicator
          data-slot="radio-indicator"
          className="flex items-center justify-center"
        >
          <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
        </RadioPrimitive.Indicator>
      </RadioPrimitive.Root>
      {children}
    </label>
  );
}
