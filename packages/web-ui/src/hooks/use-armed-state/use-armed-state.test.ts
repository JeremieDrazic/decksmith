import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useArmedState } from './use-armed-state';

describe('useArmedState', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts unarmed', () => {
    const { result } = renderHook(() => useArmedState(3000, vi.fn()));
    expect(result.current.armed).toBe(false);
  });

  it('arms on the first click', () => {
    const { result } = renderHook(() => useArmedState(3000, vi.fn()));
    act(() => {
      result.current.handleArmOrConfirm();
    });
    expect(result.current.armed).toBe(true);
  });

  it('calls onDelete and resets on the second click', () => {
    const onDelete = vi.fn();
    const { result } = renderHook(() => useArmedState(3000, onDelete));

    act(() => {
      result.current.handleArmOrConfirm();
    });
    act(() => {
      result.current.handleArmOrConfirm();
    });

    expect(onDelete).toHaveBeenCalledOnce();
    expect(result.current.armed).toBe(false);
  });

  it('resets to idle after timeout without calling onDelete', () => {
    const onDelete = vi.fn();
    const { result } = renderHook(() => useArmedState(3000, onDelete));

    act(() => {
      result.current.handleArmOrConfirm();
    });
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.armed).toBe(false);
    expect(onDelete).not.toHaveBeenCalled();
  });

  it('does not double-reset when confirming before timeout expires', () => {
    const onDelete = vi.fn();
    const { result } = renderHook(() => useArmedState(1000, onDelete));

    act(() => {
      result.current.handleArmOrConfirm();
    });
    act(() => {
      result.current.handleArmOrConfirm();
    });
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(onDelete).toHaveBeenCalledOnce();
    expect(result.current.armed).toBe(false);
  });

  it('clears the timer on unmount without throwing', () => {
    const { result, unmount } = renderHook(() => useArmedState(3000, vi.fn()));
    act(() => {
      result.current.handleArmOrConfirm();
    });
    expect(() => unmount()).not.toThrow();
    expect(() => {
      act(() => {
        vi.advanceTimersByTime(3000);
      });
    }).not.toThrow();
  });
});
