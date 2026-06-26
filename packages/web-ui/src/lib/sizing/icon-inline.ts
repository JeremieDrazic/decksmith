/**
 * Icon sizes for controls that show an icon beside a text label (Button, Toggle, InputGroupButton).
 * The icon aligns visually with the cap height of the label — slightly larger than the font-size.
 *
 * Applied as a descendant selector with an escape hatch:
 *   [&_svg:not([class*="size-"])]:size-X
 * A caller can override with an explicit size class: <Icon className="size-6" />
 *
 * xs — 14px icon beside text-xs (12px font) in a h-6 control
 * sm — 16px icon beside text-xs (12px font) in a h-8 control
 * md — 16px icon beside text-sm (14px font) in a h-9 control (default)
 * lg — 20px icon beside text-base (16px font) in a h-11 control
 *
 * For icon-only controls (IconButton, IconToggle) see ICON_IN_CONTROL. For self-rendered icons
 * (Spinner, RarityBadge) that receive a `size` prop directly, see ICON_SIZE.
 */
export const ICON_INLINE = {
  xs: '[&_svg:not([class*="size-"])]:size-3.5',
  sm: '[&_svg:not([class*="size-"])]:size-4',
  md: '[&_svg:not([class*="size-"])]:size-4',
  lg: '[&_svg:not([class*="size-"])]:size-5',
} as const;
