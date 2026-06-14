import * as React from 'react';

import { cn } from '../../lib/cn';

export type TextareaProps = React.ComponentProps<'textarea'>;

/**
 * Multi-line text input. Auto-sizes to content via field-sizing-content.
 * Error state is expressed via aria-invalid — set it from the form library.
 *
 * @example
 * <Textarea placeholder="Describe your deck strategy…" />
 *
 * @example
 * <Textarea aria-invalid={!!errors.notes} rows={4} />
 */
export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'flex field-sizing-content min-h-16 w-full',
        'rounded-interactive border border-border bg-transparent',
        'px-3 py-2 text-sm text-text',
        'placeholder:text-text-faint',
        'transition-[border-color,box-shadow] duration-fast outline-none',
        'focus-visible:border-border-focus focus-visible:ring-2 focus-visible:ring-border-focus',
        'focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
        'disabled:cursor-not-allowed disabled:opacity-[0.38]',
        'aria-invalid:border-error aria-invalid:ring-2 aria-invalid:ring-error/20',
        className
      )}
      {...props}
    />
  );
}
