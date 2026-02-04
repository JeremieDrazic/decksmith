/**
 * Common reusable schemas for the Decksmith application.
 *
 * These are building blocks used across multiple entity schemas.
 *
 * @example
 * import { UuidSchema, DateTimeSchema } from '@decksmith/schema/primitives/common';
 *
 * const MyEntitySchema = z.object({
 *   id: UuidSchema,
 *   createdAt: DateTimeSchema,
 * });
 */

import { z } from 'zod';

// =============================================================================
// IDENTIFIERS
// =============================================================================

/**
 * UUID v4 schema.
 *
 * Used for all entity IDs in the system.
 *
 * @example
 * UuidSchema.parse('550e8400-e29b-41d4-a716-446655440000'); // ✅
 * UuidSchema.parse('not-a-uuid'); // ❌ ZodError
 */
export const UuidSchema = z.uuid();
export type Uuid = z.infer<typeof UuidSchema>;

// =============================================================================
// TIMESTAMPS
// =============================================================================

/**
 * ISO 8601 datetime string schema.
 *
 * Used for all timestamps in API responses.
 * Format: YYYY-MM-DDTHH:mm:ss.sssZ
 *
 * @example
 * DateTimeSchema.parse('2026-02-04T12:00:00.000Z'); // ✅
 * DateTimeSchema.parse('2026-02-04'); // ❌ ZodError (missing time)
 */
export const DateTimeSchema = z.iso.datetime();
export type DateTime = z.infer<typeof DateTimeSchema>;

/**
 * ISO 8601 date string schema (date only, no time).
 *
 * Used for dates like acquired_date on collection entries.
 * Format: YYYY-MM-DD
 *
 * @example
 * DateSchema.parse('2026-02-04'); // ✅
 * DateSchema.parse('2026-02-04T12:00:00Z'); // ❌ ZodError
 */
export const DateSchema = z.iso.date();
export type DateString = z.infer<typeof DateSchema>;

// =============================================================================
// PAGINATION
// =============================================================================

/**
 * Pagination input schema for list endpoints.
 *
 * Used in query parameters for paginated API requests.
 *
 * @example
 * // Request: GET /api/decks?page=2&limit=20
 * const input = PaginationInputSchema.parse({ page: 2, limit: 20 });
 */
export const PaginationInputSchema = z.object({
  /** Page number (1-indexed). Defaults to 1. */
  page: z.coerce.number().int().positive().default(1),

  /** Items per page. Defaults to 20, max 100. */
  limit: z.coerce.number().int().positive().max(100).default(20),
});
export type PaginationInput = z.infer<typeof PaginationInputSchema>;

/**
 * Pagination metadata in API responses.
 *
 * Included in paginated list responses.
 */
export const PaginationMetaSchema = z.object({
  /** Current page number (1-indexed) */
  page: z.number().int().positive(),

  /** Items per page */
  limit: z.number().int().positive(),

  /** Total number of items across all pages */
  total: z.number().int().nonnegative(),

  /** Total number of pages */
  totalPages: z.number().int().nonnegative(),
});
export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;

/**
 * Creates a paginated response schema for a given item schema.
 *
 * @param itemSchema - The Zod schema for individual items
 * @returns A schema for `{ items: T[], meta: PaginationMeta }`
 *
 * @example
 * const PaginatedDecksSchema = createPaginatedSchema(DeckResponseSchema);
 * // { items: Deck[], meta: { page, limit, total, totalPages } }
 */
export function createPaginatedSchema<T extends z.ZodType>(itemSchema: T) {
  return z.object({
    items: z.array(itemSchema),
    meta: PaginationMetaSchema,
  });
}

// =============================================================================
// SORTING
// =============================================================================

/**
 * Sort direction schema.
 */
export const SortDirectionSchema = z.enum(['asc', 'desc']);
export type SortDirection = z.infer<typeof SortDirectionSchema>;

/**
 * Creates a sort input schema for a given set of sortable fields.
 *
 * @param fields - Array of field names that can be sorted
 * @returns A schema for `{ sortBy: Field, sortDirection: 'asc' | 'desc' }`
 *
 * @example
 * const DeckSortSchema = createSortSchema(['name', 'createdAt', 'updatedAt']);
 * DeckSortSchema.parse({ sortBy: 'name', sortDirection: 'asc' }); // ✅
 */
export function createSortSchema<T extends string>(fields: readonly [T, ...T[]]) {
  return z.object({
    sortBy: z.enum(fields).optional(),
    sortDirection: SortDirectionSchema.optional().default('asc'),
  });
}

// =============================================================================
// COMMON FIELD SCHEMAS
// =============================================================================

/**
 * Hex color code schema (e.g., "#3B82F6").
 *
 * Used for tag colors, theme customization.
 */
export const HexColorSchema = z.string().regex(/^#[0-9A-Fa-f]{6}$/, {
  message: 'Must be a valid hex color code (e.g., #3B82F6)',
});
export type HexColor = z.infer<typeof HexColorSchema>;

/**
 * URL-safe slug schema.
 *
 * Used for public URLs (deck sharing, article slugs).
 * Allows lowercase letters, numbers, and hyphens.
 */
export const SlugSchema = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Must be a URL-safe slug (lowercase letters, numbers, hyphens)',
  });
export type Slug = z.infer<typeof SlugSchema>;

/**
 * Non-empty string schema with trimming.
 *
 * Useful for required text fields that shouldn't be whitespace-only.
 */
export const NonEmptyStringSchema = z.string().trim().min(1);
export type NonEmptyString = z.infer<typeof NonEmptyStringSchema>;

/**
 * Positive integer schema.
 *
 * Used for quantities, counts, positions.
 */
export const PositiveIntSchema = z.number().int().positive();
export type PositiveInt = z.infer<typeof PositiveIntSchema>;

/**
 * Non-negative integer schema.
 *
 * Used for zero-indexed positions, counts that can be zero.
 */
export const NonNegativeIntSchema = z.number().int().nonnegative();
export type NonNegativeInt = z.infer<typeof NonNegativeIntSchema>;
