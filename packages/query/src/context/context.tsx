import { createContext, useContext, type ReactNode } from 'react';

import type { ApiClient } from '@decksmith/api-client';

const ApiClientContext = createContext<ApiClient | null>(null);

/**
 * Provides the API client to all hooks in this package.
 *
 * Place this once near the root of the app, after `QueryClientProvider`.
 *
 * @example
 * <QueryClientProvider client={queryClient}>
 *   <ApiClientProvider client={apiClient}>
 *     <App />
 *   </ApiClientProvider>
 * </QueryClientProvider>
 */
export function ApiClientProvider({
  client,
  children,
}: {
  client: ApiClient;
  children: ReactNode;
}) {
  return <ApiClientContext.Provider value={client}>{children}</ApiClientContext.Provider>;
}

/**
 * Internal hook — reads the ApiClient from context.
 *
 * Not exported from index.ts. Only used by hooks inside this package.
 * Throws a clear error if called outside of ApiClientProvider.
 */
export function useApiClient(): ApiClient {
  const client = useContext(ApiClientContext);
  if (client === null) {
    throw new Error('useApiClient must be used within an <ApiClientProvider>');
  }
  return client;
}
