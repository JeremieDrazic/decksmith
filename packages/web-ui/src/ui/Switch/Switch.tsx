'use client';

import { Switch as SwitchPrimitive } from '@base-ui/react/switch';
import * as React from 'react';

import { cn } from '../../lib/cn';

export type SwitchProps = SwitchPrimitive.Root.Props;

/**
 * A two-state toggle that represents an immediate on/off action.
 * Use Checkbox for opt-ins that take effect on form submit.
 * Pair with FieldLabel (variant="body", htmlFor) and optionally FieldContent.
 *
 * @example
 * <Field orientation="horizontal">
 *   <FieldLabel variant="body" htmlFor="notif">Push notifications</FieldLabel>
 *   <Switch id="notif" name="notifications" />
 * </Field>
 */
export function Switch({ className, ...props }: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        'relative flex items-center h-5 w-9 px-0.5 cursor-pointer rounded-full shrink-0',
        'border border-border bg-surface-raised',
        'data-[checked]:bg-accent data-[checked]:border-accent',
        'outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-1 focus-visible:ring-offset-bg',
        'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-[0.38]',
        'transition-colors duration-fast',
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          'size-4 rounded-full shrink-0',
          'bg-white shadow-sm' /* thumb is invariant white — contrast holds on all track tones */,
          'data-[checked]:translate-x-4',
          'transition-transform duration-fast'
        )}
      />
    </SwitchPrimitive.Root>
  );
}
