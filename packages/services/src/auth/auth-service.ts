import { prisma, supabase, SUPABASE_USER_ALREADY_EXISTS } from '@decksmith/db';
import type { PrismaUser } from '@decksmith/db';
import type { RegisterInput } from '@decksmith/schema/auth';
import {
  EMAIL_ALREADY_TAKEN,
  INVALID_CREDENTIALS,
  PASSWORD_RESET_FAILED,
  REGISTRATION_FAILED,
  SESSION_EXPIRED,
  UNAUTHORIZED,
  USER_NOT_FOUND,
} from '@decksmith/schema/errors/codes';

import { ServiceError } from '../errors.js';

/**
 * Creates a Supabase auth account and the corresponding Prisma user profile.
 *
 * @param input - Registration credentials and optional username
 * @returns Minimal user identity — account is pending email confirmation
 */
export async function registerUser(input: RegisterInput): Promise<{ id: string; email: string }> {
  const { email, password, username } = input;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } },
  });

  if (error) {
    if (error.code === SUPABASE_USER_ALREADY_EXISTS) {
      throw new ServiceError(EMAIL_ALREADY_TAKEN, 'Email is already registered');
    }
    throw new ServiceError(REGISTRATION_FAILED, 'Registration failed. Please try again.');
  }

  if (!data.user) {
    throw new ServiceError(REGISTRATION_FAILED, 'Registration failed. Please try again.');
  }

  await prisma.user.create({
    data: {
      id: data.user.id,
      email,
      username: username ?? null,
      preferences: {
        create: {
          language: 'en',
          units: 'mm',
          defaultCurrency: 'eur',
          theme: 'system',
        },
      },
    },
  });

  return { id: data.user.id, email: data.user.email ?? email };
}

/**
 * Authenticates a user and returns tokens alongside their Prisma profile.
 *
 * @param email - The user's email address
 * @param password - The user's password
 * @returns Session tokens and Prisma user profile
 */
export async function loginUser(
  email: string,
  password: string
): Promise<{ accessToken: string; refreshToken: string; user: PrismaUser }> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error ?? !data.session) {
    throw new ServiceError(INVALID_CREDENTIALS, 'Invalid email or password');
  }

  const user = await prisma.user.findUnique({ where: { id: data.user.id } });

  if (!user) {
    throw new ServiceError(UNAUTHORIZED, 'User profile not found');
  }

  return {
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
    user,
  };
}

/**
 * Invalidates all Supabase sessions for the given user across all devices.
 *
 * @param userId - The Supabase user ID
 */
export async function logoutUser(userId: string): Promise<void> {
  await supabase.auth.admin.signOut(userId, 'global');
}

/**
 * Issues new tokens from a valid refresh token.
 *
 * @param refreshToken - The current refresh token (read from httpOnly cookie by the route)
 * @returns New access and refresh tokens to replace the existing cookies
 */
export async function refreshSession(
  refreshToken: string
): Promise<{ accessToken: string; refreshToken: string }> {
  const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });

  if (error ?? !data.session) {
    throw new ServiceError(SESSION_EXPIRED, 'Session expired. Please log in.');
  }

  return {
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
  };
}

/**
 * Sends a password reset email. Errors are intentionally ignored to prevent
 * account enumeration — the caller always returns a success response.
 *
 * @param email - The email address to send the reset link to
 * @param redirectTo - The URL Supabase will include in the reset link
 */
export async function requestPasswordReset(email: string, redirectTo: string): Promise<void> {
  await supabase.auth.resetPasswordForEmail(email, { redirectTo });
}

/**
 * Updates the user's password via the Supabase admin API.
 *
 * @param userId - The Supabase user ID
 * @param newPassword - The new password (already validated by the route's Zod schema)
 */
export async function resetPassword(userId: string, newPassword: string): Promise<void> {
  const { error } = await supabase.auth.admin.updateUserById(userId, { password: newPassword });

  if (error) {
    throw new ServiceError(PASSWORD_RESET_FAILED, 'Failed to reset password. Please try again.');
  }
}

/**
 * Retrieves the Prisma user profile for the currently authenticated user.
 *
 * @param userId - The Supabase user ID (from the authenticated session)
 * @returns The Prisma user profile
 */
export async function getMe(userId: string): Promise<PrismaUser> {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new ServiceError(USER_NOT_FOUND, 'User profile not found');
  }

  return user;
}
