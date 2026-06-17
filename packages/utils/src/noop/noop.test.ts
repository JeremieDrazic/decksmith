import { describe, expect, it, vi } from 'vitest';

import { noop } from './noop';

describe('noop', () => {
  it('returns undefined', () => {
    expect(noop()).toBeUndefined();
  });

  it('can be used as a callback without throwing', () => {
    expect(() => {
      for (const _ of [1, 2, 3]) noop();
    }).not.toThrow();
  });

  it('is referentially stable across calls', () => {
    const spy = vi.fn(noop);
    spy();
    spy();
    expect(spy).toHaveBeenCalledTimes(2);
  });
});
