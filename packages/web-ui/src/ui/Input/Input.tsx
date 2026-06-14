import { Input as InputPrimitive } from '@base-ui/react/input';
import * as React from 'react';

import { cn } from '../../lib/cn';

export type InputProps = React.ComponentProps<'input'>;

/**
 * Single-line text input. Error state via aria-invalid — set from the form library.
 * Use InputGroupInput inside InputGroup to strip border/radius.
 *
 * @example
 * <Input type="email" placeholder="you@example.com" />
 *
 * @example
 * <Input aria-invalid={!!errors.name} aria-describedby="name-error" />
 */
export function Input({ className, type, ...props }: InputProps) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        'h-9 w-full min-w-0',
        'rounded-interactive border border-border bg-transparent',
        'px-3 py-1 text-sm text-text',
        'placeholder:text-text-faint',
        'transition-[border-color,box-shadow] duration-fast outline-none',
        'focus-visible:border-border-focus focus-visible:ring-2 focus-visible:ring-border-focus',
        'focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
        'disabled:cursor-not-allowed disabled:opacity-[0.38]',
        'aria-invalid:border-error aria-invalid:ring-2 aria-invalid:ring-error/20',
        'file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-text',
        className
      )}
      {...props}
    />
  );
}
