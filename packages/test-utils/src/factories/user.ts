import type { User } from '@decksmith/schema/user/user';

/**
 * Builds a valid User object with sensible defaults.
 *
 * Override only the fields relevant to your test — all other fields stay valid.
 *
 * @example
 * buildUser()                       // full user with defaults
 * buildUser({ username: null })     // user who hasn't completed their profile
 * buildUser({ id: 'specific-id' }) // user with a known ID
 */
export function buildUser(overrides?: Partial<User>): User {
  return {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    email: 'user@example.com',
    username: 'testuser',
    displayName: 'Test User',
    avatarUrl: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}
