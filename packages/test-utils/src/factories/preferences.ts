import type { UserPreferences } from '@decksmith/schema/user/preferences';

/**
 * Builds a valid UserPreferences object with sensible defaults.
 *
 * Override only the fields relevant to your test — all other fields stay valid.
 *
 * @example
 * buildUserPreferences()
 * buildUserPreferences({ theme: 'light' })
 * buildUserPreferences({ userId: 'specific-user-id' })
 */
export function buildUserPreferences(overrides?: Partial<UserPreferences>): UserPreferences {
  return {
    id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    userId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    language: 'en',
    units: 'mm',
    defaultCurrency: 'usd',
    defaultPrintSelection: 'latest',
    theme: 'dark',
    collectionViewConfig: {
      viewMode: 'grid',
      visibleColumns: [],
      sortDirection: 'asc',
      binderCardsPerPage: 9,
    },
    notificationPreferences: {
      emailOnPdfReady: true,
    },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}
