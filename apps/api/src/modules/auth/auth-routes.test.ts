import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@decksmith/db', () => import('@/test-utils/mocks/db.js'));
vi.mock('@/config.js', () => import('@/test-utils/mocks/config.js'));

import { prisma, supabase, SUPABASE_USER_ALREADY_EXISTS } from '@decksmith/db';
import { asGuest, asUser } from '@/test-utils/inject.js';
import { buildAuthUser } from '@/test-utils/factories/auth-user.js';
import { buildPrismaUser } from '@/test-utils/factories/prisma-user.js';
import { createTestServer } from '@/test-utils/server.js';

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

const USER_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

const getApp = createTestServer();

beforeEach(() => {
  vi.resetAllMocks();
  // Default: authenticated as USER_ID. Routes that don't require auth ignore this.
  vi.mocked(supabase.auth.getUser).mockResolvedValue({
    data: { user: { id: USER_ID } as never },
    error: null,
  });
});

// ---------------------------------------------------------------------------
// POST /register
// ---------------------------------------------------------------------------

describe('POST /api/v1/auth/register', () => {
  it('returns 201 on successful registration', async () => {
    const authUser = buildAuthUser();
    vi.mocked(supabase.auth.signUp).mockResolvedValue({
      data: { user: authUser, session: null },
      error: null,
    } as never);
    vi.mocked(prisma.user.create).mockResolvedValue(buildPrismaUser() as never);

    const res = await asGuest(getApp(), 'POST', '/api/v1/auth/register', {
      email: 'user@example.com',
      password: 'Password123',
    });

    expect(res.statusCode).toBe(201);
    expect(res.json<{ user: { id: string } }>().user.id).toBe(USER_ID);
  });

  it('returns 409 when email is already taken', async () => {
    vi.mocked(supabase.auth.signUp).mockResolvedValue({
      data: { user: null, session: null },
      error: { code: SUPABASE_USER_ALREADY_EXISTS, message: 'Email already registered' } as never,
    } as never);

    const res = await asGuest(getApp(), 'POST', '/api/v1/auth/register', {
      email: 'existing@example.com',
      password: 'Password123',
    });

    expect(res.statusCode).toBe(409);
    expect(res.json<{ code: string }>().code).toBe('EMAIL_ALREADY_TAKEN');
  });

  it('returns 400 on other Supabase errors', async () => {
    vi.mocked(supabase.auth.signUp).mockResolvedValue({
      data: { user: null, session: null },
      error: { code: 'unexpected_failure', message: 'Something went wrong' } as never,
    } as never);

    const res = await asGuest(getApp(), 'POST', '/api/v1/auth/register', {
      email: 'user@example.com',
      password: 'Password123',
    });

    expect(res.statusCode).toBe(400);
    expect(res.json<{ code: string }>().code).toBe('REGISTRATION_FAILED');
  });

  it('returns 422 on invalid body', async () => {
    const res = await asGuest(getApp(), 'POST', '/api/v1/auth/register', {
      email: 'not-an-email',
    });

    expect(res.statusCode).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// POST /login
// ---------------------------------------------------------------------------

describe('POST /api/v1/auth/login', () => {
  it('returns 200 with user and sets cookies on valid credentials', async () => {
    const authUser = buildAuthUser();
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: {
        user: authUser,
        session: { access_token: 'new-access', refresh_token: 'new-refresh' },
      },
      error: null,
    } as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(buildPrismaUser() as never);

    const res = await asGuest(getApp(), 'POST', '/api/v1/auth/login', {
      email: 'user@example.com',
      password: 'Password123',
    });

    expect(res.statusCode).toBe(200);
    expect(res.json<{ user: { id: string } }>().user.id).toBe(USER_ID);
    // access_token cookie must be set
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('returns 401 on invalid credentials', async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid login credentials' } as never,
    } as never);

    const res = await asGuest(getApp(), 'POST', '/api/v1/auth/login', {
      email: 'user@example.com',
      password: 'wrong-password',
    });

    expect(res.statusCode).toBe(401);
    expect(res.json<{ code: string }>().code).toBe('INVALID_CREDENTIALS');
  });

  it('returns 401 when user profile does not exist in DB', async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: {
        user: buildAuthUser(),
        session: { access_token: 'tok', refresh_token: 'ref' },
      },
      error: null,
    } as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    const res = await asGuest(getApp(), 'POST', '/api/v1/auth/login', {
      email: 'user@example.com',
      password: 'Password123',
    });

    expect(res.statusCode).toBe(401);
    expect(res.json<{ code: string }>().code).toBe('UNAUTHORIZED');
  });
});

// ---------------------------------------------------------------------------
// POST /logout
// ---------------------------------------------------------------------------

describe('POST /api/v1/auth/logout', () => {
  it('returns 401 when unauthenticated', async () => {
    const res = await asGuest(getApp(), 'POST', '/api/v1/auth/logout');
    expect(res.statusCode).toBe(401);
  });

  it('returns 200 and clears cookies', async () => {
    vi.mocked(supabase.auth.admin.signOut).mockResolvedValue({ error: null } as never);

    const res = await asUser(getApp(), 'POST', '/api/v1/auth/logout');

    expect(res.statusCode).toBe(200);
    // Both cookies must be cleared (Max-Age=0 or Expires in the past)
    const cookies = (res.headers['set-cookie'] as string[]) ?? [];
    expect(cookies.some((c) => c.startsWith('access_token=;'))).toBe(true);
    expect(cookies.some((c) => c.startsWith('refresh_token=;'))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// POST /refresh
// ---------------------------------------------------------------------------

describe('POST /api/v1/auth/refresh', () => {
  it('returns 401 when no refresh token cookie', async () => {
    const res = await asGuest(getApp(), 'POST', '/api/v1/auth/refresh');
    expect(res.statusCode).toBe(401);
    expect(res.json<{ code: string }>().code).toBe('SESSION_EXPIRED');
  });

  it('returns 401 when the refresh token is expired', async () => {
    vi.mocked(supabase.auth.refreshSession).mockResolvedValue({
      data: { session: null, user: null },
      error: { message: 'Token expired' } as never,
    } as never);

    const res = await getApp().inject({
      method: 'POST',
      url: '/api/v1/auth/refresh',
      cookies: { refresh_token: 'expired-token' },
    });

    expect(res.statusCode).toBe(401);
    expect(res.json<{ code: string }>().code).toBe('SESSION_EXPIRED');
  });

  it('returns 200 and sets new cookies on valid refresh token', async () => {
    vi.mocked(supabase.auth.refreshSession).mockResolvedValue({
      data: {
        session: { access_token: 'new-access', refresh_token: 'new-refresh' },
        user: buildAuthUser(),
      },
      error: null,
    } as never);

    const res = await getApp().inject({
      method: 'POST',
      url: '/api/v1/auth/refresh',
      cookies: { refresh_token: 'valid-refresh-token' },
    });

    expect(res.statusCode).toBe(200);
    expect(res.headers['set-cookie']).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// POST /forgot-password
// ---------------------------------------------------------------------------

describe('POST /api/v1/auth/forgot-password', () => {
  it('always returns 200 regardless of whether the email exists', async () => {
    vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValue({ data: {}, error: null });

    const res = await asGuest(getApp(), 'POST', '/api/v1/auth/forgot-password', {
      email: 'unknown@example.com',
    });

    expect(res.statusCode).toBe(200);
    // Must not reveal whether the account exists
    expect(res.json<{ message: string }>().message).toContain('If this email is registered');
  });
});

// ---------------------------------------------------------------------------
// POST /reset-password
// ---------------------------------------------------------------------------

describe('POST /api/v1/auth/reset-password', () => {
  it('returns 401 when unauthenticated', async () => {
    const res = await asGuest(getApp(), 'POST', '/api/v1/auth/reset-password', {
      newPassword: 'NewPass123!',
    });
    expect(res.statusCode).toBe(401);
  });

  it('returns 400 when the password update fails', async () => {
    vi.mocked(supabase.auth.admin.updateUserById).mockResolvedValue({
      data: { user: null },
      error: { message: 'Update failed' } as never,
    } as never);

    const res = await asUser(getApp(), 'POST', '/api/v1/auth/reset-password', {
      newPassword: 'NewPass123!',
    });

    expect(res.statusCode).toBe(400);
    expect(res.json<{ code: string }>().code).toBe('PASSWORD_RESET_FAILED');
  });

  it('returns 200 on successful password reset', async () => {
    vi.mocked(supabase.auth.admin.updateUserById).mockResolvedValue({
      data: { user: buildAuthUser() as never },
      error: null,
    } as never);

    const res = await asUser(getApp(), 'POST', '/api/v1/auth/reset-password', {
      newPassword: 'NewPass123!',
    });

    expect(res.statusCode).toBe(200);
  });
});
