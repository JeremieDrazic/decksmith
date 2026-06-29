import type { ComponentProps } from 'react';

import type { Drawer as DrawerPrimitive } from '@base-ui/react/drawer';

/** Which edge the drawer slides from. @default 'right' */
export type DrawerSide = 'top' | 'right' | 'bottom' | 'left';

/** Whether the built-in close button shows a fixed X or a directional chevron. */
export type DrawerCloseIcon = 'close' | 'directional';

/**
 * Root props forwarded to Base UI — `swipeDirection` is derived from `side`
 * and therefore omitted to avoid duplication.
 */
export type DrawerProps = Omit<DrawerPrimitive.Root.Props, 'swipeDirection'> & {
  /**
   * Which edge the drawer slides from.
   * @default 'right'
   */
  side?: DrawerSide;
};

export type DrawerTriggerProps = DrawerPrimitive.Trigger.Props;

export type DrawerContentProps = DrawerPrimitive.Popup.Props & {
  /**
   * Whether to render the built-in close button in the top-right corner.
   * @default true
   */
  showCloseButton?: boolean;
  /**
   * Icon style for the built-in close button.
   * - `'close'`: always shows an X (same as Dialog).
   * - `'directional'`: chevron pointing toward the exit edge (left=←, right=→).
   *   `aria-label` stays "Close" regardless of the icon.
   * @default 'close'
   */
  closeIcon?: DrawerCloseIcon;
};

export type DrawerTitleProps = DrawerPrimitive.Title.Props;

export type DrawerDescriptionProps = DrawerPrimitive.Description.Props;

export type DrawerCloseProps = DrawerPrimitive.Close.Props;

export type DrawerFooterProps = ComponentProps<'div'>;
