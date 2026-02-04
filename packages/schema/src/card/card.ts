/**
 * Card (Oracle) schema - represents a card's rules identity.
 *
 * A Card is identified by its Oracle ID from Scryfall.
 * All printings of the same card share the same Oracle ID.
 *
 * Example: All printings of "Lightning Bolt" (Alpha, M10, M11, etc.)
 * share the same Oracle ID because they have identical rules text.
 *
 * @example
 * import { CardResponseSchema, type Card } from '@decksmith/schema/card/card';
 */

import { z } from 'zod';

import { ColorSchema } from '../primitives/enums.js';
import { DateTimeSchema, UuidSchema } from '../primitives/common.js';

// =============================================================================
// LEGALITIES
// =============================================================================

/**
 * Card legality status in a format.
 *
 * - legal: Can play any number (up to format's copy limit)
 * - not_legal: Not available in this format
 * - restricted: Only 1 copy allowed (Vintage)
 * - banned: Explicitly forbidden
 */
export const LegalityStatusSchema = z.enum([
  'legal',
  'not_legal',
  'restricted',
  'banned',
]);
export type LegalityStatus = z.infer<typeof LegalityStatusSchema>;

/**
 * Legalities object mapping format to status.
 *
 * Matches Scryfall's legalities object structure.
 *
 * @example
 * { commander: 'legal', vintage: 'restricted', standard: 'not_legal' }
 */
export const LegalitiesSchema = z.record(z.string(), LegalityStatusSchema);
export type Legalities = z.infer<typeof LegalitiesSchema>;

// =============================================================================
// CARD SCHEMAS
// =============================================================================

/**
 * Card response schema - what the API returns.
 *
 * This represents the canonical card data from Scryfall's Oracle.
 * It does NOT include edition-specific data (artwork, prices) -
 * that's in CardPrint.
 */
export const CardResponseSchema = z.object({
  /** Scryfall Oracle ID - unique identifier for this card's rules identity */
  oracleId: UuidSchema,

  /** Card name (English) */
  name: z.string(),

  /** Mana cost in Scryfall notation (e.g., "{2}{U}{U}") */
  manaCost: z.string().nullable(),

  /** Type line (e.g., "Creature — Human Wizard") */
  typeLine: z.string(),

  /** Rules text (oracle text) */
  oracleText: z.string().nullable(),

  /** Color identity array (e.g., ["U", "R"] for Izzet) */
  colors: z.array(ColorSchema),

  /** Converted mana cost / mana value */
  cmc: z.number().nonnegative(),

  /** Format legalities */
  legalities: LegalitiesSchema,

  /** Link to Scryfall card page */
  scryfallUri: z.string().url(),

  /** When this card was first synced */
  createdAt: DateTimeSchema,

  /** When this card was last updated from Scryfall */
  updatedAt: DateTimeSchema,
});
export type Card = z.infer<typeof CardResponseSchema>;

/**
 * Card summary schema - minimal data for lists and autocomplete.
 */
export const CardSummarySchema = CardResponseSchema.pick({
  oracleId: true,
  name: true,
  manaCost: true,
  typeLine: true,
  colors: true,
  cmc: true,
});
export type CardSummary = z.infer<typeof CardSummarySchema>;

/**
 * Card search result schema - includes relevance info.
 */
export const CardSearchResultSchema = CardSummarySchema.extend({
  /** Primary image URL for display in search results */
  imageUrl: z.string().url().nullable(),
});
export type CardSearchResult = z.infer<typeof CardSearchResultSchema>;
