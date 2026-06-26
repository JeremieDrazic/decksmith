'use client';

import type { ComponentProps } from 'react';

import { AlertDialog as AlertDialogPrimitive } from '@base-ui/react/alert-dialog';

import { cn } from '../../lib/cn';
import { BACKDROP_ANIMATION, DIALOG_ANIMATION } from '../../lib/floating/animations';

// ─── AlertDialog (Root) ──────────────────────────────────────────────────────

export type AlertDialogProps = AlertDialogPrimitive.Root.Props;

/**
 * Root state container for an alert dialog — a blocking confirmation that
 * requires an explicit user action to dismiss.
 *
 * Differences from `Dialog`:
 * - Always modal, always non-dismissible (no `modal` / `disablePointerDismissal` props).
 * - No built-in close button — the user must interact with the footer actions.
 * - Use for destructive or irreversible actions (delete, leave with unsaved changes, etc.).
 *
 * **Manager-ready**: `open`, `onOpenChange`, `onOpenChangeComplete`, `actionsRef`, and
 * `handle` all forward through the root without being swallowed.
 */
export function AlertDialog(props: AlertDialogProps) {
  return <AlertDialogPrimitive.Root {...props} />;
}

// ─── AlertDialogTrigger ──────────────────────────────────────────────────────

export type AlertDialogTriggerProps = AlertDialogPrimitive.Trigger.Props;

/**
 * The element that opens the alert dialog. Optional when controlling from
 * external state. Pass `render={<Button />}` to merge props.
 */
export function AlertDialogTrigger(props: AlertDialogTriggerProps) {
  return <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />;
}

// ─── AlertDialogContent ──────────────────────────────────────────────────────

export type AlertDialogContentProps = AlertDialogPrimitive.Popup.Props;

/**
 * The alert dialog panel and its backdrop, rendered via Portal.
 * No close button — the consumer must provide explicit cancel/confirm actions
 * via `AlertDialogFooter` + `AlertDialogClose`.
 *
 * @example
 * <AlertDialogContent>
 *   <AlertDialogTitle>Delete deck</AlertDialogTitle>
 *   <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
 *   <AlertDialogFooter>
 *     <AlertDialogClose render={<Button variant="ghost" />}>Cancel</AlertDialogClose>
 *     <Button variant="destructive">Delete</Button>
 *   </AlertDialogFooter>
 * </AlertDialogContent>
 */
export function AlertDialogContent({ className, children, ...props }: AlertDialogContentProps) {
  return (
    <AlertDialogPrimitive.Portal>
      <AlertDialogPrimitive.Backdrop
        data-slot="alert-dialog-backdrop"
        className={cn('fixed inset-0 z-overlay bg-scrim', BACKDROP_ANIMATION)}
      />
      <AlertDialogPrimitive.Popup
        data-slot="alert-dialog-content"
        className={cn(
          'fixed left-1/2 top-1/2 z-modal -translate-x-1/2 -translate-y-1/2',
          'w-full max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto',
          'rounded-modal border border-border bg-surface p-6 shadow-overlay',
          DIALOG_ANIMATION,
          className
        )}
        {...props}
      >
        {children}
      </AlertDialogPrimitive.Popup>
    </AlertDialogPrimitive.Portal>
  );
}

// ─── AlertDialogTitle ────────────────────────────────────────────────────────

export type AlertDialogTitleProps = AlertDialogPrimitive.Title.Props;

/**
 * The accessible title of the alert dialog. Required for WCAG — Base UI wires
 * `aria-labelledby` automatically when this component is present.
 */
export function AlertDialogTitle({ className, ...props }: AlertDialogTitleProps) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn('mb-1 text-base font-semibold leading-snug text-text', className)}
      {...props}
    />
  );
}

// ─── AlertDialogDescription ──────────────────────────────────────────────────

export type AlertDialogDescriptionProps = AlertDialogPrimitive.Description.Props;

/**
 * An accessible description of the alert dialog. Base UI wires `aria-describedby`
 * automatically when this component is present.
 */
export function AlertDialogDescription({ className, ...props }: AlertDialogDescriptionProps) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn('text-sm text-text-muted', className)}
      {...props}
    />
  );
}

// ─── AlertDialogClose ────────────────────────────────────────────────────────

export type AlertDialogCloseProps = AlertDialogPrimitive.Close.Props;

/**
 * A button that closes the alert dialog. Always pass `render={<Button />}`.
 * Typically used as the "Cancel" action in the footer.
 *
 * @example
 * <AlertDialogClose render={<Button variant="ghost" />}>Cancel</AlertDialogClose>
 */
export function AlertDialogClose(props: AlertDialogCloseProps) {
  return <AlertDialogPrimitive.Close data-slot="alert-dialog-close" {...props} />;
}

// ─── AlertDialogFooter ───────────────────────────────────────────────────────

export type AlertDialogFooterProps = ComponentProps<'div'>;

/**
 * Action row at the bottom of the alert dialog. Must contain at least one
 * explicit dismiss action (`AlertDialogClose`) — the alert cannot be dismissed
 * any other way (no close button, no outside-click, no Escape key).
 *
 * @example
 * <AlertDialogFooter>
 *   <AlertDialogClose render={<Button variant="ghost" />}>Cancel</AlertDialogClose>
 *   <Button variant="destructive">Delete</Button>
 * </AlertDialogFooter>
 */
export function AlertDialogFooter({ className, ...props }: AlertDialogFooterProps) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn('mt-6 flex justify-end gap-2', className)}
      {...props}
    />
  );
}
