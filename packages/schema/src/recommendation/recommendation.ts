/**
 * DeckRecommendation schema.
 *
 * AI-powered card recommendations for deck improvement.
 * Uses hybrid approach: rules-based algorithm + LLM refinement.
 *
 * @example
 * import { DeckRecommendationResponseSchema, type DeckRecommendation } from '@decksmith/schema/recommendation/recommendation';
 */

import { z } from 'zod';

import { CardSummarySchema } from '../card/card.js';
import { CardOwnershipSchema } from '../collection/collection-entry.js';
import { DateTimeSchema, UuidSchema } from '../primitives/common.js';
import { FeedbackTypeSchema } from '../primitives/enums.js';

// =============================================================================
// GAP CATEGORIES
// =============================================================================

/**
 * Deck gap category enum.
 *
 * Common areas where decks can be lacking.
 */
export const GapCategorySchema = z.enum([
  'ramp', // Mana acceleration
  'card_draw', // Card advantage
  'removal', // Targeted removal
  'board_wipes', // Mass removal
  'interaction', // Counterspells, instant-speed interaction
  'protection', // Hexproof, indestructible, etc.
  'recursion', // Graveyard recursion
  'tutors', // Card searching
  'wincons', // Win conditions
  'creatures', // Creature count
  'lands', // Land count/fixing
  'curve', // Mana curve issues
]);
export type GapCategory = z.infer<typeof GapCategorySchema>;

// =============================================================================
// IDENTIFIED GAPS
// =============================================================================

/**
 * Deck gap schema.
 *
 * Represents a weakness or gap identified in the deck.
 */
export const DeckGapSchema = z.object({
  /** Gap category */
  category: GapCategorySchema,

  /** Severity level */
  severity: z.enum(['low', 'medium', 'high']),

  /** Human-readable description */
  description: z.string(),
});
export type DeckGap = z.infer<typeof DeckGapSchema>;

// =============================================================================
// CARD SUGGESTIONS
// =============================================================================

/**
 * Card suggestion priority.
 */
export const SuggestionPrioritySchema = z.enum(['low', 'medium', 'high', 'essential']);
export type SuggestionPriority = z.infer<typeof SuggestionPrioritySchema>;

/**
 * Rule-based card suggestion schema.
 */
export const RuleSuggestionSchema = z.object({
  /** Suggested card */
  card: CardSummarySchema,

  /** Why this card is suggested */
  reason: z.string(),

  /** Suggestion priority */
  priority: SuggestionPrioritySchema,

  /** Which gap this addresses */
  addressesGap: GapCategorySchema.nullable(),

  /** Ownership and availability info */
  ownership: CardOwnershipSchema,

  /** Estimated price (user's preferred currency) */
  price: z.string().nullable(),
});
export type RuleSuggestion = z.infer<typeof RuleSuggestionSchema>;

/**
 * LLM-refined card suggestion schema.
 *
 * Includes more nuanced reasoning from the LLM.
 */
export const LlmSuggestionSchema = RuleSuggestionSchema.extend({
  /** Detailed strategic reasoning from LLM */
  reasoning: z.string(),

  /** Suggested cards to remove to make room */
  suggestedCuts: z.array(CardSummarySchema).optional(),
});
export type LlmSuggestion = z.infer<typeof LlmSuggestionSchema>;

// =============================================================================
// DECK RECOMMENDATION RESPONSE
// =============================================================================

/**
 * Deck recommendation response schema - what the API returns.
 */
export const DeckRecommendationResponseSchema = z.object({
  /** Unique recommendation ID */
  id: UuidSchema,

  /** Deck this recommendation is for */
  deckId: UuidSchema,

  /** Algorithm version used */
  algorithmVersion: z.string(),

  /** Identified gaps/weaknesses in the deck */
  identifiedGaps: z.array(DeckGapSchema),

  /** Rule-based suggestions */
  ruleSuggestions: z.array(RuleSuggestionSchema),

  /** LLM model used (null if LLM not used) */
  llmModel: z.string().nullable(),

  /** Tokens used in prompt */
  llmPromptTokens: z.number().int().nonnegative().nullable(),

  /** Tokens used in completion */
  llmCompletionTokens: z.number().int().nonnegative().nullable(),

  /** Cost of LLM API call in USD */
  llmCostUsd: z.number().nonnegative().nullable(),

  /** LLM-refined suggestions (null if LLM not used) */
  llmSuggestions: z.array(LlmSuggestionSchema).nullable(),

  /** Strategic deck summary from LLM (null if LLM not used) */
  llmSummary: z.string().nullable(),

  /** User's overall feedback (null if not provided) */
  userFeedback: FeedbackTypeSchema.nullable(),

  /** When recommendation was generated */
  createdAt: DateTimeSchema,

  /** When recommendation expires (TTL) */
  expiresAt: DateTimeSchema,
});
export type DeckRecommendation = z.infer<typeof DeckRecommendationResponseSchema>;

/**
 * Deck recommendation summary - for list views.
 */
export const DeckRecommendationSummarySchema = DeckRecommendationResponseSchema.pick({
  id: true,
  deckId: true,
  algorithmVersion: true,
  userFeedback: true,
  createdAt: true,
  expiresAt: true,
}).extend({
  /** Number of suggestions */
  suggestionCount: z.number().int().nonnegative(),

  /** Number of gaps identified */
  gapCount: z.number().int().nonnegative(),
});
export type DeckRecommendationSummary = z.infer<typeof DeckRecommendationSummarySchema>;

// =============================================================================
// INPUT SCHEMAS
// =============================================================================

/**
 * Request deck recommendation input schema.
 */
export const RequestRecommendationInputSchema = z.object({
  /** Deck to analyze */
  deckId: UuidSchema,

  /** Use LLM for enhanced suggestions (default: true) */
  useLlm: z.boolean().optional().default(true),

  /** Consider user's collection for ownership-aware suggestions (default: true) */
  considerCollection: z.boolean().optional().default(true),

  /** Budget limit for suggestions (optional, in user's preferred currency) */
  maxPricePerCard: z.number().positive().optional(),
});
export type RequestRecommendationInput = z.infer<typeof RequestRecommendationInputSchema>;

/**
 * Submit feedback input schema.
 */
export const SubmitRecommendationFeedbackInputSchema = z.object({
  /** Overall feedback */
  feedback: FeedbackTypeSchema,
});
export type SubmitRecommendationFeedbackInput = z.infer<
  typeof SubmitRecommendationFeedbackInputSchema
>;
