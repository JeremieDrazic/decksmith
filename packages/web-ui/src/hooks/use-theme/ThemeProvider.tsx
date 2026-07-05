import { useCallback, useEffect, type ReactNode } from 'react';

import { useLocalStorage } from '../use-local-storage';
import { useMediaQuery } from '../use-media-query';
import { ThemeContext, type Theme } from './ThemeContext';

const STORAGE_KEY = 'decksmith-theme';

function resolveTheme(stored: Theme | null, prefersDark: boolean): Theme {
  if (stored !== null) return stored;
  return prefersDark ? 'dark' : 'light';
}

/**
 * Provides theme state (light/dark) to the component tree.
 *
 * - Initial value: `localStorage` → falls back to `prefers-color-scheme`
 * - Syncs the `.dark` class on `<html>` on every theme change
 * - Add `suppressHydrationWarning` to `<html>` to silence the SSR/client class mismatch,
 *   and include the anti-FOUC inline script in `<head>` to prevent a flash on first paint
 *
 * @example
 * <ThemeProvider>
 *   <App />
 * </ThemeProvider>
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [stored, setStored] = useLocalStorage<Theme | null>(STORAGE_KEY, null);
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');

  const theme = resolveTheme(stored, prefersDark);

  const setTheme = useCallback(
    (next: Theme) => {
      setStored(next);
    },
    [setStored]
  );

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
