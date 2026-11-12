import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useIsHydrated } from './use-is-hydrated';

/** A component whose only output is the hook's current value, as text. */
function Probe() {
  return String(useIsHydrated());
}

describe('useIsHydrated', () => {
  it('is true on the client after mount (happy path)', () => {
    const { result } = renderHook(() => useIsHydrated());
    expect(result.current).toBe(true);
  });

  it('stays true across re-renders — no flip-flop', () => {
    const { result, rerender } = renderHook(() => useIsHydrated());
    rerender();
    expect(result.current).toBe(true);
  });

  it('is false during server rendering (the markup must match on the first client render)', () => {
    expect(renderToStaticMarkup(createElement(Probe))).toBe('false');
  });
});
