/**
 * DeckCard schema.
 *
 * Represents a card within a specific deck section.
 * Links to CardPrint for the specific edition being used.
 *
 * @example
 * import { DeckCardResponseSchema, type DeckCard } from '@decksmith/schema/deck/deck-card';
 */

import { z } from 'zod';

import { CardPrintSummarySchema, ImageUrisSchema } from '../card/card-print.js';
import { CardSummarySchema } from '../card/card.js';
import { PricesSchema } from '../card/prices.js';
import { DateTimeSchema, PositiveIntSchema, UuidSchema } from '../primitives/common.js';

// =============================================================================
// DECK CARD RESPONSE
// =============================================================================

/**
 * Deck card response schema - what the API returns.
 */
export const DeckCardResponseSchema = z.object({
  /** Unique deck card ID */
  id: UuidSchema,

  /** Parent section ID */
  sectionId: UuidSchema,

  /** Card print being used */
  cardPrintId: UuidSchema,

  /** Number of copies in deck */
  quantity: PositiveIntSchema,

  /** Display position within section */
  position: z.number().int().nonnegative(),

  /** Optional notes (e.g., "swap for budget option", "testing") */
  notes: z.string().max(200).nullable(),

  /** When the card was added to deck */
  createdAt: DateTimeSchema,

  /** When the card was last updated */
  updatedAt: DateTimeSchema,
});
export type DeckCard = z.infer<typeof DeckCardResponseSchema>;

/**
 * Deck card summary - minimal data for references.
 */
export const DeckCardSummarySchema = DeckCardResponseSchema.pick({
  id: true,
  sectionId: true,
  cardPrintId: true,
  quantity: true,
});
export type DeckCardSummary = z.infer<typeof DeckCardSummarySchema>;

// =============================================================================
// DECK CARD WITH RELATIONS
// =============================================================================

/**
 * CardPrint embed for deck cards.
 *
 * Extends CardPrintSummary with fields needed for deck display.
 */
export const DeckCardPrintEmbedSchema = CardPrintSummarySchema.extend({
  /** Full image URIs */
  imageUris: ImageUrisSchema.nullable(),

  /** Current prices */
  prices: PricesSchema,

  /** Foil availability */
  foil: z.boolean(),

  /** Non-foil availability */
  nonfoil: z.boolean(),
});
export type DeckCardPrintEmbed = z.infer<typeof DeckCardPrintEmbedSchema>;

/**
 * Deck card with full card/print data - for deck views.
 */
export const DeckCardWithRelationsSchema = DeckCardResponseSchema.extend({
  /** Card print data */
  cardPrint: DeckCardPrintEmbedSchema.extend({
    /** Parent card (Oracle) data */
    card: CardSummarySchema,
  }),

  /** Is this card owned? (from collection) */
  isOwned: z.boolean(),

  /** How many copies are owned */
  ownedQuantity: z.number().int().nonnegative(),
});
export type DeckCardWithRelations = z.infer<typeof DeckCardWithRelationsSchema>;

// =============================================================================
// INPUT SCHEMAS
// =============================================================================

/**
 * Add card to deck input schema.
 */
export const AddCardToDeckInputSchema = z.object({
  /** Section to add card to */
  sectionId: UuidSchema,

  /** Card print to add */
  cardPrintId: UuidSchema,

  /** Number of copies (default: 1) */
  quantity: PositiveIntSchema.optional().default(1),

  /** Position in section (optional, defaults to end) */
  position: z.number().int().nonnegative().optional(),

  /** Optional notes */
  notes: z.string().max(200).optional(),
});
export type AddCardToDeckInput = z.infer<typeof AddCardToDeckInputSchema>;

/**
 * Update deck card input schema.
 */
export const UpdateDeckCardInputSchema = z.object({
  /** New quantity */
  quantity: PositiveIntSchema.optional(),

  /** New position */
  position: z.number().int().nonnegative().optional(),

  /** Change card print (different edition) */
  cardPrintId: UuidSchema.optional(),

  /** Update notes (null to clear) */
  notes: z.string().max(200).nullable().optional(),
});
export type UpdateDeckCardInput = z.infer<typeof UpdateDeckCardInputSchema>;

/**
 * Move card to section input schema.
 */
export const MoveCardToSectionInputSchema = z.object({
  /** Target section ID */
  sectionId: UuidSchema,

  /** Position in new section (optional, defaults to end) */
  position: z.number().int().nonnegative().optional(),
});
export type MoveCardToSectionInput = z.infer<typeof MoveCardToSectionInputSchema>;

/**
 * Reorder cards in section input schema.
 */
export const ReorderCardsInputSchema = z.object({
  /** Card IDs in new order */
  cardIds: z.array(UuidSchema).min(1),
});
export type ReorderCardsInput = z.infer<typeof ReorderCardsInputSchema>;

/**
 * Bulk add cards input schema.
 */
export const BulkAddCardsInputSchema = z.object({
  /** Section to add cards to */
  sectionId: UuidSchema,

  /** Cards to add */
  cards: z
    .array(
      z.object({
        cardPrintId: UuidSchema,
        quantity: PositiveIntSchema.optional().default(1),
      })
    )
    .min(1),
});
export type BulkAddCardsInput = z.infer<typeof BulkAddCardsInputSchema>;
