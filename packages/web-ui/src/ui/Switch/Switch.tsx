import { Switch as SwitchPrimitive } from '@base-ui/react/switch';
import * as React from 'react';

import { cn } from '../../lib/cn';

export type SwitchProps = SwitchPrimitive.Root.Props & {
  /** Optional icon rendered inside the thumb. Size it via className on the icon (e.g. size-2.5). */
  thumbIcon?: React.ReactNode;
};

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
export function Switch({ className, thumbIcon, ...props }: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        'relative flex items-center h-5 w-9 px-0.5 cursor-pointer rounded-full shrink-0',
        'border border-border-interactive bg-surface-raised',
        'data-[checked]:bg-accent data-[checked]:border-accent',
        'outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-1 focus-visible:ring-offset-bg',
        'data-[disabled]:cursor-not-allowed data-[disabled]:opacity-disabled',
        'transition-colors duration-fast',
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          'size-4 rounded-full shrink-0',
          'bg-control-thumb shadow-sm' /* invariant white token — contrast holds on all track tones */,
          thumbIcon ? 'flex items-center justify-center' : null,
          'data-[checked]:translate-x-4',
          'transition-transform duration-fast'
        )}
      >
        {thumbIcon}
      </SwitchPrimitive.Thumb>
    </SwitchPrimitive.Root>
  );
}
