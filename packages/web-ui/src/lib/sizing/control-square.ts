/**
 * Invariant square sizes for icon-only interactive controls (IconButton, IconToggle).
 * Sets both width and height via Tailwind's `size-*` utility (CSS `width + height` shorthand).
 * Values align with CONTROL_HEIGHT so icon-only controls match text control heights exactly.
 */
export const CONTROL_SQUARE = {
  xs: 'size-6', // 24px × 24px
  sm: 'size-8', // 32px × 32px
  md: 'size-9', // 36px × 36px
  lg: 'size-11', // 44px × 44px
} as const;
