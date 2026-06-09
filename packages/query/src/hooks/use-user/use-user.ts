import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { isApiError, type ErrorCode } from '@decksmith/api-client/errors';
import type { User } from '@decksmith/schema/user/user';

import { useApiClient } from '../../context/context.js';

/**
 * Query key factory for user detail queries.
 *
 * Use for cache invalidation after mutations:
 * `queryClient.invalidateQueries({ queryKey: userKeys.detail(id) })`
 */
export const userKeys = {
  detail: (id: string) => ['user', id] as const,
};

type UseUserResult = UseQueryResult<User, Error> & {
  /** Typed error code from the API, or null if the error is not an ApiError. */
  errorCode: ErrorCode | null;
};

/**
 * Fetches a user's public profile and keeps it in the TanStack Query cache.
 *
 * The query is disabled when `id` is undefined — safe to call before the
 * authenticated user's ID is known (e.g. during initial app hydration).
 *
 * @param id - Supabase Auth user ID, or undefined if not yet known.
 */
export function useUser(id: string | undefined): UseUserResult {
  const client = useApiClient();

  const query = useQuery<User, Error>({
    queryKey: id ? userKeys.detail(id) : ['user'],
    queryFn: () => {
      if (!id) throw new Error('useUser: id is required');
      return client.users.getUser(id);
    },
    enabled: !!id,
  });

  return {
    ...query,
    errorCode: isApiError(query.error) ? (query.error.code as ErrorCode) : null,
  };
}
