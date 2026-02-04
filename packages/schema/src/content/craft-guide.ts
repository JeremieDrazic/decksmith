/**
 * CraftGuideArticle schema.
 *
 * Static educational content for equipment guides, tutorials, and tips.
 * Public content, admin-managed (MVP).
 *
 * @example
 * import { CraftGuideArticleResponseSchema, type CraftGuideArticle } from '@decksmith/schema/content/craft-guide';
 */

import { z } from 'zod';

import { DateTimeSchema, SlugSchema, UuidSchema } from '../primitives/common.js';
import { ArticleCategorySchema } from '../primitives/enums.js';

// =============================================================================
// CRAFT GUIDE ARTICLE RESPONSE
// =============================================================================

/**
 * Craft guide article response schema - what the API returns.
 */
export const CraftGuideArticleResponseSchema = z.object({
  /** Unique article ID */
  id: UuidSchema,

  /** URL-safe slug (e.g., "best-printers-2026") */
  slug: SlugSchema,

  /** Article title */
  title: z.string().min(1).max(200).trim(),

  /** Markdown content */
  content: z.string(),

  /** Article category */
  category: ArticleCategorySchema,

  /** Thumbnail image URL (optional) */
  thumbnailUrl: z.string().url().nullable(),

  /** Publication date (null = draft) */
  publishedAt: DateTimeSchema.nullable(),

  /** When the article was created */
  createdAt: DateTimeSchema,

  /** When the article was last updated */
  updatedAt: DateTimeSchema,
});
export type CraftGuideArticle = z.infer<typeof CraftGuideArticleResponseSchema>;

/**
 * Craft guide article summary - for list views.
 */
export const CraftGuideArticleSummarySchema = CraftGuideArticleResponseSchema.pick({
  id: true,
  slug: true,
  title: true,
  category: true,
  thumbnailUrl: true,
  publishedAt: true,
});
export type CraftGuideArticleSummary = z.infer<typeof CraftGuideArticleSummarySchema>;

// =============================================================================
// INPUT SCHEMAS (Admin only)
// =============================================================================

/**
 * Create craft guide article input schema.
 */
export const CreateCraftGuideArticleInputSchema = z.object({
  /** URL-safe slug (required, unique) */
  slug: SlugSchema,

  /** Article title (required) */
  title: z.string().min(1).max(200).trim(),

  /** Markdown content (required) */
  content: z.string().min(1),

  /** Article category (required) */
  category: ArticleCategorySchema,

  /** Thumbnail URL (optional) */
  thumbnailUrl: z.string().url().optional(),

  /** Publish immediately (default: false = draft) */
  publish: z.boolean().optional().default(false),
});
export type CreateCraftGuideArticleInput = z.infer<typeof CreateCraftGuideArticleInputSchema>;

/**
 * Update craft guide article input schema.
 */
export const UpdateCraftGuideArticleInputSchema = z.object({
  /** New slug (requires uniqueness check) */
  slug: SlugSchema.optional(),

  /** New title */
  title: z.string().min(1).max(200).trim().optional(),

  /** New content */
  content: z.string().min(1).optional(),

  /** New category */
  category: ArticleCategorySchema.optional(),

  /** New thumbnail URL (null to remove) */
  thumbnailUrl: z.string().url().nullable().optional(),

  /** Publish or unpublish */
  publish: z.boolean().optional(),
});
export type UpdateCraftGuideArticleInput = z.infer<typeof UpdateCraftGuideArticleInputSchema>;

// =============================================================================
// QUERY SCHEMAS
// =============================================================================

/**
 * Craft guide article query parameters.
 */
export const CraftGuideArticleQuerySchema = z.object({
  /** Filter by category */
  category: ArticleCategorySchema.optional(),

  /** Search by title (partial match) */
  search: z.string().optional(),

  /** Include drafts (admin only, default: false) */
  includeDrafts: z.boolean().optional().default(false),

  /** Sort field */
  sortBy: z.enum(['title', 'publishedAt', 'createdAt']).optional().default('publishedAt'),

  /** Sort direction */
  sortDirection: z.enum(['asc', 'desc']).optional().default('desc'),
});
export type CraftGuideArticleQuery = z.infer<typeof CraftGuideArticleQuerySchema>;
