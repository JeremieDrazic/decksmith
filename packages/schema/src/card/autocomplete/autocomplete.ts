/**
 * Card autocomplete contract — `GET /api/v1/cards/autocomplete`.
 *
 * A deliberately tiny, fast search for a type-ahead dropdown: the user types,
 * sees a handful of suggestions, and refines their input. There is **no
 * pagination** — a dropdown never has a "next page". The result cap (top-N) is a
 * constant in the card-search service, not a client-supplied param, so the input
 * carries a single field.
 *
 * @example
 * import { CardAutocompleteQuerySchema } from '@decksmith/schema/card/autocomplete';
 */

import { z } from 'zod';

import { CardSearchResultSchema } from '../card.js';

/**
 * Autocomplete query params.
 *
 * `query` is required and at least 3 characters — shorter prefixes match too many
 * cards to be useful and waste a round-trip.
 */
export const CardAutocompleteQuerySchema = z.object({
  /** Prefix to complete (min 3 chars). */
  query: z.string().trim().min(3),
});
export type CardAutocompleteQuery = z.infer<typeof CardAutocompleteQuerySchema>;

/**
 * Autocomplete response — a short, flat list of lightweight results (name, mana
 * cost, type line, image). Reuses the search-result item; no pagination envelope.
 */
export const CardAutocompleteResponseSchema = z.array(CardSearchResultSchema);
export type CardAutocompleteResponse = z.infer<typeof CardAutocompleteResponseSchema>;
