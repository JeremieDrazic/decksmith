import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useKeyboardShortcut } from './use-keyboard-shortcut';

function press(key: string, modifiers: Partial<KeyboardEventInit> = {}) {
  // tinykeys requires event.code to be non-empty before processing.
  const code = key.length === 1 ? `Key${key.toUpperCase()}` : key;
  globalThis.dispatchEvent(
    new KeyboardEvent('keydown', { key, code, bubbles: true, ...modifiers })
  );
}

describe('useKeyboardShortcut', () => {
  it('fires callback when shortcut matches', () => {
    const callback = vi.fn();
    renderHook(() => useKeyboardShortcut('Control+k', callback));
    press('k', { ctrlKey: true });
    expect(callback).toHaveBeenCalledOnce();
  });

  it('does not fire for a non-matching key', () => {
    const callback = vi.fn();
    renderHook(() => useKeyboardShortcut('Control+k', callback));
    press('j', { ctrlKey: true });
    expect(callback).not.toHaveBeenCalled();
  });

  it('does not fire when enabled is false', () => {
    const callback = vi.fn();
    renderHook(() => useKeyboardShortcut('Control+k', callback, { enabled: false }));
    press('k', { ctrlKey: true });
    expect(callback).not.toHaveBeenCalled();
  });

  it('fires for any shortcut in an array', () => {
    const callback = vi.fn();
    renderHook(() => useKeyboardShortcut(['Control+k', 'Meta+k'], callback));
    press('k', { ctrlKey: true });
    press('k', { metaKey: true });
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('does not fire after unmount', () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useKeyboardShortcut('Control+k', callback));
    unmount();
    press('k', { ctrlKey: true });
    expect(callback).not.toHaveBeenCalled();
  });

  it('always calls the latest callback without re-subscribing', () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = renderHook(({ cb }) => useKeyboardShortcut('Control+k', cb), {
      initialProps: { cb: first },
    });
    rerender({ cb: second });
    press('k', { ctrlKey: true });
    expect(second).toHaveBeenCalledOnce();
    expect(first).not.toHaveBeenCalled();
  });
});
