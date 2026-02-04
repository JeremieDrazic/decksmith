/**
 * CardPrint schema - represents a specific edition/variant of a card.
 *
 * While Card represents the rules identity, CardPrint represents:
 * - Which set it's from (Alpha, M10, etc.)
 * - Which artwork it has
 * - Current market prices
 * - Language variant
 *
 * Example: "Lightning Bolt from Alpha" and "Lightning Bolt from M10"
 * are different CardPrints of the same Card (same Oracle ID).
 *
 * @example
 * import { CardPrintResponseSchema, type CardPrint } from '@decksmith/schema/card/card-print';
 */

import { z } from 'zod';

import { DateTimeSchema, UuidSchema } from '../primitives/common.js';
import { RaritySchema } from '../primitives/enums.js';

import { CardResponseSchema } from './card.js';
import { PricesSchema } from './prices.js';

// =============================================================================
// IMAGE URIS
// =============================================================================

/**
 * Image URIs schema.
 *
 * Scryfall provides multiple image sizes for different use cases.
 */
export const ImageUrisSchema = z.object({
  /** Small thumbnail (146x204) - for lists */
  small: z.string().url(),

  /** Normal size (488x680) - for detail views */
  normal: z.string().url(),

  /** Large size (672x936) - for high-res display */
  large: z.string().url(),

  /** Full PNG (745x1040) - for printing */
  png: z.string().url(),

  /** Art crop - just the artwork, no frame */
  artCrop: z.string().url(),

  /** Border crop - full card, tight crop */
  borderCrop: z.string().url(),
});
export type ImageUris = z.infer<typeof ImageUrisSchema>;

// =============================================================================
// CARD PRINT SCHEMAS
// =============================================================================

/**
 * CardPrint response schema - what the API returns.
 *
 * Includes all edition-specific data: set, artwork, prices, language.
 */
export const CardPrintResponseSchema = z.object({
  /** Unique ID for this print */
  id: UuidSchema,

  /** Scryfall card ID (unique per print) */
  scryfallId: UuidSchema,

  /** Oracle ID - links to Card */
  oracleId: UuidSchema,

  /** Set code (e.g., "LEA" for Limited Edition Alpha) */
  setCode: z.string().min(2).max(6),

  /** Collector number within set (e.g., "162") */
  collectorNumber: z.string(),

  /** Illustration ID - unique per artwork */
  illustrationId: UuidSchema.nullable(),

  /** Image URLs for different sizes */
  imageUris: ImageUrisSchema.nullable(),

  /** Card rarity in this set */
  rarity: RaritySchema,

  /** Can this print be foil? */
  foil: z.boolean(),

  /** Can this print be non-foil? */
  nonfoil: z.boolean(),

  /** Current market prices */
  prices: PricesSchema,

  /** When prices were last updated */
  pricesUpdatedAt: DateTimeSchema.nullable(),

  /** Language code (e.g., "en", "fr", "es") */
  language: z.string().length(2),

  /** Localized card name (null = use English) */
  localizedName: z.string().nullable(),

  /** Localized type line (null = use English) */
  localizedType: z.string().nullable(),

  /** Localized oracle text (null = use English) */
  localizedText: z.string().nullable(),

  /** When this print was first synced */
  createdAt: DateTimeSchema,

  /** When this print was last updated */
  updatedAt: DateTimeSchema,
});
export type CardPrint = z.infer<typeof CardPrintResponseSchema>;

/**
 * CardPrint summary schema - minimal data for lists.
 */
export const CardPrintSummarySchema = z.object({
  id: UuidSchema,
  oracleId: UuidSchema,
  setCode: z.string(),
  collectorNumber: z.string(),
  rarity: RaritySchema,
  language: z.string().length(2),
  /** Single image URL for display */
  imageUrl: z.string().url().nullable(),
  /** Non-foil price in user's preferred currency */
  price: z.string().nullable(),
});
export type CardPrintSummary = z.infer<typeof CardPrintSummarySchema>;

/**
 * Subset of Card fields embedded in CardPrint responses.
 *
 * Picks only the fields needed when displaying a CardPrint with its parent Card.
 */
export const CardEmbedSchema = CardResponseSchema.pick({
  name: true,
  manaCost: true,
  typeLine: true,
  oracleText: true,
  cmc: true,
});
export type CardEmbed = z.infer<typeof CardEmbedSchema>;

/**
 * CardPrint with full Card data - for detail views.
 *
 * Combines CardPrint with its parent Card data.
 */
export const CardPrintWithCardSchema = CardPrintResponseSchema.extend({
  /** Parent card data */
  card: CardEmbedSchema,
});
export type CardPrintWithCard = z.infer<typeof CardPrintWithCardSchema>;

/**
 * CardPrint selection for deck building.
 *
 * When adding a card to a deck, the user selects a specific print.
 */
export const CardPrintSelectionSchema = z.object({
  /** The print to use */
  cardPrintId: UuidSchema,

  /** Optional: quantity (defaults to 1) */
  quantity: z.number().int().positive().default(1),
});
export type CardPrintSelection = z.infer<typeof CardPrintSelectionSchema>;
