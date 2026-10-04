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

/**
 * Builds the paginated envelope around an already-mapped page of items — the
 * runtime counterpart to {@link makePaginatedSchema}. Any list endpoint maps its
 * rows to DTOs, then wraps them here.
 *
 * `meta` is a named object rather than positional args because `total`, `page`
 * and `limit` are all numbers: a bag of positionals would silently accept them
 * in the wrong order.
 *
 * @param data - The DTO items on this page (already mapped from the raw rows)
 * @param meta - Pagination counters: `total` (full match count), `page`, `limit`
 * @returns The `{ data, total, page, limit }` envelope
 */
export const toPaginated = <T>(
  data: T[],
  meta: { total: number; page: number; limit: number }
): Paginated<T> => ({
  data,
  total: meta.total,
  page: meta.page,
  limit: meta.limit,
});
