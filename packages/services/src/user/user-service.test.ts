import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@decksmith/db', () => import('../__mocks__/db.js'));

import { Prisma, prisma } from '@decksmith/db';
import {
  getUserById,
  getUserPreferences,
  updateUser,
  updateUserPreferences,
} from './user-service.js';

// ---------------------------------------------------------------------------
// Factories
// ---------------------------------------------------------------------------

function buildPrismaUser(overrides?: Record<string, unknown>) {
  return {
    id: 'user-id-123',
    email: 'user@example.com',
    username: 'testuser',
    displayName: 'Test User',
    avatarUrl: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}

function buildPrismaPreferences(overrides?: Record<string, unknown>) {
  return {
    id: 'pref-id-456',
    userId: 'user-id-123',
    language: 'en',
    units: 'mm',
    defaultCurrency: 'eur',
    defaultPrintSelection: 'latest',
    theme: 'system',
    collectionViewConfig: { layout: 'grid' },
    notificationPreferences: { email: true },
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.resetAllMocks();
});

// ---------------------------------------------------------------------------
// getUserById
// ---------------------------------------------------------------------------

describe('getUserById', () => {
  it('returns the user when found', async () => {
    const user = buildPrismaUser();
    vi.mocked(prisma.user.findUnique).mockResolvedValue(user as never);

    const result = await getUserById('user-id-123');

    expect(result.id).toBe('user-id-123');
  });

  it('throws USER_NOT_FOUND when user does not exist', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    await expect(getUserById('missing-id')).rejects.toMatchObject({ code: 'USER_NOT_FOUND' });
  });
});

// ---------------------------------------------------------------------------
// updateUser
// ---------------------------------------------------------------------------

describe('updateUser', () => {
  it('returns the updated user on success', async () => {
    const existing = buildPrismaUser();
    const updated = buildPrismaUser({ displayName: 'Updated Name' });
    vi.mocked(prisma.user.findUnique).mockResolvedValue(existing as never);
    vi.mocked(prisma.user.update).mockResolvedValue(updated as never);

    const result = await updateUser('user-id-123', { displayName: 'Updated Name' });

    expect(result.displayName).toBe('Updated Name');
  });

  it('throws USER_NOT_FOUND when user does not exist before update', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    await expect(updateUser('missing-id', { displayName: 'Name' })).rejects.toMatchObject({
      code: 'USER_NOT_FOUND',
    });
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('throws USERNAME_TAKEN on unique constraint violation', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(buildPrismaUser() as never);
    vi.mocked(prisma.user.update).mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint violated', {
        code: 'P2002',
        clientVersion: '5.0.0',
      })
    );

    await expect(updateUser('user-id-123', { username: 'takenuser' })).rejects.toMatchObject({
      code: 'USERNAME_TAKEN',
    });
  });
});

// ---------------------------------------------------------------------------
// getUserPreferences
// ---------------------------------------------------------------------------

describe('getUserPreferences', () => {
  it('returns preferences when found', async () => {
    const prefs = buildPrismaPreferences();
    vi.mocked(prisma.userPreferences.findUnique).mockResolvedValue(prefs as never);

    const result = await getUserPreferences('user-id-123');

    expect(result.userId).toBe('user-id-123');
    expect(result.language).toBe('en');
  });

  it('throws PREFERENCES_NOT_FOUND when preferences do not exist', async () => {
    vi.mocked(prisma.userPreferences.findUnique).mockResolvedValue(null);

    await expect(getUserPreferences('user-id-123')).rejects.toMatchObject({
      code: 'PREFERENCES_NOT_FOUND',
    });
  });
});

// ---------------------------------------------------------------------------
// updateUserPreferences
// ---------------------------------------------------------------------------

describe('updateUserPreferences', () => {
  it('shallow-merges JSON fields and calls prisma.update', async () => {
    const existing = buildPrismaPreferences({
      notificationPreferences: { emailOnPdfReady: false },
    });
    const updated = buildPrismaPreferences({
      language: 'fr',
      notificationPreferences: { emailOnPdfReady: true },
    });
    vi.mocked(prisma.userPreferences.findUnique).mockResolvedValue(existing as never);
    vi.mocked(prisma.userPreferences.update).mockResolvedValue(updated as never);

    await updateUserPreferences('user-id-123', {
      language: 'fr',
      notificationPreferences: { emailOnPdfReady: true },
    });

    const updateCall = vi.mocked(prisma.userPreferences.update).mock.calls[0]?.[0];
    expect(updateCall?.data.language).toBe('fr');
    expect(updateCall?.data.notificationPreferences).toEqual({ emailOnPdfReady: true });
  });

  it('throws PREFERENCES_NOT_FOUND when preferences do not exist', async () => {
    vi.mocked(prisma.userPreferences.findUnique).mockResolvedValue(null);

    await expect(updateUserPreferences('user-id-123', { language: 'fr' })).rejects.toMatchObject({
      code: 'PREFERENCES_NOT_FOUND',
    });
    expect(prisma.userPreferences.update).not.toHaveBeenCalled();
  });
});
