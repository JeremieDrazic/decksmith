import type { PrismaUserPreferences } from '@decksmith/db';

/**
 * Builds a valid PrismaUserPreferences object with sensible defaults.
 *
 * Use this when mocking `prisma.userPreferences.findUnique` or `prisma.userPreferences.update`.
 *
 * @param overrides - Fields to override from the defaults
 */
export function buildPrismaPreferences(
  overrides?: Partial<PrismaUserPreferences>
): PrismaUserPreferences {
  return {
    id: 'c3d4e5f6-a7b8-4012-8def-123456789012',
    userId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    language: 'en',
    units: 'mm',
    defaultCurrency: 'eur',
    defaultPrintSelection: 'latest',
    theme: 'system',
    collectionViewConfig: {},
    notificationPreferences: {},
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}
