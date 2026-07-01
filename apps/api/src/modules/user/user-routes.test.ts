import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@decksmith/db', () => import('@/test-utils/mocks/db.js'));
vi.mock('@/config.js', () => import('@/test-utils/mocks/config.js'));

import { prisma, supabase } from '@decksmith/db';
import { asGuest, asUser } from '@/test-utils/inject.js';
import { buildPrismaPreferences } from '@/test-utils/factories/prisma-preferences.js';
import { buildPrismaUser } from '@/test-utils/factories/prisma-user.js';
import { createTestServer } from '@/test-utils/server.js';

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

const USER_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
const OTHER_USER_ID = 'b2c3d4e5-f6a7-8901-bcde-f12345678901';

const getApp = createTestServer();

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(supabase.auth.getUser).mockResolvedValue({
    data: { user: { id: USER_ID } as never },
    error: null,
  });
});

// ---------------------------------------------------------------------------
// GET /:id
// ---------------------------------------------------------------------------

describe('GET /api/v1/users/:id', () => {
  it('returns 401 when unauthenticated', async () => {
    const res = await asGuest(getApp(), 'GET', `/api/v1/users/${USER_ID}`);
    expect(res.statusCode).toBe(401);
    expect(res.json<{ code: string }>().code).toBe('UNAUTHORIZED');
  });

  it('returns 403 when accessing another user profile', async () => {
    const res = await asUser(getApp(), 'GET', `/api/v1/users/${OTHER_USER_ID}`);
    expect(res.statusCode).toBe(403);
    expect(res.json<{ code: string }>().code).toBe('FORBIDDEN');
  });

  it('returns 404 when user does not exist', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    const res = await asUser(getApp(), 'GET', `/api/v1/users/${USER_ID}`);
    expect(res.statusCode).toBe(404);
    expect(res.json<{ code: string }>().code).toBe('USER_NOT_FOUND');
  });

  it('returns 200 with the user profile', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(buildPrismaUser() as never);
    const res = await asUser(getApp(), 'GET', `/api/v1/users/${USER_ID}`);
    expect(res.statusCode).toBe(200);
    expect(res.json<{ id: string; email: string }>()).toMatchObject({
      id: USER_ID,
      email: 'user@example.com',
    });
  });
});

// ---------------------------------------------------------------------------
// PATCH /:id
// ---------------------------------------------------------------------------

describe('PATCH /api/v1/users/:id', () => {
  it('returns 401 when unauthenticated', async () => {
    const res = await asGuest(getApp(), 'PATCH', `/api/v1/users/${USER_ID}`, {
      username: 'newname',
    });
    expect(res.statusCode).toBe(401);
  });

  it('returns 403 when modifying another user profile', async () => {
    const res = await asUser(getApp(), 'PATCH', `/api/v1/users/${OTHER_USER_ID}`, {
      username: 'hacked',
    });
    expect(res.statusCode).toBe(403);
    expect(res.json<{ code: string }>().code).toBe('FORBIDDEN');
  });

  it('returns 404 when user does not exist', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    const res = await asUser(getApp(), 'PATCH', `/api/v1/users/${USER_ID}`, {
      username: 'newname',
    });
    expect(res.statusCode).toBe(404);
  });
});

// ---------------------------------------------------------------------------
// GET /:id/preferences
// ---------------------------------------------------------------------------

describe('GET /api/v1/users/:id/preferences', () => {
  it('returns 401 when unauthenticated', async () => {
    const res = await asGuest(getApp(), 'GET', `/api/v1/users/${USER_ID}/preferences`);
    expect(res.statusCode).toBe(401);
  });

  it('returns 403 when accessing another user preferences', async () => {
    const res = await asUser(getApp(), 'GET', `/api/v1/users/${OTHER_USER_ID}/preferences`);
    expect(res.statusCode).toBe(403);
  });

  it('returns 200 with preferences', async () => {
    vi.mocked(prisma.userPreferences.findUnique).mockResolvedValue(
      buildPrismaPreferences({ userId: USER_ID }) as never
    );
    const res = await asUser(getApp(), 'GET', `/api/v1/users/${USER_ID}/preferences`);
    expect(res.statusCode).toBe(200);
    expect(res.json<{ userId: string }>().userId).toBe(USER_ID);
  });
});

// ---------------------------------------------------------------------------
// PATCH /:id/preferences
// ---------------------------------------------------------------------------

describe('PATCH /api/v1/users/:id/preferences', () => {
  it('returns 401 when unauthenticated', async () => {
    const res = await asGuest(getApp(), 'PATCH', `/api/v1/users/${USER_ID}/preferences`, {
      language: 'fr',
    });
    expect(res.statusCode).toBe(401);
  });

  it('returns 403 when modifying another user preferences', async () => {
    const res = await asUser(getApp(), 'PATCH', `/api/v1/users/${OTHER_USER_ID}/preferences`, {
      language: 'fr',
    });
    expect(res.statusCode).toBe(403);
  });
});
