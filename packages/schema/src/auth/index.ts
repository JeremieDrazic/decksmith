/**
 * Auth schemas — input and output contracts for all authentication endpoints.
 *
 * These schemas are shared between apps/api (validation + serialization),
 * apps/web (form validation, typed API client), and apps/mobile.
 *
 * Route prefix: /api/v1/auth
 *
 * Note on i18n: Zod error messages are currently hardcoded in English.
 * Phase 5 will replace them with error codes that the frontend translates.
 *
 * @example
 * import { RegisterInputSchema, type RegisterInput } from '@decksmith/schema/auth';
 */

import { z } from 'zod';

import { UuidSchema } from '../primitives/common.js';
import { UsernameSchema, UserResponseSchema } from '../user/user.js';

// =============================================================================
// SHARED PRIMITIVES
// =============================================================================

/**
 * Password validation schema.
 *
 * Exported so apps/web and apps/mobile can reuse the same rules
 * for real-time form validation (e.g. showing "✓ 8 characters" as the user types).
 *
 * Requirements (per spec):
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 *
 * Note: complexity rules are intentionally minimal — length matters more than
 * character variety (NIST SP 800-63B). Supabase can optionally check against
 * compromised password lists (HaveIBeenPwned) server-side.
 */
export const PasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');
export type Password = z.infer<typeof PasswordSchema>;

// =============================================================================
// REGISTER — POST /api/v1/auth/register
// =============================================================================

/**
 * Input schema for user registration.
 */
export const RegisterInputSchema = z.object({
  /** User's email address */
  email: z.email(),

  /** Password (min 8 chars, upper + lower + number) */
  password: PasswordSchema,

  /** Optional username chosen at registration */
  username: UsernameSchema.optional(),
});
export type RegisterInput = z.infer<typeof RegisterInputSchema>;

/**
 * Response schema for successful registration.
 *
 * The account is pending email confirmation — no session is issued yet.
 * The `message` field tells the user what to do next
 * (e.g. "Confirmation email sent. Please check your inbox.").
 */
export const RegisterResponseSchema = z.object({
  user: z.object({
    id: UuidSchema,
    email: z.email(),
  }),
  /** Human-readable next-step instruction shown to the user */
  message: z.string(),
});
export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;

// =============================================================================
// LOGIN — POST /api/v1/auth/login
// =============================================================================

/**
 * Input schema for email/password login.
 */
export const LoginInputSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof LoginInputSchema>;

/**
 * Response schema for successful login.
 *
 * Tokens are set as httpOnly cookies by the server — not returned in the body.
 * The body only returns the user profile so the frontend can populate its state.
 */
export const LoginResponseSchema = z.object({
  user: UserResponseSchema,
});
export type LoginResponse = z.infer<typeof LoginResponseSchema>;

// =============================================================================
// LOGOUT — POST /api/v1/auth/logout
// =============================================================================

export const LogoutResponseSchema = z.object({
  message: z.string(),
});
export type LogoutResponse = z.infer<typeof LogoutResponseSchema>;

// =============================================================================
// REFRESH — POST /api/v1/auth/refresh
// =============================================================================

/**
 * Response schema for token refresh.
 *
 * The refresh token is read from the httpOnly cookie (not the request body).
 * New tokens are set as httpOnly cookies — not returned in the body.
 */
export const RefreshResponseSchema = z.object({
  message: z.string(),
});
export type RefreshResponse = z.infer<typeof RefreshResponseSchema>;

// =============================================================================
// FORGOT PASSWORD — POST /api/v1/auth/forgot-password
// =============================================================================

export const ForgotPasswordInputSchema = z.object({
  email: z.email(),
});
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordInputSchema>;

export const ForgotPasswordResponseSchema = z.object({
  /** Always returns success — never reveals whether the email exists (security best practice) */
  message: z.string(),
});
export type ForgotPasswordResponse = z.infer<typeof ForgotPasswordResponseSchema>;

// =============================================================================
// RESET PASSWORD — POST /api/v1/auth/reset-password
// =============================================================================

export const ResetPasswordInputSchema = z.object({
  /** New password — same rules as registration */
  newPassword: PasswordSchema,
});
export type ResetPasswordInput = z.infer<typeof ResetPasswordInputSchema>;

export const ResetPasswordResponseSchema = z.object({
  message: z.string(),
});
export type ResetPasswordResponse = z.infer<typeof ResetPasswordResponseSchema>;
