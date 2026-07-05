import { useCallback, useState } from 'react';

/**
 * Reactive localStorage binding with the same signature as `useState`.
 *
 * Reads the initial value from localStorage once on mount (SSR-safe).
 * Writes synchronously on every `setValue` call — no `useEffect` delay.
 * Values are JSON-serialised; falls back to `defaultValue` on parse errors.
 *
 * @param key - localStorage key
 * @param defaultValue - returned when the key is absent or the stored value is invalid
 * @returns `[value, setValue]`
 */
export function useLocalStorage<T>(key: string, defaultValue: T): [T, (value: T) => void] {
  const [value, setValueState] = useState<T>(() => {
    if (typeof localStorage === 'undefined') return defaultValue;
    const stored = localStorage.getItem(key);
    if (stored === null) return defaultValue;
    try {
      return JSON.parse(stored) as T;
    } catch {
      return defaultValue;
    }
  });

  const setValue = useCallback(
    (next: T) => {
      setValueState(next);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(next));
      }
    },
    [key]
  );

  return [value, setValue];
}
