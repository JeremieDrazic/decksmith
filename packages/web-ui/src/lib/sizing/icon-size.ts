/**
 * Square sizes for inline icons and visual indicators (mana pips, rarity badges, avatars).
 * These are smaller than interactive controls — they sit inline within text or UI chrome,
 * never as standalone tap targets.
 */
export const ICON_SIZE = {
  sm: 'size-4', // 16px × 16px
  md: 'size-5', // 20px × 20px
  lg: 'size-6', // 24px × 24px
} as const;
