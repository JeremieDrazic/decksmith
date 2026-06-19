'use client';

import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox';
import * as React from 'react';

import { cn } from '../../lib/cn';

function CheckIcon() {
  return (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M2 6l3 3 5-5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DashIcon() {
  return (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M3 6h6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

export type CheckboxProps = CheckboxPrimitive.Root.Props;

/**
 * A two-state toggle. Supports indeterminate state for "select all" patterns.
 * Pair with FieldLabel (htmlFor) or FieldSet + FieldLegend for groups.
 *
 * @example
 * <Field orientation="horizontal">
 *   <Checkbox id="terms" name="terms" />
 *   <FieldLabel htmlFor="terms">Accept terms</FieldLabel>
 * </Field>
 *
 * @example
 * <Checkbox indeterminate checked={someSelected} onCheckedChange={toggleAll} />
 */
export function Checkbox({ className, indeterminate, ...props }: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      indeterminate={indeterminate}
      data-slot="checkbox"
      className={cn(
        'relative flex size-4 shrink-0 items-center justify-center rounded-sm',
        'border border-border bg-surface',
        'data-[checked]:bg-accent data-[checked]:border-accent data-[checked]:text-on-accent',
        'data-[indeterminate]:bg-accent data-[indeterminate]:border-accent data-[indeterminate]:text-on-accent',
        'outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-1 focus-visible:ring-offset-bg',
        'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-[0.38]',
        'transition-colors duration-fast',
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center [&>svg]:size-3"
      >
        {indeterminate ? <DashIcon /> : <CheckIcon />}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
