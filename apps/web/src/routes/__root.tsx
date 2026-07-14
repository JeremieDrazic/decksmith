import { useState } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
  useLoaderData,
} from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { ApiClientProvider } from '@decksmith/query';
import {
  ThemeProvider,
  THEME_COOKIE,
  DEFAULT_THEME,
  VALID_THEMES,
  parseThemeFromCookieString,
  type Theme,
} from '@decksmith/web-ui';

import { apiClient } from '../lib/api-client';
import i18n, { LANGUAGE_COOKIE, SUPPORTED_LANGUAGES, parseLangFromCookieString } from '../i18n';
import '../styles/globals.css';

// Reads the language cookie from the HTTP request on the server.
// createServerFn handlers run directly during SSR (no HTTP round-trip);
// on the client the call is guarded by globalThis.window so it is never invoked.
const $getServerLanguage = createServerFn({ method: 'GET' }).handler(async () => {
  const { getCookie } = await import('@tanstack/react-start/server');
  const stored = getCookie(LANGUAGE_COOKIE);
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(stored ?? '')
    ? (stored as string)
    : 'en';
});

function getClientLanguage(): string {
  return parseLangFromCookieString(document.cookie);
}

// Reads the theme cookie from the HTTP request on the server.
// getCookie returns the cookie value directly (not the full cookie string), so we validate
// it against VALID_THEMES — same pattern as $getServerLanguage with SUPPORTED_LANGUAGES.
const $getServerTheme = createServerFn({ method: 'GET' }).handler(async (): Promise<Theme> => {
  const { getCookie } = await import('@tanstack/react-start/server');
  const stored = getCookie(THEME_COOKIE);
  return (VALID_THEMES as readonly string[]).includes(stored ?? '')
    ? (stored as Theme)
    : DEFAULT_THEME;
});

function getClientTheme(): Theme {
  return parseThemeFromCookieString(document.cookie);
}

function Root() {
  const { lang, theme } = useLoaderData({ from: '__root__' });

  // On the server, i18n.ts initialises with 'en' (no document). The loader resolves
  // the real language from the cookie, and this call corrects the singleton before the
  // component tree renders. Resources are pre-loaded, so changeLanguage is synchronous.
  // On the client, getInitialLanguage() already reads the cookie, so this is a no-op.
  if (i18n.language !== lang) {
    void i18n.changeLanguage(lang);
  }

  // One QueryClient per component instance = one per SSR request, one per browser session.
  // Module-scope instantiation shares a single cache across all requests, leaking one
  // user's data into another's response (see TanStack Query SSR guide).
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000 } } })
  );

  return (
    <html lang={lang} className={theme === 'dark' ? 'dark' : undefined}>
      <head>
        <HeadContent />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <ApiClientProvider client={apiClient}>
            <ThemeProvider initialTheme={theme}>
              <Outlet />
            </ThemeProvider>
          </ApiClientProvider>
        </QueryClientProvider>
        <Scripts />
      </body>
    </html>
  );
}

export const Route = createRootRoute({
  loader: async () => {
    const lang = globalThis.window === undefined ? await $getServerLanguage() : getClientLanguage();
    const theme = globalThis.window === undefined ? await $getServerTheme() : getClientTheme();
    return { lang, theme };
  },
  head: () => ({
    meta: [
      { charSet: 'utf8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Decksmith' },
    ],
    links: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
  }),
  component: Root,
});
