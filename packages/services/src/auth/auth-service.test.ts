import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@decksmith/db', () => import('../__mocks__/db.js'));

import { prisma, supabase, SUPABASE_USER_ALREADY_EXISTS } from '@decksmith/db';
import {
  getMe,
  loginUser,
  logoutUser,
  refreshSession,
  registerUser,
  requestPasswordReset,
  resetPassword,
} from './auth-service.js';

// ---------------------------------------------------------------------------
// Factories
// ---------------------------------------------------------------------------

function buildAuthUser(overrides?: Record<string, unknown>) {
  return {
    id: 'user-id-123',
    email: 'user@example.com',
    aud: 'authenticated',
    app_metadata: {},
    user_metadata: {},
    created_at: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function buildSession(overrides?: Record<string, unknown>) {
  return {
    access_token: 'access-token-abc',
    refresh_token: 'refresh-token-xyz',
    ...overrides,
  };
}

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

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.resetAllMocks();
});

// ---------------------------------------------------------------------------
// registerUser
// ---------------------------------------------------------------------------

describe('registerUser', () => {
  it('creates auth account and prisma profile, returns id + email', async () => {
    const authUser = buildAuthUser();
    vi.mocked(supabase.auth.signUp).mockResolvedValue({
      data: { user: authUser, session: null },
      error: null,
    } as never);
    vi.mocked(prisma.user.create).mockResolvedValue(buildPrismaUser() as never);

    const result = await registerUser({
      email: 'user@example.com',
      password: 'Password123',
    });

    expect(result).toEqual({ id: 'user-id-123', email: 'user@example.com' });
    expect(prisma.user.create).toHaveBeenCalledOnce();
  });

  it('throws EMAIL_ALREADY_TAKEN when email is already registered', async () => {
    vi.mocked(supabase.auth.signUp).mockResolvedValue({
      data: { user: null, session: null },
      error: { code: SUPABASE_USER_ALREADY_EXISTS, message: 'Already exists' },
    } as never);

    await expect(
      registerUser({ email: 'taken@example.com', password: 'Password123' })
    ).rejects.toMatchObject({
      code: 'EMAIL_ALREADY_TAKEN',
    });
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('throws REGISTRATION_FAILED on generic Supabase error', async () => {
    vi.mocked(supabase.auth.signUp).mockResolvedValue({
      data: { user: null, session: null },
      error: { code: 'some_error', message: 'Unexpected' },
    } as never);

    await expect(
      registerUser({ email: 'user@example.com', password: 'Password123' })
    ).rejects.toMatchObject({
      code: 'REGISTRATION_FAILED',
    });
  });

  it('throws REGISTRATION_FAILED when signUp returns no user and no error', async () => {
    vi.mocked(supabase.auth.signUp).mockResolvedValue({
      data: { user: null, session: null },
      error: null,
    } as never);

    await expect(
      registerUser({ email: 'user@example.com', password: 'Password123' })
    ).rejects.toMatchObject({
      code: 'REGISTRATION_FAILED',
    });
  });
});

// ---------------------------------------------------------------------------
// loginUser
// ---------------------------------------------------------------------------

describe('loginUser', () => {
  it('returns tokens and prisma user on success', async () => {
    const session = buildSession();
    const authUser = buildAuthUser();
    const prismaUser = buildPrismaUser();
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: { user: authUser, session },
      error: null,
    } as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(prismaUser as never);

    const result = await loginUser('user@example.com', 'Password123');

    expect(result.accessToken).toBe('access-token-abc');
    expect(result.refreshToken).toBe('refresh-token-xyz');
    expect(result.user.id).toBe('user-id-123');
  });

  it('throws INVALID_CREDENTIALS on Supabase auth error', async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid credentials' },
    } as never);

    await expect(loginUser('bad@example.com', 'wrongpassword')).rejects.toMatchObject({
      code: 'INVALID_CREDENTIALS',
    });
  });

  it('throws UNAUTHORIZED when prisma user profile is missing', async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: { user: buildAuthUser(), session: buildSession() },
      error: null,
    } as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    await expect(loginUser('user@example.com', 'Password123')).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
    });
  });
});

// ---------------------------------------------------------------------------
// logoutUser
// ---------------------------------------------------------------------------

describe('logoutUser', () => {
  it('calls supabase admin signOut with global scope', async () => {
    vi.mocked(supabase.auth.admin.signOut).mockResolvedValue({ error: null } as never);

    await logoutUser('user-id-123');

    expect(supabase.auth.admin.signOut).toHaveBeenCalledWith('user-id-123', 'global');
  });
});

// ---------------------------------------------------------------------------
// refreshSession
// ---------------------------------------------------------------------------

describe('refreshSession', () => {
  it('returns new tokens on success', async () => {
    vi.mocked(supabase.auth.refreshSession).mockResolvedValue({
      data: { session: buildSession({ access_token: 'new-access', refresh_token: 'new-refresh' }) },
      error: null,
    } as never);

    const result = await refreshSession('old-refresh-token');

    expect(result).toEqual({ accessToken: 'new-access', refreshToken: 'new-refresh' });
  });

  it('throws SESSION_EXPIRED on Supabase error', async () => {
    vi.mocked(supabase.auth.refreshSession).mockResolvedValue({
      data: { session: null },
      error: { message: 'Token expired' },
    } as never);

    await expect(refreshSession('expired-token')).rejects.toMatchObject({
      code: 'SESSION_EXPIRED',
    });
  });
});

// ---------------------------------------------------------------------------
// requestPasswordReset
// ---------------------------------------------------------------------------

describe('requestPasswordReset', () => {
  it('resolves without throwing even if Supabase returns an error', async () => {
    vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValue({
      data: {},
      error: { message: 'Unexpected error' },
    } as never);

    await expect(
      requestPasswordReset('unknown@example.com', 'https://app/reset')
    ).resolves.toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// resetPassword
// ---------------------------------------------------------------------------

describe('resetPassword', () => {
  it('calls admin.updateUserById with the new password', async () => {
    vi.mocked(supabase.auth.admin.updateUserById).mockResolvedValue({
      data: {},
      error: null,
    } as never);

    await resetPassword('user-id-123', 'NewPassword123');

    expect(supabase.auth.admin.updateUserById).toHaveBeenCalledWith('user-id-123', {
      password: 'NewPassword123',
    });
  });

  it('throws PASSWORD_RESET_FAILED on Supabase error', async () => {
    vi.mocked(supabase.auth.admin.updateUserById).mockResolvedValue({
      data: {},
      error: { message: 'Update failed' },
    } as never);

    await expect(resetPassword('user-id-123', 'NewPassword123')).rejects.toMatchObject({
      code: 'PASSWORD_RESET_FAILED',
    });
  });
});

// ---------------------------------------------------------------------------
// getMe
// ---------------------------------------------------------------------------

describe('getMe', () => {
  it('returns the prisma user when found', async () => {
    const prismaUser = buildPrismaUser();
    vi.mocked(prisma.user.findUnique).mockResolvedValue(prismaUser as never);

    const result = await getMe('user-id-123');

    expect(result.id).toBe('user-id-123');
  });

  it('throws USER_NOT_FOUND when user does not exist', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    await expect(getMe('missing-id')).rejects.toMatchObject({ code: 'USER_NOT_FOUND' });
  });
});
