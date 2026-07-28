import swagger from '@fastify/swagger';
import scalarApiReference from '@scalar/fastify-api-reference';
import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { jsonSchemaTransform } from 'fastify-type-provider-zod';

/**
 * API documentation plugin.
 *
 * Generates an OpenAPI spec from the Zod route schemas we already declare
 * (via `fastify-type-provider-zod`'s `jsonSchemaTransform`) and serves a Scalar
 * reference UI at `/api/reference` (path-prefixed so Traefik routes it to the API).
 *
 * Registered via fastify-plugin (no encapsulation) so @fastify/swagger sees every
 * route in the parent context. Must be registered BEFORE the route plugins.
 */
export default fp(
  async (app: FastifyInstance) => {
    await app.register(swagger, {
      openapi: {
        info: {
          title: 'Decksmith API',
          description: 'HTTP API for Decksmith — MTG deck & collection management.',
          // TODO(#73): wire to the semantic-release version once the release system lands.
          version: '0.0.0',
        },
      },
      transform: jsonSchemaTransform,
    });

    await app.register(scalarApiReference, {
      routePrefix: '/api/reference',
    });
  },
  { name: 'docs' }
);
