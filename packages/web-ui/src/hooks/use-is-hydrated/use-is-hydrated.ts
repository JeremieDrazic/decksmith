import { useSyncExternalStore } from 'react';

import { noop } from '@decksmith/utils';

/**
 * False on the server and during the first client render, true forever after.
 *
 * Lets a component render exactly what the server sent on the first paint — so
 * React's hydration never mismatches — then safely diverge on the next render,
 * which is the one that can correct a value the server could not know (viewport
 * width, `localStorage`, `matchMedia`).
 *
 * Implemented with `useSyncExternalStore`: its server snapshot is `false`, its
 * client snapshot is `true`, and React flips between them on the post-hydration
 * commit without a warning. The store never changes, so `subscribe` is a no-op.
 *
 * @example
 * const isHydrated = useIsHydrated();
 * const docked = isHydrated ? measured : seededFromCookie;
 */
export function useIsHydrated(): boolean {
  return useSyncExternalStore(
    () => noop,
    () => true,
    () => false
  );
}
