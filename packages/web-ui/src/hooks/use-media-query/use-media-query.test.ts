import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useBreakpoint } from './use-breakpoint';
import { useMediaQuery } from './use-media-query';

// ─── Mock helpers ─────────────────────────────────────────────────────────────

/**
 * Stubs globalThis.matchMedia with a controllable implementation.
 * Supports multiple concurrent queries (needed by useBreakpoint).
 */
function setupMatchMedia(initialState: Record<string, boolean>) {
  const state = { ...initialState };
  const listeners = new Map<string, (() => void)[]>();

  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => {
      if (!listeners.has(query)) listeners.set(query, []);
      return {
        get matches() {
          return state[query] ?? false;
        },
        addEventListener: vi.fn((_event: string, cb: () => void) => {
          listeners.get(query)?.push(cb);
        }),
        removeEventListener: vi.fn((_event: string, cb: () => void) => {
          const list = listeners.get(query) ?? [];
          const idx = list.indexOf(cb);
          if (idx !== -1) list.splice(idx, 1);
        }),
      };
    })
  );

  return {
    /** Update match state and fire 'change' listeners for the given query. */
    setMatches: (query: string, value: boolean) => {
      state[query] = value;
      for (const cb of listeners.get(query) ?? []) cb();
    },
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

// ─── useMediaQuery ────────────────────────────────────────────────────────────

describe('useMediaQuery', () => {
  it('returns false when matchMedia is unavailable (SSR)', () => {
    const { result } = renderHook(() => useMediaQuery('(min-width: 1024px)'));
    expect(result.current).toBe(false);
  });

  it('returns true when query matches on mount', () => {
    setupMatchMedia({ '(min-width: 1024px)': true });
    const { result } = renderHook(() => useMediaQuery('(min-width: 1024px)'));
    expect(result.current).toBe(true);
  });

  it('returns false when query does not match on mount', () => {
    setupMatchMedia({ '(min-width: 1024px)': false });
    const { result } = renderHook(() => useMediaQuery('(min-width: 1024px)'));
    expect(result.current).toBe(false);
  });

  it('updates when match state changes', () => {
    const { setMatches } = setupMatchMedia({ '(min-width: 1024px)': false });
    const { result } = renderHook(() => useMediaQuery('(min-width: 1024px)'));

    expect(result.current).toBe(false);

    act(() => {
      setMatches('(min-width: 1024px)', true);
    });

    expect(result.current).toBe(true);
  });

  it('cleans up the listener on unmount', () => {
    setupMatchMedia({ '(min-width: 1024px)': false });
    const { unmount } = renderHook(() => useMediaQuery('(min-width: 1024px)'));
    expect(() => unmount()).not.toThrow();
  });
});

// ─── useBreakpoint ────────────────────────────────────────────────────────────

describe('useBreakpoint', () => {
  const MD = '(min-width: 768px)';
  const LG = '(min-width: 1024px)';

  it('isMobile when viewport is below md', () => {
    setupMatchMedia({ [MD]: false, [LG]: false });
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current).toEqual({ isMobile: true, isTablet: false, isDesktop: false });
  });

  it('isTablet when viewport is between md and lg', () => {
    setupMatchMedia({ [MD]: true, [LG]: false });
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current).toEqual({ isMobile: false, isTablet: true, isDesktop: false });
  });

  it('isDesktop when viewport is at or above lg', () => {
    setupMatchMedia({ [MD]: true, [LG]: true });
    const { result } = renderHook(() => useBreakpoint());
    expect(result.current).toEqual({ isMobile: false, isTablet: false, isDesktop: true });
  });

  it('transitions from mobile to desktop reactively', () => {
    const { setMatches } = setupMatchMedia({ [MD]: false, [LG]: false });
    const { result } = renderHook(() => useBreakpoint());

    expect(result.current.isMobile).toBe(true);

    act(() => {
      setMatches(MD, true);
      setMatches(LG, true);
    });

    expect(result.current).toEqual({ isMobile: false, isTablet: false, isDesktop: true });
  });
});
