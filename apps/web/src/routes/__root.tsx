import { useState } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HeadContent, Outlet, Scripts, createRootRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { ApiClientProvider } from '@decksmith/query';
import { ThemeProvider } from '@decksmith/web-ui';

import { apiClient } from '../lib/api-client';
import i18n, { LANGUAGE_COOKIE, SUPPORTED_LANGUAGES, parseLangFromCookieString } from '../i18n';
import '../styles/globals.css';

// Reads the language cookie from the HTTP request on the server.
// createServerFn handlers run directly during SSR (no HTTP round-trip);
// on the client the call is guarded by typeof window so it is never invoked.
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

function Root() {
  const { lang } = Route.useLoaderData();

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
    const lang = typeof window === 'undefined' ? await $getServerLanguage() : getClientLanguage();
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
