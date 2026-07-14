import { useCallback, useState, type ReactNode } from 'react';

import { DEFAULT_THEME, THEME_COOKIE } from './theme-cookie';
import { ThemeContext, type Theme } from './ThemeContext';

/**
 * Provides theme state (light/dark) to the component tree.
 *
 * - `initialTheme` comes from the root loader, which reads `THEME_COOKIE` server-side.
 *   Server and client start from the same value — no hydration mismatch.
 * - The `.dark` class on `<html>` is rendered server-side (in __root.tsx) and updated
 *   synchronously in `setTheme` on user interaction — no useEffect needed.
 * - On first visit (no cookie yet), `initialTheme` is undefined and `DEFAULT_THEME` applies.
 *
 * @example
 * <ThemeProvider initialTheme={loaderData.theme}>
 *   <App />
 * </ThemeProvider>
 */
export function ThemeProvider({
  children,
  initialTheme,
}: {
  children: ReactNode;
  initialTheme?: Theme;
}) {
  const [theme, setThemeState] = useState<Theme>(initialTheme ?? DEFAULT_THEME);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    document.documentElement.classList.toggle('dark', next === 'dark');
    // oxlint-disable-next-line unicorn/no-document-cookie -- intentional write; Cookie Store API not viable for sync context
    document.cookie = `${THEME_COOKIE}=${next}; path=/; max-age=31536000; SameSite=Lax`;
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
