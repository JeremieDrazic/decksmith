import { useContext } from 'react';

import { ThemeContext } from './ThemeContext';

/**
 * Returns the current theme and controls to change it.
 *
 * Must be used within a `<ThemeProvider>`.
 */
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (ctx === null) throw new Error('useTheme must be used within a <ThemeProvider>');
  return ctx;
}
