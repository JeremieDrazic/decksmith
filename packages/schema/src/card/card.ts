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

import { DateTimeSchema, UuidSchema } from '../primitives/common.js';
import { ColorSchema } from '../primitives/enums.js';

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
export const LegalityStatusSchema = z.enum(['legal', 'not_legal', 'restricted', 'banned']);
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
// CARD FACE
// =============================================================================

/**
 * A single face of a multi-face card (transform, split, modal DFC, adventure…).
 *
 * Only multi-face cards expose faces. A normal single-face card returns an empty
 * `faces` array and carries its rules data on the Card itself.
 *
 * @see CardResponseSchema (the `faces` field)
 */
export const CardFaceSchema = z.object({
  /** Position in the card's face order — 0 = front, 1 = back */
  faceIndex: z.number().int().nonnegative(),

  /** This face's name (e.g., "Insectile Aberration") */
  name: z.string(),

  /** This face's mana cost, or null (e.g., the back of a transform card) */
  manaCost: z.string().nullable(),

  /** This face's type line, or null */
  typeLine: z.string().nullable(),

  /** This face's rules text, or null */
  oracleText: z.string().nullable(),

  /** This face's colours (may differ from the other face) */
  colors: z.array(ColorSchema),
});
export type CardFace = z.infer<typeof CardFaceSchema>;

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
  typeLine: z.string().nullable(),

  /** Rules text (oracle text) */
  oracleText: z.string().nullable(),

  /** Casting-cost colours (e.g., ["U", "R"] for Izzet) */
  colors: z.array(ColorSchema),

  /**
   * Colour identity — every colour on the card (mana cost, rules text, colour
   * indicator), not just the casting cost. Drives Commander legality. May be
   * wider than `colors`: a card with a colourless cost but a coloured activated
   * ability is colourless in `colors` yet coloured in `colorIdentity`.
   */
  colorIdentity: z.array(ColorSchema),

  /** Converted mana cost / mana value */
  cmc: z.number().nonnegative(),

  /**
   * Scryfall layout — tells consumers how to read the card. "normal" for
   * single-face; "transform" / "modal_dfc" / "split" / "adventure" / "token" / …
   * otherwise. Kept a free string so a new Scryfall layout never breaks
   * deserialization (unknown → treat as single-face).
   */
  layout: z.string(),

  /** Per-face oracle data. Empty for single-face cards (layout "normal"). */
  faces: z.array(CardFaceSchema),

  /** Format legalities */
  legalities: LegalitiesSchema,

  /** Link to Scryfall card page */
  scryfallUri: z.url(),

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
  imageUrl: z.url().nullable(),
});
export type CardSearchResult = z.infer<typeof CardSearchResultSchema>;
