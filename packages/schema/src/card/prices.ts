/**
 * Price-related schemas for card pricing data.
 *
 * Prices come from Scryfall, which aggregates from TCGplayer (USD)
 * and Cardmarket (EUR).
 *
 * @example
 * import { PricesSchema, type Prices } from '@decksmith/schema/card/prices';
 */

import { z } from 'zod';

// =============================================================================
// PRICE SCHEMAS
// =============================================================================

/**
 * Price value schema.
 *
 * Prices are stored as strings (from Scryfall) to preserve precision.
 * Nullable because not all cards have market data.
 *
 * @example
 * "12.99" // Valid
 * null    // No price data available
 */
export const PriceValueSchema = z.string().nullable();
export type PriceValue = z.infer<typeof PriceValueSchema>;

/**
 * Card prices schema.
 *
 * Matches Scryfall's price structure.
 * All values are in the currency's standard notation (USD dollars, EUR euros).
 *
 * @example
 * {
 *   usd: "12.99",
 *   usdFoil: "24.99",
 *   eur: "10.50",
 *   eurFoil: "21.00"
 * }
 */
export const PricesSchema = z.object({
  /** TCGplayer price in USD (non-foil) */
  usd: PriceValueSchema,

  /** TCGplayer price in USD (foil) */
  usdFoil: PriceValueSchema,

  /** Cardmarket price in EUR (non-foil) */
  eur: PriceValueSchema,

  /** Cardmarket price in EUR (foil) */
  eurFoil: PriceValueSchema,
});
export type Prices = z.infer<typeof PricesSchema>;

/**
 * Parsed price (as number) for calculations.
 *
 * Used when you need to do math with prices.
 */
export const ParsedPriceSchema = z.number().nonnegative().nullable();
export type ParsedPrice = z.infer<typeof ParsedPriceSchema>;

/**
 * Helper to parse a price string to number.
 *
 * @param price - Price string (e.g., "12.99") or null
 * @returns Number or null
 *
 * @example
 * parsePrice("12.99") // 12.99
 * parsePrice(null)    // null
 * parsePrice("")      // null
 */
export function parsePrice(price: PriceValue): ParsedPrice {
  if (price === null || price === '') {
    return null;
  }
  const parsed = Number.parseFloat(price);
  return Number.isNaN(parsed) ? null : parsed;
}

/**
 * Price summary for display.
 *
 * Used when showing a single "best price" to the user.
 */
export const PriceSummarySchema = z.object({
  /** The price value */
  value: z.number().nonnegative(),

  /** Currency code */
  currency: z.enum(['usd', 'eur']),

  /** Whether this is a foil price */
  isFoil: z.boolean(),
});
export type PriceSummary = z.infer<typeof PriceSummarySchema>;
