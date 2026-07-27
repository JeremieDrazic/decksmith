import type { FormEvent } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { makeSubmitHandler } from './make-submit-handler';

function fakeEvent() {
  return {
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
  } as unknown as FormEvent<HTMLFormElement>;
}

describe('makeSubmitHandler', () => {
  it('prevents default, stops propagation, and calls handleSubmit', () => {
    const handleSubmit = vi.fn();
    const event = fakeEvent();

    makeSubmitHandler(handleSubmit)(event);

    expect(event.preventDefault).toHaveBeenCalledOnce();
    expect(event.stopPropagation).toHaveBeenCalledOnce();
    expect(handleSubmit).toHaveBeenCalledOnce();
  });

  it('does not throw when handleSubmit returns a promise', () => {
    const handleSubmit = vi.fn(() => Promise.resolve());
    const event = fakeEvent();

    expect(() => makeSubmitHandler(handleSubmit)(event)).not.toThrow();
  });
});
