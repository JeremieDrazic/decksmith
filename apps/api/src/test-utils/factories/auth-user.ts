import type { AuthUser } from '@decksmith/db';

/**
 * Builds a minimal Supabase AuthUser object with sensible defaults.
 *
 * Use this when mocking `supabase.auth.signUp` or `supabase.auth.getUser`.
 *
 * @param overrides - Fields to override from the defaults
 */
export function buildAuthUser(overrides?: Partial<AuthUser>): AuthUser {
  return {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    email: 'user@example.com',
    aud: 'authenticated',
    app_metadata: {},
    user_metadata: { username: 'testuser' },
    created_at: '2026-01-01T00:00:00.000Z',
    ...overrides,
  } as AuthUser;
}
