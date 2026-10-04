import type { CardAutocompleteResponse } from '@decksmith/schema/card/autocomplete';
import type { CardPrint, CardPrintSort, CardWithPrints } from '@decksmith/schema/card/card-print';
import type { CardSearchQuery, CardSearchResponse } from '@decksmith/schema/card/search';
import { toQueryString } from '@decksmith/utils';

import type { Fetcher } from '../../fetcher/fetcher.js';

/**
 * Creates the cards module — all functions for the `/api/v1/cards` routes.
 *
 * These endpoints are public (MTG reference data), so no auth is required, but
 * the fetcher still sends cookies harmlessly.
 *
 * @param fetcher - Pre-configured fetch wrapper from `createFetcher`.
 */
export function createCardsModule(fetcher: Fetcher) {
  return {
    /**
     * Full-text card search with filters and pagination.
     *
     * @param query - Search query, filters, sort and pagination.
     * @returns A paginated page of card search results.
     */
    search: (query: CardSearchQuery): Promise<CardSearchResponse> =>
      fetcher({ method: 'GET', path: `/api/v1/cards/search${toQueryString(query)}` }),

    /**
     * Type-ahead card-name autocomplete (flat list, no pagination).
     *
     * @param query - Prefix/substring to complete (min 3 chars, enforced by the API).
     * @returns Up to a handful of lightweight card results.
     */
    autocomplete: (query: string): Promise<CardAutocompleteResponse> =>
      fetcher({ method: 'GET', path: `/api/v1/cards/autocomplete${toQueryString({ query })}` }),

    /**
     * Get a single card by its oracle ID, with every print and face.
     *
     * @param oracleId - The card's Scryfall oracle ID.
     */
    getCard: (oracleId: string): Promise<CardWithPrints> =>
      fetcher({ method: 'GET', path: `/api/v1/cards/${oracleId}` }),

    /**
     * Get all prints of a card (for the print-selection modal).
     *
     * @param oracleId - The card's Scryfall oracle ID.
     * @param sort - Print order (`date` | `name`). Defaults to the API's default when omitted.
     */
    getCardPrints: (oracleId: string, sort?: CardPrintSort): Promise<CardPrint[]> =>
      fetcher({
        method: 'GET',
        path: `/api/v1/cards/${oracleId}/prints${toQueryString({ sort })}`,
      }),
  };
}
