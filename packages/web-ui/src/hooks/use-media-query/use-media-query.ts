import { useCallback, useSyncExternalStore } from 'react';

import { noop } from '@decksmith/utils';

/**
 * Returns true when the viewport matches the given CSS media query string.
 * Reactive — re-renders when the match state changes (breakpoint crossed), not on every pixel.
 *
 * Defaults to `false` on the server (no `matchMedia`) — keeps SSR hydration stable.
 *
 * @example
 * const isLarge = useMediaQuery('(min-width: 1024px)');
 *
 * @example
 * import { BREAKPOINTS } from './breakpoints';
 * const isLarge = useMediaQuery(BREAKPOINTS.lg);
 */
export function useMediaQuery(query: string): boolean {
  // Memoized by query — React only re-subscribes when the query string changes.
  const subscribe = useCallback(
    (callback: () => void) => {
      if (!(typeof globalThis.matchMedia === 'function')) return noop;
      const mql = globalThis.matchMedia(query);
      mql.addEventListener('change', callback);
      return () => mql.removeEventListener('change', callback);
    },
    [query]
  );

  return useSyncExternalStore(
    subscribe,
    () => typeof globalThis.matchMedia === 'function' && globalThis.matchMedia(query).matches,
    () => false
  );
}
