/**
 * CollectionEntry schema.
 *
 * Represents a user's owned card with quantity, condition, and metadata.
 * Each entry is unique by (user_id, card_print_id, is_foil, condition).
 *
 * @example
 * import { CollectionEntryResponseSchema, type CollectionEntry } from '@decksmith/schema/collection/collection-entry';
 */

import { z } from 'zod';

import { CardPrintSummarySchema, ImageUrisSchema } from '../card/card-print.js';
import { CardSummarySchema } from '../card/card.js';
import { PricesSchema } from '../card/prices.js';
import { DeckSummarySchema } from '../deck/deck.js';
import { DateSchema, DateTimeSchema, PositiveIntSchema, UuidSchema } from '../primitives/common.js';
import { ConditionSchema } from '../primitives/enums.js';
import { TagSummarySchema } from '../tag/tag.js';

import { CollectionFolderSummarySchema } from './folder.js';

// =============================================================================
// CUSTOM FIELDS
// =============================================================================

/**
 * Custom fields schema.
 *
 * User-defined key-value pairs for additional metadata.
 * Keys must be strings, values can be string, number, or boolean.
 *
 * Example: { "acquired_from": "LGS", "grade": 9.5 }
 */
export const CustomFieldsSchema = z.record(
  z.string(),
  z.union([z.string(), z.number(), z.boolean()])
);
export type CustomFields = z.infer<typeof CustomFieldsSchema>;

// =============================================================================
// CARD OWNERSHIP & AVAILABILITY
// =============================================================================

/**
 * Card ownership status schema.
 *
 * Tracks how many copies of a card are owned and how many are available
 * (not already used in other decks).
 */
export const CardOwnershipSchema = z.object({
  /** Is this card in the user's collection? */
  isOwned: z.boolean(),

  /** Total copies owned across all conditions/foil variants */
  ownedQuantity: z.number().int().nonnegative(),

  /** Copies currently used across all decks */
  usedInDecks: z.number().int().nonnegative(),

  /** Available copies (owned - used in decks) */
  availableQuantity: z.number().int().nonnegative(),
});
export type CardOwnership = z.infer<typeof CardOwnershipSchema>;

// =============================================================================
// DECK USAGE (where is this card used?)
// =============================================================================

/**
 * Deck usage summary - shows which decks contain this card.
 *
 * Uses DeckSummarySchema for deck info.
 */
export const DeckUsageSchema = z.object({
  /** Deck info */
  deck: DeckSummarySchema,

  /** How many copies in this deck */
  quantity: PositiveIntSchema,

  /** Section name where the card is placed */
  sectionName: z.string(),
});
export type DeckUsage = z.infer<typeof DeckUsageSchema>;

// =============================================================================
// COLLECTION ENTRY RESPONSE
// =============================================================================

/**
 * Collection entry response schema - what the API returns.
 */
export const CollectionEntryResponseSchema = z.object({
  /** Unique entry ID */
  id: UuidSchema,

  /** Owner's user ID */
  userId: UuidSchema,

  /** Folder this entry belongs to (null = unfiled) */
  folderId: UuidSchema.nullable(),

  /** Reference to the specific card print */
  cardPrintId: UuidSchema,

  /** Number of copies owned (minimum 1) */
  quantity: PositiveIntSchema,

  /** Card condition */
  condition: ConditionSchema,

  /** Is this entry for foil copies? */
  isFoil: z.boolean(),

  /** When the card was acquired (optional) */
  acquiredDate: DateSchema.nullable(),

  /** User notes about this entry (optional) */
  notes: z.string().nullable(),

  /** User-defined custom fields (optional) */
  customFields: CustomFieldsSchema.nullable(),

  /** When the entry was created */
  createdAt: DateTimeSchema,

  /** When the entry was last updated */
  updatedAt: DateTimeSchema,
});
export type CollectionEntry = z.infer<typeof CollectionEntryResponseSchema>;

// =============================================================================
// COLLECTION ENTRY WITH RELATIONS (for list/detail views)
// =============================================================================

/**
 * CardPrint embed for collection entries.
 *
 * Extends CardPrintSummary with additional fields needed for collection display.
 */
export const CardPrintEmbedSchema = CardPrintSummarySchema.extend({
  /** Full image URIs for display */
  imageUris: ImageUrisSchema.nullable(),

  /** Current prices */
  prices: PricesSchema,

  /** Foil availability */
  foil: z.boolean(),

  /** Non-foil availability */
  nonfoil: z.boolean(),
});
export type CardPrintEmbed = z.infer<typeof CardPrintEmbedSchema>;

/**
 * Collection entry with all related data - for list views.
 *
 * Includes card print, card (Oracle), folder, tags, and deck usage.
 */
export const CollectionEntryWithRelationsSchema = CollectionEntryResponseSchema.extend({
  /** Card print data */
  cardPrint: CardPrintEmbedSchema.extend({
    /** Parent card (Oracle) data */
    card: CardSummarySchema,
  }),

  /** Folder this entry belongs to (null = unfiled) */
  folder: CollectionFolderSummarySchema.nullable(),

  /** Tags applied to this entry */
  tags: z.array(TagSummarySchema),

  /** Decks that contain this card (from user's collection) */
  deckUsage: z.array(DeckUsageSchema),
});
export type CollectionEntryWithRelations = z.infer<typeof CollectionEntryWithRelationsSchema>;

// =============================================================================
// INPUT SCHEMAS
// =============================================================================

/**
 * Add card to collection input schema.
 *
 * Creates a new collection entry or increments quantity if exists.
 */
export const AddToCollectionInputSchema = z.object({
  /** Card print to add */
  cardPrintId: UuidSchema,

  /** Number of copies to add (default: 1) */
  quantity: PositiveIntSchema.optional().default(1),

  /** Card condition */
  condition: ConditionSchema,

  /** Is this a foil copy? */
  isFoil: z.boolean(),

  /** Folder to place the card in (optional) */
  folderId: UuidSchema.optional(),

  /** When the card was acquired (optional) */
  acquiredDate: DateSchema.optional(),

  /** User notes (optional) */
  notes: z.string().max(1000).optional(),

  /** Custom fields (optional) */
  customFields: CustomFieldsSchema.optional(),

  /** Tags to apply (optional) */
  tagIds: z.array(UuidSchema).optional(),
});
export type AddToCollectionInput = z.infer<typeof AddToCollectionInputSchema>;

/**
 * Update collection entry input schema.
 *
 * All fields optional - only provided fields are updated.
 */
export const UpdateCollectionEntryInputSchema = z.object({
  /** New quantity (must be >= 1, or use remove endpoint) */
  quantity: PositiveIntSchema.optional(),

  /** Update condition */
  condition: ConditionSchema.optional(),

  /** Update foil status */
  isFoil: z.boolean().optional(),

  /** Move to different folder (null to unfiled) */
  folderId: UuidSchema.nullable().optional(),

  /** Update acquired date */
  acquiredDate: DateSchema.nullable().optional(),

  /** Update notes */
  notes: z.string().max(1000).nullable().optional(),

  /** Update custom fields (replaces existing) */
  customFields: CustomFieldsSchema.nullable().optional(),

  /** Update tags (replaces existing) */
  tagIds: z.array(UuidSchema).optional(),
});
export type UpdateCollectionEntryInput = z.infer<typeof UpdateCollectionEntryInputSchema>;

/**
 * Remove from collection input schema.
 *
 * Decrements quantity. If quantity reaches 0, entry is deleted.
 */
export const RemoveFromCollectionInputSchema = z.object({
  /** Number of copies to remove (default: 1) */
  quantity: PositiveIntSchema.optional().default(1),
});
export type RemoveFromCollectionInput = z.infer<typeof RemoveFromCollectionInputSchema>;

/**
 * Bulk move entries to folder input schema.
 */
export const BulkMoveToFolderInputSchema = z.object({
  /** Entry IDs to move */
  entryIds: z.array(UuidSchema).min(1),

  /** Target folder ID (null to unfiled) */
  folderId: UuidSchema.nullable(),
});
export type BulkMoveToFolderInput = z.infer<typeof BulkMoveToFolderInputSchema>;

/**
 * Bulk add tags input schema.
 */
export const BulkAddTagsInputSchema = z.object({
  /** Entry IDs to tag */
  entryIds: z.array(UuidSchema).min(1),

  /** Tag IDs to add */
  tagIds: z.array(UuidSchema).min(1),
});
export type BulkAddTagsInput = z.infer<typeof BulkAddTagsInputSchema>;

// =============================================================================
// QUERY SCHEMAS
// =============================================================================

/**
 * Collection query parameters.
 *
 * Filter and sort collection entries.
 */
export const CollectionQuerySchema = z.object({
  /** Filter by card name (partial match) */
  search: z.string().optional(),

  /** Filter by folder (null = unfiled only) */
  folderId: UuidSchema.nullable().optional(),

  /** Filter by condition */
  condition: ConditionSchema.optional(),

  /** Filter by foil status */
  isFoil: z.boolean().optional(),

  /** Filter by set code */
  setCode: z.string().optional(),

  /** Filter by tag IDs (entries must have ALL specified tags) */
  tagIds: z.array(UuidSchema).optional(),

  /** Sort field */
  sortBy: z
    .enum(['name', 'acquiredDate', 'quantity', 'price', 'setCode', 'createdAt', 'condition'])
    .optional()
    .default('name'),

  /** Sort direction */
  sortDirection: z.enum(['asc', 'desc']).optional().default('asc'),
});
export type CollectionQuery = z.infer<typeof CollectionQuerySchema>;

// =============================================================================
// COLLECTION STATISTICS
// =============================================================================

/**
 * Collection statistics schema.
 *
 * Summary stats for the user's collection.
 */
export const CollectionStatsSchema = z.object({
  /** Total unique cards (by oracle ID) */
  uniqueCards: z.number().int().nonnegative(),

  /** Total cards including quantities */
  totalCards: z.number().int().nonnegative(),

  /** Total estimated value in USD */
  totalValueUsd: z.number().nonnegative().nullable(),

  /** Total estimated value in EUR */
  totalValueEur: z.number().nonnegative().nullable(),

  /** Breakdown by condition */
  byCondition: z.record(ConditionSchema, z.number().int().nonnegative()),

  /** Number of foil cards */
  foilCount: z.number().int().nonnegative(),

  /** Breakdown by folder */
  byFolder: z.array(
    z.object({
      folderId: UuidSchema.nullable(),
      folderName: z.string().nullable(),
      count: z.number().int().nonnegative(),
    })
  ),
});
export type CollectionStats = z.infer<typeof CollectionStatsSchema>;
