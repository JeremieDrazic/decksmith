/**
 * Invariant system heights for interactive controls (buttons, inputs, selects, toggles).
 * All interactive elements align to the same vertical rhythm — this is the single source
 * of truth for that rhythm. Values map directly to Tailwind's spacing scale.
 *
 * Use h-* from this map in cva size variants. Never hardcode raw h-6/h-8/h-9/h-11.
 */
export const CONTROL_HEIGHT = {
  xs: 'h-6', // 24px
  sm: 'h-8', // 32px
  md: 'h-9', // 36px
  lg: 'h-11', // 44px
} as const;
