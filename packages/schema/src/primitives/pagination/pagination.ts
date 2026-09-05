/**
 * Pagination primitives — a reusable envelope for any list endpoint.
 *
 * Every list endpoint (card search, and later decks/collection) returns the same
 * shape: a page of items plus the counters a client needs to render pagination.
 * `makePaginatedSchema` builds that envelope around any item schema.
 *
 * @example
 * import { makePaginatedSchema } from '@decksmith/schema/primitives/pagination';
 *
 * const CardSearchResponseSchema = makePaginatedSchema(CardSearchResultSchema);
 */

import { z } from 'zod';

/**
 * Wraps an item schema into a paginated envelope: `{ data, total, page, limit }`.
 *
 * `total` is the full match count *before* pagination — what a client needs to
 * show "128 results" and compute the page count. `page`/`limit` echo the request.
 *
 * Generic over `item` so `data` keeps its element type rather than `unknown[]`.
 */
export const makePaginatedSchema = <T extends z.ZodType>(item: T) =>
  z.object({
    /** The items on this page. */
    data: z.array(item),

    /** Total matches across all pages (before pagination). */
    total: z.number().int().nonnegative(),

    /** 1-based page number echoed from the request. */
    page: z.number().int().positive(),

    /** Page size echoed from the request. */
    limit: z.number().int().positive(),
  });

/**
 * Type companion to {@link makePaginatedSchema}, for typing generic paginated
 * consumers (e.g. a shared list component) without inferring from a concrete schema.
 */
export type Paginated<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
};
