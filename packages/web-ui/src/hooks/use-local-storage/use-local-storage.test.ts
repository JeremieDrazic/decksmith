import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { useLocalStorage } from './use-local-storage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('returns the default value when the key is absent', () => {
    const { result } = renderHook(() => useLocalStorage('theme', 'dark'));

    expect(result.current[0]).toBe('dark');
  });

  it('reads and parses an existing stored value', () => {
    localStorage.setItem('count', JSON.stringify(42));

    const { result } = renderHook(() => useLocalStorage('count', 0));

    expect(result.current[0]).toBe(42);
  });

  it('falls back to the default when the stored value is invalid JSON', () => {
    localStorage.setItem('theme', '{not valid json');

    const { result } = renderHook(() => useLocalStorage('theme', 'light'));

    expect(result.current[0]).toBe('light');
  });

  it('updates state and writes to localStorage on setValue', () => {
    const { result } = renderHook(() => useLocalStorage('theme', 'dark'));

    act(() => {
      result.current[1]('light');
    });

    expect(result.current[0]).toBe('light');
    expect(localStorage.getItem('theme')).toBe(JSON.stringify('light'));
  });
});
