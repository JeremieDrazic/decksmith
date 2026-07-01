import type { ComponentProps } from 'react';

import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';

import { cn } from '../../lib/cn';
import { NavigationButton } from '../NavigationButton/NavigationButton';
import { BACKDROP_ANIMATION, DIALOG_ANIMATION } from '../../lib/floating/animations';

// ─── Dialog (Root) ───────────────────────────────────────────────────────────

export type DialogProps = DialogPrimitive.Root.Props;

/**
 * Root state container for a modal dialog.
 * `modal=true` by default: focus trap + scroll lock + outside-click dismiss.
 *
 * **Manager-ready**: all Base UI root props are forwarded without being swallowed —
 * `open`, `onOpenChange`, `onOpenChangeComplete`, `actionsRef`, and `handle` all
 * pass through. A trigger is optional: the dialog can be driven by external state
 * alone (`<Dialog open={open} onOpenChange={setOpen}>`).
 *
 * @example Uncontrolled (trigger-driven)
 * <Dialog>
 *   <DialogTrigger render={<Button />}>Open</DialogTrigger>
 *   <DialogContent><DialogTitle>…</DialogTitle></DialogContent>
 * </Dialog>
 *
 * @example Controlled (manager-ready, no trigger)
 * <Dialog open={open} onOpenChange={setOpen}>
 *   <DialogContent><DialogTitle>…</DialogTitle></DialogContent>
 * </Dialog>
 */
export function Dialog({ modal = true, ...props }: DialogProps) {
  return <DialogPrimitive.Root modal={modal} {...props} />;
}

// ─── DialogTrigger ───────────────────────────────────────────────────────────

export type DialogTriggerProps = DialogPrimitive.Trigger.Props;

/**
 * The element that opens the dialog on click. Optional — omit when controlling
 * the dialog from external state. Pass `render={<Button />}` to merge props.
 */
export function DialogTrigger(props: DialogTriggerProps) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

// ─── DialogContent ───────────────────────────────────────────────────────────

export type DialogContentProps = DialogPrimitive.Popup.Props & {
  /**
   * Whether to render the built-in close button in the top-right corner.
   * @default true
   */
  showCloseButton?: boolean;
};

/**
 * The dialog panel and its backdrop, rendered via Portal.
 * Structure: `Portal → Backdrop + Popup`.
 *
 * The Popup is centred with CSS fixed positioning (no Positioner — dialogs are
 * not anchored to a trigger element). `max-h-[calc(100dvh-2rem)]` + `overflow-y-auto`
 * prevent overflow on small screens.
 *
 * @example
 * <DialogContent>
 *   <DialogTitle>Delete deck</DialogTitle>
 *   <DialogDescription>This action cannot be undone.</DialogDescription>
 *   <DialogFooter>
 *     <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
 *     <Button variant="destructive">Delete</Button>
 *   </DialogFooter>
 * </DialogContent>
 */
export function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: DialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Backdrop
        data-slot="dialog-backdrop"
        className={cn('fixed inset-0 z-overlay bg-scrim', BACKDROP_ANIMATION)}
      />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        className={cn(
          'fixed left-1/2 top-1/2 z-modal -translate-x-1/2 -translate-y-1/2',
          'w-full max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto',
          'rounded-modal border border-border bg-surface p-6 shadow-overlay',
          DIALOG_ANIMATION,
          className
        )}
        {...props}
      >
        {showCloseButton ? (
          <DialogPrimitive.Close
            data-slot="dialog-close-button"
            render={<NavigationButton variant="close" size="sm" />}
            className="absolute right-4 top-4"
          />
        ) : null}
        {children}
      </DialogPrimitive.Popup>
    </DialogPrimitive.Portal>
  );
}

// ─── DialogTitle ─────────────────────────────────────────────────────────────

export type DialogTitleProps = DialogPrimitive.Title.Props;

/**
 * The accessible title of the dialog. Required for WCAG — Base UI wires
 * `aria-labelledby` automatically when this component is present.
 */
export function DialogTitle({ className, ...props }: DialogTitleProps) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn('mb-1 text-base font-semibold leading-snug text-text', className)}
      {...props}
    />
  );
}

// ─── DialogDescription ───────────────────────────────────────────────────────

export type DialogDescriptionProps = DialogPrimitive.Description.Props;

/**
 * An accessible description of the dialog. Base UI wires `aria-describedby`
 * automatically when this component is present.
 */
export function DialogDescription({ className, ...props }: DialogDescriptionProps) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn('text-sm text-text-muted', className)}
      {...props}
    />
  );
}

// ─── DialogClose ─────────────────────────────────────────────────────────────

export type DialogCloseProps = DialogPrimitive.Close.Props;

/**
 * A button that closes the dialog. Pass `render={<Button />}` to style it.
 * Used in `DialogFooter` for cancel/dismiss actions.
 *
 * @example
 * <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
 */
export function DialogClose(props: DialogCloseProps) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

// ─── DialogFooter ────────────────────────────────────────────────────────────

export type DialogFooterProps = ComponentProps<'div'>;

/**
 * Action row at the bottom of the dialog. Lays out buttons right-aligned with
 * a gap. Typically contains a `DialogClose` (cancel) and a primary action.
 *
 * @example
 * <DialogFooter>
 *   <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
 *   <Button>Confirm</Button>
 * </DialogFooter>
 */
export function DialogFooter({ className, ...props }: DialogFooterProps) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn('mt-6 flex justify-end gap-2', className)}
      {...props}
    />
  );
}
