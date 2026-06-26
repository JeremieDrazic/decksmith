/**
 * Square sizes for self-rendered icons — components that own their icon and expose a `size` prop
 * (Spinner, RarityBadge, ManaSymbol). The class is applied directly to the icon element, not via
 * a descendant selector.
 *
 * xs — 14px — text-sm contexts (menu items, compact badges)
 * sm — 16px — mana pips, compact indicators
 * md — 20px — default — rarity badges, inline icons
 * lg — 24px — prominent icons, avatars, hero elements
 *
 * This is one of three icon sizing tables (see ADR-0021):
 *   ICON_SIZE        — self-rendered icon with a `size` prop (this file)
 *   ICON_IN_CONTROL  — icon fills a square tap target (IconButton, IconToggle)
 *   ICON_INLINE      — icon beside a text label (Button, Toggle)
 */
export const ICON_SIZE = {
  xs: 'size-3.5', // 14px × 14px — inline with text-sm
  sm: 'size-4', // 16px × 16px
  md: 'size-5', // 20px × 20px
  lg: 'size-6', // 24px × 24px
} as const;
