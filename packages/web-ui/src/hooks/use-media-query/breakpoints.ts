/**
 * CSS media query strings aligned with Tailwind v4 default breakpoints.
 * Pass directly to `useMediaQuery` or use `useBreakpoint` for the semantic shortcuts.
 */
export const BREAKPOINTS = {
  sm: '(min-width: 640px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 1024px)',
  xl: '(min-width: 1280px)',
  '2xl': '(min-width: 1536px)',
} as const;
