import type { Theme } from './ThemeContext';

/** Cookie key for SSR theme resolution — written on every theme change. */
export const THEME_COOKIE = 'decksmith-theme';

/** Theme applied on first visit (no cookie yet). Dark-first brand. */
export const DEFAULT_THEME: Theme = 'dark';

export const VALID_THEMES: readonly Theme[] = ['light', 'dark'] as const;

/**
 * Parse a theme value from a raw cookie string.
 *
 * Pure function — does not access document.cookie itself.
 * Used server-side (root loader via getCookie) and client-side (getClientTheme in __root.tsx).
 *
 * @param cookieStr - Raw cookie string (e.g. `document.cookie` or a Cookie request header).
 * @returns The stored theme, or `DEFAULT_THEME` if absent or invalid.
 */
export function parseThemeFromCookieString(cookieStr: string): Theme {
  const match = cookieStr.match(new RegExp(`(?:^|;\\s*)${THEME_COOKIE}=([^;]+)`));
  const value = match?.[1];
  return (VALID_THEMES as readonly string[]).includes(value ?? '')
    ? (value as Theme)
    : DEFAULT_THEME;
}
