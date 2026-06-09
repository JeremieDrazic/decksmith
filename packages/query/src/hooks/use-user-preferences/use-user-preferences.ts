import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { isApiError, type ErrorCode } from '@decksmith/api-client/errors';
import type { UserPreferences } from '@decksmith/schema/user/preferences';

import { useApiClient } from '../../context/context.js';

/**
 * Query key factory for user preferences queries.
 *
 * Nested under the user key so `queryClient.invalidateQueries({ queryKey: ['user', id] })`
 * also invalidates preferences for that user.
 */
export const userPreferencesKeys = {
  detail: (id: string) => ['user', id, 'preferences'] as const,
};

type UseUserPreferencesResult = UseQueryResult<UserPreferences, Error> & {
  /** Typed error code from the API, or null if the error is not an ApiError. */
  errorCode: ErrorCode | null;
};

/**
 * Fetches the current user's preferences and keeps them in the TanStack Query cache.
 *
 * The query is disabled when `id` is undefined — safe to call before the
 * authenticated user's ID is known.
 *
 * @param id - Supabase Auth user ID, or undefined if not yet known.
 */
export function useUserPreferences(id: string | undefined): UseUserPreferencesResult {
  const client = useApiClient();

  const query = useQuery<UserPreferences, Error>({
    queryKey: id ? userPreferencesKeys.detail(id) : ['user', 'preferences'],
    queryFn: () => {
      if (!id) throw new Error('useUserPreferences: id is required');
      return client.users.getUserPreferences(id);
    },
    enabled: !!id,
  });

  return {
    ...query,
    errorCode: isApiError(query.error) ? (query.error.code as ErrorCode) : null,
  };
}
