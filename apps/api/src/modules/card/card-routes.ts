import {
  CardAutocompleteQuerySchema,
  CardAutocompleteResponseSchema,
} from '@decksmith/schema/card/autocomplete';
import {
  CardPrintResponseSchema,
  CardPrintsQuerySchema,
  CardWithPrintsSchema,
} from '@decksmith/schema/card/card-print';
import { CardSearchQuerySchema, CardSearchResponseSchema } from '@decksmith/schema/card/search';
import { UuidSchema } from '@decksmith/schema/primitives/common';
import { toPaginated } from '@decksmith/schema/primitives/pagination';
import {
  autocompleteCards,
  getCardPrints,
  getCardWithPrints,
  searchCards,
} from '@decksmith/services';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';

import {
  toAutocompleteResult,
  toCardPrint,
  toCardSearchResult,
  toCardWithPrints,
} from './card-mapper.js';

const OracleIdParamsSchema = z.object({ oracleId: UuidSchema });

/**
 * Card domain routes — read-only, public (MTG reference data, not user-owned).
 *
 * All routes are prefixed by the parent plugin (`/api/v1/cards`). Handlers are
 * pure HTTP glue: validate (Zod schemas), call a service, map the plain domain
 * value to a DTO. `CARD_NOT_FOUND` thrown by the services becomes a 404 via the
 * central error handler.
 */
// eslint-disable-next-line @typescript-eslint/require-await
const cardRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/search',
    {
      schema: {
        querystring: CardSearchQuerySchema,
        response: { 200: CardSearchResponseSchema },
      },
    },
    async (request, reply) => {
      const { rows, total } = await searchCards(request.query);
      const { page, limit } = request.query;
      const results = rows.map((row) => toCardSearchResult(row));

      return reply.send(toPaginated(results, { total, page, limit }));
    }
  );

  app.get(
    '/autocomplete',
    {
      schema: {
        querystring: CardAutocompleteQuerySchema,
        response: { 200: CardAutocompleteResponseSchema },
      },
    },
    async (request, reply) => {
      const rows = await autocompleteCards(request.query.query);
      return reply.send(rows.map((row) => toAutocompleteResult(row)));
    }
  );

  app.get(
    '/:oracleId',
    {
      schema: {
        params: OracleIdParamsSchema,
        response: { 200: CardWithPrintsSchema },
      },
    },
    async (request, reply) => {
      const card = await getCardWithPrints(request.params.oracleId);
      return reply.send(toCardWithPrints(card));
    }
  );

  app.get(
    '/:oracleId/prints',
    {
      schema: {
        params: OracleIdParamsSchema,
        querystring: CardPrintsQuerySchema,
        response: { 200: z.array(CardPrintResponseSchema) },
      },
    },
    async (request, reply) => {
      const prints = await getCardPrints(request.params.oracleId, request.query.sort);
      return reply.send(prints.map((print) => toCardPrint(print)));
    }
  );
};

export default cardRoutes;
