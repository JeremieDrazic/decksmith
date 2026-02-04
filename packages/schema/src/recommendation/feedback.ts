/**
 * RecommendationFeedback schema.
 *
 * User feedback on recommendations for algorithm improvement.
 *
 * @example
 * import { RecommendationFeedbackResponseSchema, type RecommendationFeedback } from '@decksmith/schema/recommendation/feedback';
 */

import { z } from 'zod';

import { DateTimeSchema, UuidSchema } from '../primitives/common.js';
import { FeedbackTypeSchema } from '../primitives/enums.js';

// =============================================================================
// RECOMMENDATION FEEDBACK RESPONSE
// =============================================================================

/**
 * Recommendation feedback response schema - what the API returns.
 */
export const RecommendationFeedbackResponseSchema = z.object({
  /** Unique feedback ID */
  id: UuidSchema,

  /** Recommendation this feedback is for */
  recommendationId: UuidSchema,

  /** User who submitted feedback */
  userId: UuidSchema,

  /** Feedback type */
  feedback: FeedbackTypeSchema,

  /** Optional comment with more details */
  comment: z.string().max(1000).nullable(),

  /** When feedback was submitted */
  createdAt: DateTimeSchema,
});
export type RecommendationFeedback = z.infer<typeof RecommendationFeedbackResponseSchema>;

// =============================================================================
// INPUT SCHEMAS
// =============================================================================

/**
 * Submit recommendation feedback input schema.
 */
export const SubmitFeedbackInputSchema = z.object({
  /** Feedback type */
  feedback: FeedbackTypeSchema,

  /** Optional comment */
  comment: z.string().max(1000).optional(),
});
export type SubmitFeedbackInput = z.infer<typeof SubmitFeedbackInputSchema>;
