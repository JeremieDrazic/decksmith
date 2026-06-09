import type { UpdateUserInput, User } from '@decksmith/schema/user/user';
import type { UpdatePreferencesInput, UserPreferences } from '@decksmith/schema/user/preferences';

import type { Fetcher } from '../../fetcher/fetcher.js';

/**
 * Creates the users module — all functions for the `/api/v1/users` routes.
 *
 * @param fetcher - Pre-configured fetch wrapper from `createFetcher`.
 */
export function createUsersModule(fetcher: Fetcher) {
  return {
    /**
     * Get a user's public profile.
     *
     * @param id - Supabase Auth user ID.
     */
    getUser: (id: string): Promise<User> => fetcher({ method: 'GET', path: `/api/v1/users/${id}` }),

    /**
     * Update the current user's profile (displayName, username, avatarUrl).
     *
     * Only the authenticated user can update their own profile.
     *
     * @param id - Supabase Auth user ID.
     * @param input - Fields to update (all optional).
     */
    updateUser: (id: string, input: UpdateUserInput): Promise<User> =>
      fetcher({ method: 'PATCH', path: `/api/v1/users/${id}`, body: input }),

    /**
     * Get the current user's preferences (theme, language, currency, etc.).
     *
     * @param id - Supabase Auth user ID.
     */
    getUserPreferences: (id: string): Promise<UserPreferences> =>
      fetcher({ method: 'GET', path: `/api/v1/users/${id}/preferences` }),

    /**
     * Update the current user's preferences.
     *
     * All fields are optional — only the provided fields are updated.
     *
     * @param id - Supabase Auth user ID.
     * @param input - Preference fields to update.
     */
    updateUserPreferences: (id: string, input: UpdatePreferencesInput): Promise<UserPreferences> =>
      fetcher({ method: 'PATCH', path: `/api/v1/users/${id}/preferences`, body: input }),
  };
}
