/**
 * Card search query schema — the contract for `GET /api/v1/cards/search`.
 *
 * HTTP note: query params always arrive as strings, so numeric params are
 * coerced (`z.coerce`) before validation.
 *
 * @example
 * import { CardSearchQuerySchema } from '@decksmith/schema/card/search';
 */

import { z } from 'zod';

import { ColorSchema, FormatSchema, RaritySchema } from '../../primitives/enums.js';
import { makePaginatedSchema } from '../../primitives/pagination/pagination.js';

import { CardSearchResultSchema } from '../card.js';

/**
 * Builds a Zod schema that parses a comma-separated param **value** into a
 * validated array — Fastify has already split the URL, so the input is the value
 * alone (`"a,b"`), not `"x=a,b"`. Trims each entry and drops empties, so
 * `"a, b,"` yields `["a", "b"]`; every surviving value is checked against `item`.
 *
 * Generic over `item` so the parsed array keeps its element type (`Color[]`,
 * `Rarity[]`) rather than collapsing to `unknown[]`.
 */
const makeCsvSchema = <T extends z.ZodType>(item: T) =>
  z.preprocess(
    (raw) =>
      typeof raw === 'string'
        ? raw
            .split(',')
            .map((v) => v.trim())
            .filter(Boolean)
        : raw,
    z.array(item)
  );

/**
 * Sort options for card search.
 *
 * - relevance: full-text rank — only meaningful when `query` is present
 * - name: alphabetical
 * - cmc: mana value, cheapest first
 * - released: first release date
 *
 * The default is left to the service, not encoded here, because it depends on
 * `query`: `relevance` when a query is given (there is something to rank),
 * otherwise `name`. Passing `sort=relevance` without a query falls back to `name`.
 */
export const CardSortSchema = z.enum(['relevance', 'name', 'cmc', 'released']);
export type CardSort = z.infer<typeof CardSortSchema>;

/**
 * Validated query params for card search.
 *
 * `query` is optional — omitting it browses all cards (useful once filters land).
 * `page`/`limit` always resolve to a value via their defaults.
 */
export const CardSearchQuerySchema = z
  .object({
    /** Full-text query (name, type line, oracle text). Omitted = browse all. */
    query: z.string().trim().min(1).optional(),

    /** Colour filter, e.g. ?colors=R,U — matches cards including any of these. */
    colors: makeCsvSchema(ColorSchema).optional(),

    /** Rarity filter, e.g. ?rarities=rare,mythic. */
    rarities: makeCsvSchema(RaritySchema).optional(),

    /** Set-code filter, e.g. ?sets=lea,m11. Lowercased to match stored codes. */
    sets: makeCsvSchema(z.string().toLowerCase().min(1)).optional(),

    /** Minimum mana value (inclusive). An exact cmc is cmcMin === cmcMax. */
    cmcMin: z.coerce.number().nonnegative().optional(),

    /** Maximum mana value (inclusive). */
    cmcMax: z.coerce.number().nonnegative().optional(),

    /** Format legality — keeps only cards legal in this format, e.g. ?format=commander. */
    format: FormatSchema.optional(),

    /** Sort order. Optional — the service resolves the default (see CardSortSchema). */
    sort: CardSortSchema.optional(),

    /** 1-based page number. */
    page: z.coerce.number().int().min(1).default(1),

    /** Results per page (capped to protect the DB from oversized requests). */
    limit: z.coerce.number().int().min(1).max(100).default(20),
  })
  .refine((q) => q.cmcMin === undefined || q.cmcMax === undefined || q.cmcMin <= q.cmcMax, {
    message: 'CMC_RANGE_INVALID',
    path: ['cmcMax'],
  });
export type CardSearchQuery = z.infer<typeof CardSearchQuerySchema>;

/**
 * Card search response — a page of card search results (grid-ready items:
 * name, mana cost, type line, colours, and the most-recent print's image).
 */
export const CardSearchResponseSchema = makePaginatedSchema(CardSearchResultSchema);
export type CardSearchResponse = z.infer<typeof CardSearchResponseSchema>;
