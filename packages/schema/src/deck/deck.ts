/**
 * Deck schema.
 *
 * Represents a user's deck with format, sections, and sharing settings.
 * Decks contain DeckSections which contain DeckCards.
 *
 * @example
 * import { DeckResponseSchema, type Deck } from '@decksmith/schema/deck/deck';
 */

import { z } from 'zod';

import { DateTimeSchema, SlugSchema, UuidSchema } from '../primitives/common.js';
import { FormatSchema } from '../primitives/enums.js';
import { TagSummarySchema } from '../tag/tag.js';
import { UserSummarySchema } from '../user/user.js';

// =============================================================================
// DECK RESPONSE
// =============================================================================

/**
 * Deck response schema - what the API returns.
 */
export const DeckResponseSchema = z.object({
  /** Unique deck ID */
  id: UuidSchema,

  /** Owner's user ID */
  userId: UuidSchema,

  /** Deck name */
  name: z.string().min(1).max(100).trim(),

  /** Deck format (Commander, Standard, etc.) */
  format: FormatSchema,

  /** Optional description/notes */
  description: z.string().max(2000).nullable(),

  /** Is this deck publicly viewable? */
  isPublic: z.boolean(),

  /** URL-safe slug for public sharing (null if private) */
  publicSlug: SlugSchema.nullable(),

  /** Total card count (computed) */
  cardCount: z.number().int().nonnegative(),

  /** When the deck was created */
  createdAt: DateTimeSchema,

  /** When the deck was last updated */
  updatedAt: DateTimeSchema,
});
export type Deck = z.infer<typeof DeckResponseSchema>;

/**
 * Deck summary schema - minimal data for lists.
 */
export const DeckSummarySchema = DeckResponseSchema.pick({
  id: true,
  name: true,
  format: true,
  isPublic: true,
  cardCount: true,
});
export type DeckSummary = z.infer<typeof DeckSummarySchema>;

/**
 * Deck with owner info - for public deck views.
 */
export const DeckWithOwnerSchema = DeckResponseSchema.extend({
  /** Deck owner info */
  owner: UserSummarySchema,
});
export type DeckWithOwner = z.infer<typeof DeckWithOwnerSchema>;

/**
 * Deck with tags - for deck list views.
 */
export const DeckWithTagsSchema = DeckResponseSchema.extend({
  /** Tags applied to this deck */
  tags: z.array(TagSummarySchema),
});
export type DeckWithTags = z.infer<typeof DeckWithTagsSchema>;

// =============================================================================
// INPUT SCHEMAS
// =============================================================================

/**
 * Create deck input schema.
 */
export const CreateDeckInputSchema = z.object({
  /** Deck name (required) */
  name: z.string().min(1).max(100).trim(),

  /** Deck format (required) */
  format: FormatSchema,

  /** Optional description */
  description: z.string().max(2000).optional(),

  /** Make deck public (default: false) */
  isPublic: z.boolean().optional().default(false),

  /** Tags to apply (optional) */
  tagIds: z.array(UuidSchema).optional(),
});
export type CreateDeckInput = z.infer<typeof CreateDeckInputSchema>;

/**
 * Update deck input schema.
 *
 * All fields optional - only provided fields are updated.
 */
export const UpdateDeckInputSchema = z.object({
  /** New deck name */
  name: z.string().min(1).max(100).trim().optional(),

  /** New format (warning: may invalidate cards) */
  format: FormatSchema.optional(),

  /** New description (null to clear) */
  description: z.string().max(2000).nullable().optional(),

  /** Update public status */
  isPublic: z.boolean().optional(),

  /** Update tags (replaces existing) */
  tagIds: z.array(UuidSchema).optional(),
});
export type UpdateDeckInput = z.infer<typeof UpdateDeckInputSchema>;

/**
 * Clone deck input schema.
 */
export const CloneDeckInputSchema = z.object({
  /** Name for the cloned deck */
  name: z.string().min(1).max(100).trim(),

  /** Include tags in clone */
  includeTags: z.boolean().optional().default(false),
});
export type CloneDeckInput = z.infer<typeof CloneDeckInputSchema>;

// =============================================================================
// QUERY SCHEMAS
// =============================================================================

/**
 * Deck query parameters.
 */
export const DeckQuerySchema = z.object({
  /** Filter by deck name (partial match) */
  search: z.string().optional(),

  /** Filter by format */
  format: FormatSchema.optional(),

  /** Filter by public status */
  isPublic: z.boolean().optional(),

  /** Filter by tag IDs (decks must have ALL specified tags) */
  tagIds: z.array(UuidSchema).optional(),

  /** Sort field */
  sortBy: z
    .enum(['name', 'format', 'cardCount', 'createdAt', 'updatedAt'])
    .optional()
    .default('updatedAt'),

  /** Sort direction */
  sortDirection: z.enum(['asc', 'desc']).optional().default('desc'),
});
export type DeckQuery = z.infer<typeof DeckQuerySchema>;

// =============================================================================
// DECK STATISTICS
// =============================================================================

/**
 * Deck statistics schema.
 *
 * Summary stats and analytics for a deck.
 */
export const DeckStatsSchema = z.object({
  /** Total cards in deck */
  totalCards: z.number().int().nonnegative(),

  /** Unique cards (by oracle ID) */
  uniqueCards: z.number().int().nonnegative(),

  /** Estimated value in USD */
  totalValueUsd: z.number().nonnegative().nullable(),

  /** Estimated value in EUR */
  totalValueEur: z.number().nonnegative().nullable(),

  /** Mana curve breakdown (cmc -> count) */
  manaCurve: z.record(z.string(), z.number().int().nonnegative()),

  /** Color distribution */
  colorDistribution: z.record(z.string(), z.number().int().nonnegative()),

  /** Type distribution (creature, instant, etc.) */
  typeDistribution: z.record(z.string(), z.number().int().nonnegative()),

  /** How many cards are owned (from collection) */
  ownedCount: z.number().int().nonnegative(),

  /** Cards needed (not owned) */
  missingCount: z.number().int().nonnegative(),
});
export type DeckStats = z.infer<typeof DeckStatsSchema>;
