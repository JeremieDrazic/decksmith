/**
 * CollectionFolder schema.
 *
 * User-defined folders for organizing collection entries.
 * Examples: "Trade Binder", "Reserved List", "EDH Staples"
 *
 * @example
 * import { CollectionFolderResponseSchema, type CollectionFolder } from '@decksmith/schema/collection/folder';
 */

import { z } from 'zod';

import { DateTimeSchema, HexColorSchema, UuidSchema } from '../primitives/common.js';

// =============================================================================
// FOLDER RESPONSE
// =============================================================================

/**
 * Collection folder response schema - what the API returns.
 */
export const CollectionFolderResponseSchema = z.object({
  /** Unique folder ID */
  id: UuidSchema,

  /** Owner's user ID */
  userId: UuidSchema,

  /** Folder name (unique per user) */
  name: z.string().min(1).max(100).trim(),

  /** Optional description */
  description: z.string().max(500).nullable(),

  /** Display color (hex code) */
  color: HexColorSchema,

  /** When the folder was created */
  createdAt: DateTimeSchema,

  /** When the folder was last updated */
  updatedAt: DateTimeSchema,
});
export type CollectionFolder = z.infer<typeof CollectionFolderResponseSchema>;

/**
 * Collection folder summary - minimal data for dropdowns/lists.
 */
export const CollectionFolderSummarySchema = CollectionFolderResponseSchema.pick({
  id: true,
  name: true,
  color: true,
});
export type CollectionFolderSummary = z.infer<typeof CollectionFolderSummarySchema>;

/**
 * Collection folder with card count - for folder list views.
 */
export const CollectionFolderWithCountSchema = CollectionFolderResponseSchema.extend({
  /** Number of collection entries in this folder */
  entryCount: z.number().int().nonnegative(),

  /** Total cards (sum of quantities) in this folder */
  cardCount: z.number().int().nonnegative(),
});
export type CollectionFolderWithCount = z.infer<typeof CollectionFolderWithCountSchema>;

// =============================================================================
// INPUT SCHEMAS
// =============================================================================

/**
 * Create collection folder input schema.
 */
export const CreateCollectionFolderInputSchema = z.object({
  /** Folder name (required, unique per user) */
  name: z.string().min(1).max(100).trim(),

  /** Optional description */
  description: z.string().max(500).optional(),

  /** Display color (hex code, defaults to blue) */
  color: HexColorSchema.optional().default('#3B82F6'),
});
export type CreateCollectionFolderInput = z.infer<typeof CreateCollectionFolderInputSchema>;

/**
 * Update collection folder input schema.
 *
 * All fields optional - only provided fields are updated.
 */
export const UpdateCollectionFolderInputSchema = z.object({
  /** New folder name */
  name: z.string().min(1).max(100).trim().optional(),

  /** New description (null to clear) */
  description: z.string().max(500).nullable().optional(),

  /** New display color */
  color: HexColorSchema.optional(),
});
export type UpdateCollectionFolderInput = z.infer<typeof UpdateCollectionFolderInputSchema>;
