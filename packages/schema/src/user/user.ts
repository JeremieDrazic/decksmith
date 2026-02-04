/**
 * User schema - represents an authenticated user.
 *
 * Users are managed by Supabase Auth, so we don't have a full
 * create/update flow. This schema represents what we expose in the API.
 *
 * @example
 * import { UserResponseSchema, type User } from '@decksmith/schema/user/user';
 */

import { z } from 'zod';

import { DateTimeSchema, UuidSchema } from '../primitives/common.js';

// =============================================================================
// USER SCHEMAS
// =============================================================================

/**
 * Username schema.
 *
 * Requirements:
 * - 3-30 characters
 * - Lowercase letters, numbers, underscores
 * - Must start with a letter
 */
export const UsernameSchema = z
  .string()
  .min(3)
  .max(30)
  .regex(/^[a-z][a-z0-9_]*$/, {
    message:
      'Username must start with a letter and contain only lowercase letters, numbers, and underscores',
  });
export type Username = z.infer<typeof UsernameSchema>;

/**
 * Display name schema.
 *
 * The user's public display name (can contain any characters).
 */
export const DisplayNameSchema = z.string().min(1).max(50).trim();
export type DisplayName = z.infer<typeof DisplayNameSchema>;

/**
 * Avatar URL schema.
 *
 * Can be a URL to an uploaded image or null for default avatar.
 */
export const AvatarUrlSchema = z.url().nullable();
export type AvatarUrl = z.infer<typeof AvatarUrlSchema>;

/**
 * User response schema - what the API returns.
 *
 * Note: Supabase Auth manages the actual user record.
 * This is a projection of what we expose in our API.
 */
export const UserResponseSchema = z.object({
  /** Supabase Auth user ID */
  id: UuidSchema,

  /** User's email address */
  email: z.email(),

  /** Unique username (for profile URLs, mentions) */
  username: UsernameSchema,

  /** Public display name */
  displayName: DisplayNameSchema,

  /** Profile avatar URL (null = use default) */
  avatarUrl: AvatarUrlSchema,

  /** When the account was created */
  createdAt: DateTimeSchema,

  /** When the account was last updated */
  updatedAt: DateTimeSchema,
});
export type User = z.infer<typeof UserResponseSchema>;

/**
 * User summary schema - minimal data for attribution.
 *
 * Used when showing who owns a public deck, etc.
 */
export const UserSummarySchema = UserResponseSchema.pick({
  id: true,
  username: true,
  displayName: true,
  avatarUrl: true,
});
export type UserSummary = z.infer<typeof UserSummarySchema>;

/**
 * Current user schema - includes more details for the logged-in user.
 *
 * Extends UserResponse with data only the user themselves should see.
 */
export const CurrentUserSchema = UserResponseSchema.extend({
  /** User's email verification status */
  emailVerified: z.boolean(),
});
export type CurrentUser = z.infer<typeof CurrentUserSchema>;

/**
 * Update user profile input schema.
 */
export const UpdateUserInputSchema = z.object({
  /** New display name (optional) */
  displayName: DisplayNameSchema.optional(),

  /** New username (optional, requires availability check) */
  username: UsernameSchema.optional(),

  /** New avatar URL (optional, null to remove) */
  avatarUrl: AvatarUrlSchema.optional(),
});
export type UpdateUserInput = z.infer<typeof UpdateUserInputSchema>;
