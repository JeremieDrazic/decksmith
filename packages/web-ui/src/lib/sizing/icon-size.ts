/**
 * Square sizes for inline icons and visual indicators.
 * These are smaller than interactive controls — they sit inline within text or UI chrome,
 * never as standalone tap targets.
 *
 * xs — text-sm contexts (menu items, compact badges) — matches 14px line height
 * sm — standard inline icons (button labels, list items, breadcrumbs)
 * md — prominent icons (card headers, section markers)
 * lg — large icons (empty states, avatars, hero elements)
 *
 * For IconButton icon slots, see the internal `iconSizeMap` in IconButton.tsx
 * which uses `[&>svg]:size-*` selectors and mirrors this scale.
 */
export const ICON_SIZE = {
  xs: 'size-3.5', // 14px × 14px — inline with text-sm
  sm: 'size-4', // 16px × 16px
  md: 'size-5', // 20px × 20px
  lg: 'size-6', // 24px × 24px
} as const;
