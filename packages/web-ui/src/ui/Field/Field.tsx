'use client';

import { useMemo } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../../lib/cn';

// ─── FieldGroup ───────────────────────────────────────────────────────────────

export type FieldGroupProps = React.ComponentProps<'div'>;

/**
 * Vertical stack of Fields with consistent spacing. Use as the form body.
 *
 * @example
 * <FieldGroup>
 *   <Field>…</Field>
 *   <Field>…</Field>
 * </FieldGroup>
 */
export function FieldGroup({ className, ...props }: FieldGroupProps) {
  return (
    <div
      data-slot="field-group"
      className={cn('flex w-full flex-col gap-5', className)}
      {...props}
    />
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────

const fieldVariants = cva(
  ['group/field flex w-full gap-2', 'data-[invalid=true]:text-error-text'],
  {
    variants: {
      orientation: {
        vertical: 'flex-col *:w-full [&>.sr-only]:w-auto',
        horizontal:
          'flex-row items-center *:data-[slot=field-label]:flex-auto has-[>[data-slot=field-content]]:items-start',
      },
    },
    defaultVariants: {
      orientation: 'vertical',
    },
  }
);

export type FieldProps = React.ComponentProps<'div'> &
  VariantProps<typeof fieldVariants> & {
    /** Marks the field as invalid — cascades error color to label and activates FieldError. */
    invalid?: boolean;
    /** Marks the field as disabled — cascades opacity to label and description. */
    disabled?: boolean;
  };

/**
 * A labeled form field container. Propagates `invalid` and `disabled` state to
 * child components (FieldLabel, FieldDescription, FieldError) via data attributes
 * and CSS group selectors.
 *
 * @example
 * <Field invalid={!!errors.email} disabled={isSubmitting}>
 *   <FieldLabel htmlFor="email">Email</FieldLabel>
 *   <Input id="email" type="email" aria-invalid={!!errors.email} />
 *   <FieldError errors={errors.email} />
 * </Field>
 */
export function Field({
  className,
  orientation = 'vertical',
  invalid,
  disabled,
  ...props
}: FieldProps) {
  return (
    <div
      role="group"
      data-slot="field"
      data-orientation={orientation}
      data-invalid={invalid ? 'true' : undefined}
      data-disabled={disabled ? 'true' : undefined}
      className={cn(fieldVariants({ orientation }), className)}
      {...props}
    />
  );
}

// ─── FieldLabel ───────────────────────────────────────────────────────────────

export type FieldLabelProps = React.ComponentProps<'label'>;

/**
 * Accessible label for the field control.
 * Pass `htmlFor` matching the control's `id`, or let TanStack Form wire it.
 *
 * @example
 * <FieldLabel htmlFor="deck-name">Deck name</FieldLabel>
 */
export function FieldLabel({ className, ...props }: FieldLabelProps) {
  return (
    // eslint-disable-next-line jsx-a11y/label-has-associated-control -- htmlFor is passed by callers via ...props
    <label
      data-slot="field-label"
      className={cn(
        'flex w-fit items-center gap-2',
        'font-mono text-xs leading-xs tracking-wide uppercase font-semibold text-text-muted',
        'group-data-[disabled=true]/field:opacity-[0.38]',
        'group-data-[invalid=true]/field:text-error-text',
        className
      )}
      {...props}
    />
  );
}

// ─── FieldDescription ─────────────────────────────────────────────────────────

export type FieldDescriptionProps = React.ComponentProps<'p'>;

/**
 * Secondary help text displayed below the control.
 * Stays muted even in invalid state — the FieldError conveys the problem.
 *
 * @example
 * <FieldDescription>Use a strong password with at least 8 characters.</FieldDescription>
 */
export function FieldDescription({ className, ...props }: FieldDescriptionProps) {
  return (
    <p
      data-slot="field-description"
      className={cn(
        'text-sm text-text-muted leading-snug',
        'group-data-[disabled=true]/field:opacity-[0.38]',
        className
      )}
      {...props}
    />
  );
}

// ─── FieldError ───────────────────────────────────────────────────────────────

export type FieldErrorProps = React.ComponentProps<'div'> & {
  /**
   * Error strings from TanStack Form (`field.state.meta.errors`).
   * Deduplicates by message and renders a list when there are multiple.
   * Ignored when `children` is provided.
   */
  errors?: (string | undefined)[];
};

/**
 * Error message for the field. Renders nothing when there is no content.
 * Accepts either static `children` or `errors` from TanStack Form.
 *
 * @example
 * <FieldError>{field.state.meta.errors[0]}</FieldError>
 *
 * @example
 * <FieldError errors={field.state.meta.errors} />
 */
export function FieldError({ className, children, errors, ...props }: FieldErrorProps) {
  const content = useMemo(() => {
    if (children) return children;
    if (!errors?.length) return null;

    const unique = [...new Set(errors.filter(Boolean))] as string[];
    if (unique.length === 0) return null;

    return unique.length === 1 ? (
      unique[0]
    ) : (
      <ul className="ml-4 flex list-disc flex-col gap-1">
        {unique.map((msg) => (
          <li key={msg}>{msg}</li>
        ))}
      </ul>
    );
  }, [children, errors]);

  return content ? (
    <div
      role="alert"
      data-slot="field-error"
      className={cn('text-sm font-normal text-error-text', className)}
      {...props}
    >
      {content}
    </div>
  ) : null;
}
