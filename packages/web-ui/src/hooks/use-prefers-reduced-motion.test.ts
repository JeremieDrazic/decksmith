import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { usePrefersReducedMotion } from './use-prefers-reduced-motion';

/** Stubs globalThis.matchMedia with a controllable `matches` + change listener. */
function setupMatchMedia(initialMatches: boolean) {
  let matches = initialMatches;
  const listeners: (() => void)[] = [];

  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => ({
      get matches() {
        return matches;
      },
      addEventListener: (_e: string, cb: () => void) => listeners.push(cb),
      removeEventListener: (_e: string, cb: () => void) => {
        const i = listeners.indexOf(cb);
        if (i !== -1) listeners.splice(i, 1);
      },
    }))
  );

  return {
    set(next: boolean) {
      matches = next;
      for (const cb of listeners) cb();
    },
  };
}

describe('usePrefersReducedMotion', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns false when the user has not requested reduced motion', () => {
    setupMatchMedia(false);

    const { result } = renderHook(() => usePrefersReducedMotion());

    expect(result.current).toBe(false);
  });

  it('returns true when reduced motion is requested', () => {
    setupMatchMedia(true);

    const { result } = renderHook(() => usePrefersReducedMotion());

    expect(result.current).toBe(true);
  });

  it('reacts to a preference change during the session', () => {
    const mm = setupMatchMedia(false);
    const { result } = renderHook(() => usePrefersReducedMotion());

    expect(result.current).toBe(false);

    act(() => {
      mm.set(true);
    });

    expect(result.current).toBe(true);
  });
});
