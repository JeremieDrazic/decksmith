import { useSyncExternalStore } from 'react';

import { noop } from '@decksmith/utils';

const query = '(prefers-reduced-motion: reduce)';

function subscribe(callback: () => void): () => void {
  if (!('matchMedia' in globalThis)) return noop;
  const mql = globalThis.matchMedia(query);
  mql.addEventListener('change', callback);
  return () => mql.removeEventListener('change', callback);
}

function getSnapshot(): boolean {
  return 'matchMedia' in globalThis && globalThis.matchMedia(query).matches;
}

// matchMedia doesn't exist on the server — default to false (animations enabled).
function getServerSnapshot(): boolean {
  return false;
}

/**
 * Returns true when the user has requested reduced motion at the OS level.
 * Reactive — re-renders the component if the preference changes during the session.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
