import type { PrismaUser } from '@decksmith/db';

/**
 * Builds a valid PrismaUser object with sensible defaults.
 *
 * Use this when mocking `prisma.user.findUnique` or `prisma.user.update`.
 * For asserting API response shapes, use `buildUser` from `@decksmith/test-utils` instead
 * (it returns the DTO type with ISO strings, not Date objects).
 *
 * @param overrides - Fields to override from the defaults
 */
export function buildPrismaUser(overrides?: Partial<PrismaUser>): PrismaUser {
  return {
    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    email: 'user@example.com',
    username: 'testuser',
    displayName: 'Test User',
    avatarUrl: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}
