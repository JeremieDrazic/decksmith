/**
 * Shared animation class strings for floating UI components.
 * All use Base UI's data-[starting-style] / data-[ending-style] attributes.
 * Spread into cn() alongside component-specific classes.
 */

/** Scale + fade, ease-out — Tooltip, Popover, DropdownMenu, ContextMenu */
export const POPUP_ANIMATION = [
  'transition-[opacity,transform] duration-normal ease-out',
  'data-[starting-style]:opacity-0 data-[starting-style]:[transform:scale(0.95)]',
  'data-[ending-style]:opacity-0 data-[ending-style]:[transform:scale(0.95)]',
] as const;

/** Scale + fade, ease-spring — Dialog panel */
export const DIALOG_ANIMATION = [
  'transition-[opacity,transform] duration-slow ease-spring',
  'data-[starting-style]:opacity-0 data-[starting-style]:[transform:scale(0.96)]',
  'data-[ending-style]:opacity-0 data-[ending-style]:[transform:scale(0.96)]',
] as const;

/** Fade only — Dialog backdrop, Drawer backdrop */
export const BACKDROP_ANIMATION = [
  'transition-opacity duration-slow ease-out',
  'data-[starting-style]:opacity-0',
  'data-[ending-style]:opacity-0',
] as const;
