/**
 * DeckSection schema.
 *
 * Represents a configurable zone within a deck (e.g., Mainboard, Sideboard, Command Zone).
 * Sections contain DeckCards and have optional validation rules.
 *
 * @example
 * import { DeckSectionResponseSchema, type DeckSection } from '@decksmith/schema/deck/section';
 */

import { z } from 'zod';

import { DateTimeSchema, PositiveIntSchema, UuidSchema } from '../primitives/common.js';
import { ColorSchema } from '../primitives/enums.js';

// =============================================================================
// VALIDATION RULES
// =============================================================================

/**
 * Section validation rules schema.
 *
 * Optional constraints that can be applied to a section.
 * Enforced at application level, not database level.
 */
export const ValidationRulesSchema = z.object({
  /** Maximum cards allowed in this section */
  maxCards: PositiveIntSchema.optional(),

  /** Singleton rule: only 1 copy of each card allowed */
  singleton: z.boolean().optional(),

  /** Color identity restriction (e.g., for Commander) */
  colorIdentity: z.array(ColorSchema).optional(),
});
export type ValidationRules = z.infer<typeof ValidationRulesSchema>;

// =============================================================================
// DECK SECTION RESPONSE
// =============================================================================

/**
 * Deck section response schema - what the API returns.
 */
export const DeckSectionResponseSchema = z.object({
  /** Unique section ID */
  id: UuidSchema,

  /** Parent deck ID */
  deckId: UuidSchema,

  /** Section name (user-defined) */
  name: z.string().min(1).max(50).trim(),

  /** Optional description explaining the section's purpose */
  description: z.string().max(200).nullable(),

  /** Display position (0-indexed) */
  position: z.number().int().nonnegative(),

  /** Optional validation rules */
  validationRules: ValidationRulesSchema.nullable(),

  /** When the section was created */
  createdAt: DateTimeSchema,

  /** When the section was last updated */
  updatedAt: DateTimeSchema,
});
export type DeckSection = z.infer<typeof DeckSectionResponseSchema>;

/**
 * Deck section summary - minimal data for dropdowns.
 */
export const DeckSectionSummarySchema = DeckSectionResponseSchema.pick({
  id: true,
  name: true,
  position: true,
});
export type DeckSectionSummary = z.infer<typeof DeckSectionSummarySchema>;

/**
 * Deck section with card count - for section list views.
 */
export const DeckSectionWithCountSchema = DeckSectionResponseSchema.extend({
  /** Number of unique cards in this section */
  uniqueCards: z.number().int().nonnegative(),

  /** Total cards (including quantities) */
  cardCount: z.number().int().nonnegative(),
});
export type DeckSectionWithCount = z.infer<typeof DeckSectionWithCountSchema>;

// =============================================================================
// INPUT SCHEMAS
// =============================================================================

/**
 * Create deck section input schema.
 */
export const CreateDeckSectionInputSchema = z.object({
  /** Section name (required) */
  name: z.string().min(1).max(50).trim(),

  /** Optional description */
  description: z.string().max(200).optional(),

  /** Position in deck (optional, defaults to end) */
  position: z.number().int().nonnegative().optional(),

  /** Validation rules (optional) */
  validationRules: ValidationRulesSchema.optional(),
});
export type CreateDeckSectionInput = z.infer<typeof CreateDeckSectionInputSchema>;

/**
 * Update deck section input schema.
 */
export const UpdateDeckSectionInputSchema = z.object({
  /** New section name */
  name: z.string().min(1).max(50).trim().optional(),

  /** New description (null to clear) */
  description: z.string().max(200).nullable().optional(),

  /** New position */
  position: z.number().int().nonnegative().optional(),

  /** New validation rules (null to clear) */
  validationRules: ValidationRulesSchema.nullable().optional(),
});
export type UpdateDeckSectionInput = z.infer<typeof UpdateDeckSectionInputSchema>;

/**
 * Reorder sections input schema.
 *
 * Sets the position of all sections in one operation.
 */
export const ReorderSectionsInputSchema = z.object({
  /** Section IDs in new order */
  sectionIds: z.array(UuidSchema).min(1),
});
export type ReorderSectionsInput = z.infer<typeof ReorderSectionsInputSchema>;

// =============================================================================
// FORMAT TEMPLATES
// =============================================================================

/**
 * Default section templates by format.
 *
 * Used when creating a new deck to pre-populate sections.
 */
export const SECTION_TEMPLATES = {
  commander: [
    { name: 'Command Zone', position: 0, validationRules: { maxCards: 2 } },
    { name: 'Mainboard', position: 1, validationRules: { singleton: true } },
    { name: 'Considering', position: 2, description: 'Cards to consider adding' },
    { name: 'Maybeboard', position: 3, description: 'Cards that might be added later' },
  ],
  duel: [
    { name: 'Command Zone', position: 0, validationRules: { maxCards: 1 } },
    { name: 'Mainboard', position: 1, validationRules: { singleton: true } },
    { name: 'Sideboard', position: 2, validationRules: { maxCards: 15 } },
    { name: 'Considering', position: 3, description: 'Cards to consider adding' },
  ],
  brawl: [
    { name: 'Command Zone', position: 0, validationRules: { maxCards: 1 } },
    { name: 'Mainboard', position: 1, validationRules: { singleton: true } },
    { name: 'Considering', position: 2, description: 'Cards to consider adding' },
  ],
  standard: [
    { name: 'Mainboard', position: 0, validationRules: { maxCards: 60 } },
    { name: 'Sideboard', position: 1, validationRules: { maxCards: 15 } },
    { name: 'Considering', position: 2, description: 'Cards to consider adding' },
  ],
  modern: [
    { name: 'Mainboard', position: 0, validationRules: { maxCards: 60 } },
    { name: 'Sideboard', position: 1, validationRules: { maxCards: 15 } },
    { name: 'Considering', position: 2, description: 'Cards to consider adding' },
  ],
  pioneer: [
    { name: 'Mainboard', position: 0, validationRules: { maxCards: 60 } },
    { name: 'Sideboard', position: 1, validationRules: { maxCards: 15 } },
    { name: 'Considering', position: 2, description: 'Cards to consider adding' },
  ],
  legacy: [
    { name: 'Mainboard', position: 0, validationRules: { maxCards: 60 } },
    { name: 'Sideboard', position: 1, validationRules: { maxCards: 15 } },
    { name: 'Considering', position: 2, description: 'Cards to consider adding' },
  ],
  vintage: [
    { name: 'Mainboard', position: 0, validationRules: { maxCards: 60 } },
    { name: 'Sideboard', position: 1, validationRules: { maxCards: 15 } },
    { name: 'Considering', position: 2, description: 'Cards to consider adding' },
  ],
  pauper: [
    { name: 'Mainboard', position: 0, validationRules: { maxCards: 60 } },
    { name: 'Sideboard', position: 1, validationRules: { maxCards: 15 } },
    { name: 'Considering', position: 2, description: 'Cards to consider adding' },
  ],
  limited: [
    { name: 'Mainboard', position: 0, validationRules: { maxCards: 40 } },
    { name: 'Sideboard', position: 1 },
    { name: 'Considering', position: 2, description: 'Cards to consider adding' },
  ],
  casual: [
    { name: 'Mainboard', position: 0 },
    { name: 'Considering', position: 1, description: 'Cards to consider adding' },
    { name: 'Maybeboard', position: 2, description: 'Cards that might be added later' },
  ],
} as const;
