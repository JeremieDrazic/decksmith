/**
 * Primitive enum schemas for the Decksmith application.
 *
 * These are the building blocks used by other schemas.
 * Use `Schema.options` to get the raw array values for dropdowns, etc.
 *
 * @example
 * import { FormatSchema, type Format } from '@decksmith/schema/primitives/enums';
 *
 * // Validate input
 * const format = FormatSchema.parse('commander'); // ✅
 *
 * // Get all valid values (for dropdowns)
 * const formats = FormatSchema.options; // ['commander', 'standard', ...]
 *
 * // TypeScript type
 * const myFormat: Format = 'standard';
 */

import { z } from 'zod';

// =============================================================================
// DECK & GAMEPLAY
// =============================================================================

/**
 * Magic: The Gathering deck formats.
 *
 * Each format has different rules for deck construction:
 * - commander: 100 cards, singleton, color identity rules
 * - duel: 1v1 Commander variant with different banlist
 * - brawl: 60-card Commander variant for Standard-legal cards
 * - standard: 60 cards, 4-of limit, rotating sets
 * - modern: 60 cards, non-rotating, cards from 8th Edition onward
 * - pioneer: 60 cards, non-rotating, cards from Return to Ravnica onward
 * - legacy: 60 cards, non-rotating, all cards legal (with banlist)
 * - vintage: 60 cards, all cards legal, some restricted to 1 copy
 * - pauper: 60 cards, commons only
 * - limited: 40 cards minimum, built from sealed/draft pool
 * - casual: No restrictions, kitchen table magic
 */
export const FormatSchema = z.enum([
  'commander',
  'duel',
  'brawl',
  'standard',
  'modern',
  'pioneer',
  'legacy',
  'vintage',
  'pauper',
  'limited',
  'casual',
]);
export type Format = z.infer<typeof FormatSchema>;

/**
 * MTG color identity (WUBRG + Colorless).
 *
 * W = White (Plains)
 * U = Blue (Island) - "U" because "B" is taken by Black
 * B = Black (Swamp)
 * R = Red (Mountain)
 * G = Green (Forest)
 * C = Colorless (artifacts, lands, Eldrazi)
 *
 * Note: 'C' was introduced in Oath of the Gatewatch (2016) for colorless mana costs.
 * Before that, colorless was represented by absence of color.
 */
export const ColorSchema = z.enum(['W', 'U', 'B', 'R', 'G', 'C']);
export type Color = z.infer<typeof ColorSchema>;

/**
 * Card rarity levels.
 *
 * Determines how often a card appears in booster packs:
 * - common: ~10 per pack
 * - uncommon: ~3 per pack
 * - rare: ~1 per pack (or mythic)
 * - mythic: ~1 in 8 packs (replaces rare slot)
 */
export const RaritySchema = z.enum(['common', 'uncommon', 'rare', 'mythic']);
export type Rarity = z.infer<typeof RaritySchema>;

// =============================================================================
// COLLECTION
// =============================================================================

/**
 * Physical condition of a card.
 *
 * Based on TCGplayer/Cardmarket grading standards:
 * - NM: Near Mint (perfect or nearly perfect)
 * - LP: Lightly Played (minor wear)
 * - MP: Moderately Played (noticeable wear)
 * - HP: Heavily Played (significant wear)
 * - DMG: Damaged (major damage, creases, water damage)
 */
export const ConditionSchema = z.enum(['NM', 'LP', 'MP', 'HP', 'DMG']);
export type Condition = z.infer<typeof ConditionSchema>;

// =============================================================================
// USER PREFERENCES
// =============================================================================

/**
 * UI theme preference.
 *
 * - light: Always light mode
 * - dark: Always dark mode
 * - system: Follow OS preference
 */
export const ThemeSchema = z.enum(['light', 'dark', 'system']);
export type Theme = z.infer<typeof ThemeSchema>;

/**
 * Supported currencies for price display.
 */
export const CurrencySchema = z.enum(['usd', 'eur']);
export type Currency = z.infer<typeof CurrencySchema>;

/**
 * Supported languages for the application.
 */
export const LanguageSchema = z.enum(['en', 'fr']);
export type Language = z.infer<typeof LanguageSchema>;

/**
 * Measurement units for PDF generation.
 *
 * - mm: Millimeters (metric, used in Europe)
 * - inches: Imperial (used in US)
 */
export const UnitsSchema = z.enum(['mm', 'inches']);
export type Units = z.infer<typeof UnitsSchema>;

/**
 * Default print selection strategy when adding cards to decks.
 *
 * - latest: Most recent printing
 * - cheapest: Lowest price printing
 * - original: First printing (Alpha, Beta, etc.)
 */
export const PrintSelectionSchema = z.enum(['latest', 'cheapest', 'original']);
export type PrintSelection = z.infer<typeof PrintSelectionSchema>;

// =============================================================================
// ORGANIZATION
// =============================================================================

/**
 * Tag types for organizing different entities.
 *
 * - deck: Tags for categorizing decks (e.g., "Competitive", "Budget")
 * - collection: Tags for organizing collection entries (e.g., "Trade", "Keep")
 * - card: Tags for bookmarking cards (e.g., "Wishlist", "Staples")
 */
export const TagTypeSchema = z.enum(['deck', 'collection', 'card']);
export type TagType = z.infer<typeof TagTypeSchema>;

// =============================================================================
// CONTENT
// =============================================================================

/**
 * Categories for Craft Guide articles.
 */
export const ArticleCategorySchema = z.enum(['equipment', 'tutorial', 'tips', 'review']);
export type ArticleCategory = z.infer<typeof ArticleCategorySchema>;

// =============================================================================
// RECOMMENDATIONS
// =============================================================================

/**
 * User feedback on AI recommendations.
 */
export const FeedbackTypeSchema = z.enum(['helpful', 'not_helpful']);
export type FeedbackType = z.infer<typeof FeedbackTypeSchema>;
