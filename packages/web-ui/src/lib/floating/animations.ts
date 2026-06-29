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

/** Fade only — Dialog backdrop */
export const BACKDROP_ANIMATION = [
  'transition-opacity duration-slow ease-out',
  'data-[starting-style]:opacity-0',
  'data-[ending-style]:opacity-0',
] as const;

/** Height expand/collapse — Collapsible panel.
 *  --collapsible-panel-height is a runtime measurement set by Base UI on the
 *  panel element itself — not a design token, so [height:var(...)] is correct here. */
export const COLLAPSIBLE_ANIMATION = [
  'overflow-hidden transition-[height] duration-normal ease-out',
  '[height:var(--collapsible-panel-height)]',
  'data-[starting-style]:[height:0]',
  'data-[ending-style]:[height:0]',
] as const;
