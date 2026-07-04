import { useState } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HeadContent, Outlet, Scripts, createRootRoute } from '@tanstack/react-router';
import { ApiClientProvider } from '@decksmith/query';

import { apiClient } from '../lib/api-client';
import '../styles/globals.css';
import '../i18n';

function Root() {
  // One QueryClient per component instance = one per SSR request, one per browser session.
  // Module-scope instantiation shares a single cache across all requests, leaking one
  // user's data into another's response (see TanStack Query SSR guide).
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000 } } })
  );

  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <ApiClientProvider client={apiClient}>
            <Outlet />
          </ApiClientProvider>
        </QueryClientProvider>
        <Scripts />
      </body>
    </html>
  );
}

export const Route = createRootRoute({
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
