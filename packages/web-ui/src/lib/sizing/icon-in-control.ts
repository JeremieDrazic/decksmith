/**
 * Icon sizes for icon-only controls (IconButton, IconToggle).
 * The icon fills ~50% of the square tap target — enough to be readable without feeling cramped.
 *
 * Applied as a descendant selector with an escape hatch:
 *   [&_svg:not([class*="size-"])]:size-X
 * A caller can override with an explicit size class: <Icon className="size-7" />
 *
 * xs — 12px icon in a 24px square
 * sm — 16px icon in a 32px square
 * md — 20px icon in a 36px square (default)
 * lg — 24px icon in a 44px square
 *
 * For icons inline with text see ICON_INLINE. For self-rendered icons (Spinner, RarityBadge)
 * that receive a `size` prop directly, see ICON_SIZE.
 */
export const ICON_IN_CONTROL = {
  xs: '[&_svg:not([class*="size-"])]:size-3',
  sm: '[&_svg:not([class*="size-"])]:size-4',
  md: '[&_svg:not([class*="size-"])]:size-5',
  lg: '[&_svg:not([class*="size-"])]:size-6',
} as const;
