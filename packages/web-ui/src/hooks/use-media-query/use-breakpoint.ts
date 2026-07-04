import { BREAKPOINTS } from './breakpoints';
import { useMediaQuery } from './use-media-query';

export type Breakpoint = {
  /** true when viewport < 768px — bottom navigation layout */
  isMobile: boolean;
  /** true when 768px ≤ viewport < 1024px */
  isTablet: boolean;
  /** true when viewport ≥ 1024px — collapsed sidebar layout */
  isDesktop: boolean;
};

/**
 * Returns the current viewport breakpoint category.
 * Exactly one of `isMobile`, `isTablet`, `isDesktop` is true at any time.
 * Reactive — updates on resize when a threshold is crossed, without a page reload.
 *
 * For custom queries, use `useMediaQuery` directly.
 *
 * @example
 * const { isMobile, isDesktop } = useBreakpoint();
 */
export function useBreakpoint(): Breakpoint {
  const isMd = useMediaQuery(BREAKPOINTS.md);
  const isLg = useMediaQuery(BREAKPOINTS.lg);

  return {
    isMobile: !isMd,
    isTablet: isMd && !isLg,
    isDesktop: isLg,
  };
}
