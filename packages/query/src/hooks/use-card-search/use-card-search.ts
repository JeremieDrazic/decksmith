import { keepPreviousData, useQuery, type UseQueryResult } from '@tanstack/react-query';

import type { ErrorCode } from '@decksmith/api-client/errors';
import type { CardSearchQuery, CardSearchResponse } from '@decksmith/schema/card/search';

import { useApiClient } from '../../context/context.js';
import { getErrorCode } from '../../lib/get-error-code/get-error-code.js';

/**
 * Query key factory for card-search queries.
 *
 * The full params object is part of the key, so every distinct combination of
 * query/filters/sort/page is cached independently:
 * `queryClient.invalidateQueries({ queryKey: cardKeys.search(params) })`
 */
export const cardKeys = {
  search: (params: CardSearchQuery) => ['cards', 'search', params] as const,
};

type UseCardSearchResult = UseQueryResult<CardSearchResponse, Error> & {
  /** Typed error code from the API, or undefined if the error is not an ApiError. */
  errorCode: ErrorCode | undefined;
};

/**
 * Searches cards and keeps the paginated result in the TanStack Query cache.
 *
 * Runs on every params change (including with no `query` — that browses all
 * cards). While a new page loads, the previous page stays visible
 * (`keepPreviousData`) so paging through results doesn't flash empty.
 *
 * @param params - Search query, filters, sort and pagination.
 */
export function useCardSearch(params: CardSearchQuery): UseCardSearchResult {
  const client = useApiClient();

  const query = useQuery<CardSearchResponse, Error>({
    queryKey: cardKeys.search(params),
    queryFn: () => client.cards.search(params),
    placeholderData: keepPreviousData,
  });

  return {
    ...query,
    errorCode: getErrorCode(query.error),
  };
}
