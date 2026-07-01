import * as React from 'react';

import { Drawer as DrawerPrimitive } from '@base-ui/react/drawer';

import { cn } from '../../lib/cn';
import {
  NavigationButton,
  type NavigationButtonVariant,
} from '../NavigationButton/NavigationButton';
import { DRAWER_BACKDROP_ANIMATION, DRAWER_PANEL_ANIMATION } from './animations';
import type {
  DrawerCloseProps,
  DrawerContentProps,
  DrawerDescriptionProps,
  DrawerFooterProps,
  DrawerProps,
  DrawerSide,
  DrawerTitleProps,
  DrawerTriggerProps,
} from './types';

export type {
  DrawerCloseIcon,
  DrawerCloseProps,
  DrawerContentProps,
  DrawerDescriptionProps,
  DrawerFooterProps,
  DrawerProps,
  DrawerSide,
  DrawerTitleProps,
  DrawerTriggerProps,
} from './types';

// ─── Internal layout maps ──────────────────────────────────────────────────────
//
// Layout constants (not design tokens) — same convention as CONTROL_HEIGHT /
// ICON_SIZE maps in packages/web-ui/src/lib/sizing/.

/** Maps DrawerSide to the swipeDirection expected by Drawer.Root. */
const SIDE_TO_SWIPE = {
  top: 'up',
  right: 'right',
  bottom: 'down',
  left: 'left',
} as const satisfies Record<DrawerSide, DrawerPrimitive.Root.Props['swipeDirection']>;

/**
 * Viewport alignment per edge.
 * The Viewport is `fixed inset-0 flex` — alignment classes push the Popup to the
 * correct edge without any positioning on the Popup itself.
 */
const VIEWPORT_ALIGN: Record<DrawerSide, string> = {
  top: 'items-start justify-stretch',
  right: 'justify-end items-stretch',
  bottom: 'items-end justify-stretch',
  left: 'justify-start items-stretch',
};

/**
 * Popup size + inner-edge border + rounded corner per side.
 * max-h/max-w caps prevent the panel from covering the full screen on large viewports.
 */
const POPUP_SIDE: Record<DrawerSide, string> = {
  top: 'w-full max-h-[85dvh] border-b rounded-b-modal',
  right: 'h-full w-full max-w-md border-l rounded-l-modal',
  bottom: 'w-full max-h-[85dvh] border-t rounded-t-modal',
  left: 'h-full w-full max-w-md border-r rounded-r-modal',
};

/**
 * Directional close icon per edge (opt-in via closeIcon="directional").
 * Chevron points toward the exit edge: left → ← (back), right → → (forward).
 * top/bottom fall back to X because NavigationButton has no vertical chevrons.
 * aria-label stays "Close" regardless of the icon.
 */
const DIRECTIONAL_CLOSE: Record<DrawerSide, NavigationButtonVariant> = {
  left: 'back',
  right: 'forward',
  top: 'close',
  bottom: 'close',
};

// ─── Internal context ─────────────────────────────────────────────────────────
//
// `side` is declared once on <Drawer> and shared to <DrawerContent> via context
// so the consumer never has to repeat it. Not exported — internal only.

const DrawerSideContext = React.createContext<DrawerSide>('right');

// ─── Drawer (Root) ────────────────────────────────────────────────────────────

/**
 * Root state container for the drawer. Manages open state, swipe direction,
 * and snap points. `modal=true` by default: focus trap + scroll lock.
 *
 * `side` is the single source of truth for positioning — it drives both the
 * CSS alignment in `DrawerContent` (via internal context) and the `swipeDirection`
 * forwarded to Base UI. Do not pass `swipeDirection` directly.
 *
 * All other Base UI root props pass through: `open`, `onOpenChange`,
 * `onOpenChangeComplete`, `snapPoints`, `snapPoint`, `actionsRef`, `handle`, etc.
 *
 * @example Uncontrolled — trigger-driven
 * <Drawer side="right">
 *   <DrawerTrigger render={<Button />}>Open</DrawerTrigger>
 *   <DrawerContent>
 *     <DrawerTitle>Details</DrawerTitle>
 *   </DrawerContent>
 * </Drawer>
 *
 * @example Controlled — external state + snap points
 * <Drawer side="bottom" open={open} onOpenChange={setOpen} snapPoints={[0.4, 1]}>
 *   <DrawerContent showCloseButton={false}>
 *     <DrawerTitle>Add card</DrawerTitle>
 *     <DrawerFooter>
 *       <DrawerClose render={<Button variant="ghost" />}>Cancel</DrawerClose>
 *     </DrawerFooter>
 *   </DrawerContent>
 * </Drawer>
 */
export function Drawer({ side = 'right', modal = true, children, ...props }: DrawerProps) {
  return (
    <DrawerSideContext.Provider value={side}>
      <DrawerPrimitive.Root modal={modal} swipeDirection={SIDE_TO_SWIPE[side]} {...props}>
        {children}
      </DrawerPrimitive.Root>
    </DrawerSideContext.Provider>
  );
}

// ─── DrawerTrigger ────────────────────────────────────────────────────────────

/**
 * The element that opens the drawer on click. Optional — omit when controlling
 * the drawer from external state. Pass `render={<Button />}` to merge props.
 */
export function DrawerTrigger(props: DrawerTriggerProps) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />;
}

// ─── DrawerContent ────────────────────────────────────────────────────────────

/**
 * The drawer panel, backdrop, and viewport — rendered via Portal.
 * Structure: `Portal → Backdrop + Viewport( Popup )`.
 *
 * The Viewport (`fixed inset-0 flex`) is the positioning container; alignment
 * classes push the Popup to the correct edge. The Popup carries size, inner-edge
 * border/radius, and the swipe + snap transform. Reads `side` from the nearest
 * `<Drawer>` via internal context — do not pass `side` here directly.
 *
 * @example With directional close icon
 * <DrawerContent closeIcon="directional">
 *   <DrawerTitle>Card details</DrawerTitle>
 *   <DrawerDescription>Select a print to add to your deck.</DrawerDescription>
 *   <DrawerFooter>
 *     <DrawerClose render={<Button variant="ghost" />}>Cancel</DrawerClose>
 *     <Button>Add to deck</Button>
 *   </DrawerFooter>
 * </DrawerContent>
 */
export function DrawerContent({
  className,
  children,
  showCloseButton = true,
  closeIcon = 'close',
  ...props
}: DrawerContentProps) {
  const side = React.useContext(DrawerSideContext);
  const navVariant = closeIcon === 'directional' ? DIRECTIONAL_CLOSE[side] : 'close';

  return (
    <DrawerPrimitive.Portal>
      <DrawerPrimitive.Backdrop
        data-slot="drawer-backdrop"
        className={cn('fixed inset-0 z-overlay bg-scrim', DRAWER_BACKDROP_ANIMATION)}
      />
      <DrawerPrimitive.Viewport
        data-slot="drawer-viewport"
        className={cn('fixed inset-0 z-modal flex', VIEWPORT_ALIGN[side])}
      >
        <DrawerPrimitive.Popup
          data-slot="drawer-content"
          className={cn(
            'relative flex flex-col overflow-y-auto outline-none',
            'border-border bg-surface p-6 shadow-overlay',
            POPUP_SIDE[side],
            DRAWER_PANEL_ANIMATION[side],
            className
          )}
          {...props}
        >
          {showCloseButton ? (
            <DrawerPrimitive.Close
              data-slot="drawer-close-button"
              render={<NavigationButton variant={navVariant} aria-label="Close" size="sm" />}
              className="absolute right-4 top-4"
            />
          ) : null}
          {children}
        </DrawerPrimitive.Popup>
      </DrawerPrimitive.Viewport>
    </DrawerPrimitive.Portal>
  );
}

// ─── DrawerTitle ──────────────────────────────────────────────────────────────

/**
 * The accessible title of the drawer. Required for WCAG — Base UI wires
 * `aria-labelledby` automatically when this component is present.
 */
export function DrawerTitle({ className, ...props }: DrawerTitleProps) {
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      className={cn('mb-1 text-base font-semibold leading-snug text-text', className)}
      {...props}
    />
  );
}

// ─── DrawerDescription ────────────────────────────────────────────────────────

/**
 * An accessible description of the drawer. Base UI wires `aria-describedby`
 * automatically when this component is present.
 */
export function DrawerDescription({ className, ...props }: DrawerDescriptionProps) {
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={cn('text-sm text-text-muted', className)}
      {...props}
    />
  );
}

// ─── DrawerClose ──────────────────────────────────────────────────────────────

/**
 * A bare close primitive for use in `DrawerFooter`. Pass `render={<Button />}` to style it.
 * The built-in corner close button is separate (see `showCloseButton` on `DrawerContent`).
 *
 * @example
 * <DrawerFooter>
 *   <DrawerClose render={<Button variant="ghost" />}>Cancel</DrawerClose>
 *   <Button>Confirm</Button>
 * </DrawerFooter>
 */
export function DrawerClose(props: DrawerCloseProps) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />;
}

// ─── DrawerFooter ─────────────────────────────────────────────────────────────

/**
 * Action row at the bottom of the drawer. Lays out buttons right-aligned with
 * a gap. Typically contains a `DrawerClose` (cancel) and a primary action.
 *
 * @example
 * <DrawerFooter>
 *   <DrawerClose render={<Button variant="ghost" />}>Cancel</DrawerClose>
 *   <Button>Add to deck</Button>
 * </DrawerFooter>
 */
export function DrawerFooter({ className, ...props }: DrawerFooterProps) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn('mt-6 flex justify-end gap-2', className)}
      {...props}
    />
  );
}
