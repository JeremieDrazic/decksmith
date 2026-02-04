/**
 * Tag schema.
 *
 * User-managed tags for organizing decks, collection entries, and cards.
 * Tags are scoped per user (not global) and typed by what they can tag.
 *
 * @example
 * import { TagResponseSchema, type Tag } from '@decksmith/schema/tag/tag';
 */

import { z } from 'zod';

import { DateTimeSchema, HexColorSchema, UuidSchema } from '../primitives/common.js';
import { TagTypeSchema } from '../primitives/enums.js';

// =============================================================================
// TAG RESPONSE
// =============================================================================

/**
 * Tag response schema - what the API returns.
 */
export const TagResponseSchema = z.object({
  /** Unique tag ID */
  id: UuidSchema,

  /** Owner's user ID */
  userId: UuidSchema,

  /** Tag name (unique per user + type) */
  name: z.string().min(1).max(50).trim(),

  /** Optional description explaining the tag's purpose */
  description: z.string().max(200).nullable(),

  /** Display color (hex code) */
  color: HexColorSchema,

  /** What this tag can be applied to */
  type: TagTypeSchema,

  /** When the tag was created */
  createdAt: DateTimeSchema,

  /** When the tag was last updated */
  updatedAt: DateTimeSchema,
});
export type Tag = z.infer<typeof TagResponseSchema>;

/**
 * Tag summary schema - minimal data for dropdowns and embeds.
 */
export const TagSummarySchema = TagResponseSchema.pick({
  id: true,
  name: true,
  color: true,
  type: true,
});
export type TagSummary = z.infer<typeof TagSummarySchema>;

/**
 * Tag with usage count - for tag list views.
 */
export const TagWithCountSchema = TagResponseSchema.extend({
  /** Number of items using this tag */
  usageCount: z.number().int().nonnegative(),
});
export type TagWithCount = z.infer<typeof TagWithCountSchema>;

// =============================================================================
// INPUT SCHEMAS
// =============================================================================

/**
 * Create tag input schema.
 */
export const CreateTagInputSchema = z.object({
  /** Tag name (required, unique per user + type) */
  name: z.string().min(1).max(50).trim(),

  /** Optional description */
  description: z.string().max(200).optional(),

  /** Display color (hex code, defaults to gray) */
  color: HexColorSchema.optional().default('#6B7280'),

  /** What this tag can be applied to */
  type: TagTypeSchema,
});
export type CreateTagInput = z.infer<typeof CreateTagInputSchema>;

/**
 * Update tag input schema.
 *
 * Note: type cannot be changed after creation.
 */
export const UpdateTagInputSchema = z.object({
  /** New tag name */
  name: z.string().min(1).max(50).trim().optional(),

  /** New description (null to clear) */
  description: z.string().max(200).nullable().optional(),

  /** New display color */
  color: HexColorSchema.optional(),
});
export type UpdateTagInput = z.infer<typeof UpdateTagInputSchema>;

// =============================================================================
// QUERY SCHEMAS
// =============================================================================

/**
 * Tag query parameters.
 */
export const TagQuerySchema = z.object({
  /** Filter by tag type */
  type: TagTypeSchema.optional(),

  /** Search by name (partial match) */
  search: z.string().optional(),

  /** Sort field */
  sortBy: z.enum(['name', 'usageCount', 'createdAt']).optional().default('name'),

  /** Sort direction */
  sortDirection: z.enum(['asc', 'desc']).optional().default('asc'),
});
export type TagQuery = z.infer<typeof TagQuerySchema>;
