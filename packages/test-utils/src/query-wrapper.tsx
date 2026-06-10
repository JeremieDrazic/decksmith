import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode } from 'react';

/**
 * Creates a React wrapper component with a fresh QueryClient for each test.
 *
 * Each call creates an isolated QueryClient — tests do not share cache state.
 * `retry: false` prevents TanStack Query from retrying failed requests,
 * which would slow down error-path tests.
 *
 * Compose with additional providers in the consuming package:
 * @example
 * function createWrapper() {
 *   const QueryWrapper = createQueryWrapper();
 *   return ({ children }: { children: ReactNode }) => (
 *     <QueryWrapper>
 *       <ApiClientProvider client={apiClient}>{children}</ApiClientProvider>
 *     </QueryWrapper>
 *   );
 * }
 */
export function createQueryWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return function QueryWrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}
