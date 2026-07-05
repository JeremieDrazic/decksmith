import { useState } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HeadContent, Outlet, Scripts, createRootRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { useTranslation } from 'react-i18next';
import { ApiClientProvider } from '@decksmith/query';
import { ThemeProvider } from '@decksmith/web-ui';

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

// Runs synchronously before React hydrates — sets .dark on <html> from localStorage
// or prefers-color-scheme so the first paint matches the user's preference (no FOUC).
// useLocalStorage JSON-stringifies values, so localStorage stores '"light"' not 'light'.
// Parse before comparing, and guard with try/catch in case localStorage is blocked.
const ANTI_FOUC_SCRIPT = `(function(){
  try{
    var raw=localStorage.getItem('decksmith-theme');
    var s=raw?JSON.parse(raw):null;
    var p=window.matchMedia('(prefers-color-scheme: dark)').matches;
    if(s==='dark'||(s!=='light'&&p)){document.documentElement.classList.add('dark');}
  }catch(e){}
})();`;

// Root reads language from i18n directly (not Route.useLoaderData) to avoid a
// circular reference: Route → component: Root → Root → Route.useLoaderData.
// The loader calls i18n.changeLanguage before this component renders, so the value
// is always up-to-date. useTranslation subscribes to subsequent language switches.
function Root() {
  const { i18n: i18nInstance } = useTranslation();
  const lang = i18nInstance.language;

  // One QueryClient per component instance = one per SSR request, one per browser session.
  // Module-scope instantiation shares a single cache across all requests, leaking one
  // user's data into another's response (see TanStack Query SSR guide).
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000 } } })
  );

  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        {/* oxlint-disable-next-line react/no-danger -- controlled anti-FOUC script, no user input */}
        <script dangerouslySetInnerHTML={{ __html: ANTI_FOUC_SCRIPT }} />
        <HeadContent />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <ApiClientProvider client={apiClient}>
            <ThemeProvider>
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
    if (i18n.language !== lang) {
      void i18n.changeLanguage(lang);
    }
    return { lang };
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
