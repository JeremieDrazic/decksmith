import {
  UpdatePreferencesInputSchema,
  UserPreferencesResponseSchema,
} from '@decksmith/schema/user/preferences';
import { UpdateUserInputSchema, UserResponseSchema } from '@decksmith/schema/user/user';
import { UuidSchema } from '@decksmith/schema/primitives/common';
import {
  getUserById,
  getUserPreferences,
  updateUser,
  updateUserPreferences,
} from '@decksmith/services';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { toUserPreferencesResponse, toUserResponse } from './user-mapper.js';

const UserIdParamsSchema = z.object({ id: UuidSchema });

/**
 * User domain routes.
 *
 * Provides CRUD operations for user profiles and preferences.
 * All routes are prefixed by the parent plugin (`/api/v1/users`).
 */
// eslint-disable-next-line @typescript-eslint/require-await
const userRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/:id',
    {
      preHandler: [app.authenticate, app.assertOwnership('id')],
      schema: {
        params: UserIdParamsSchema,
        response: { 200: UserResponseSchema },
      },
    },
    async (request, reply) => {
      const user = await getUserById(request.params.id);
      return reply.send(toUserResponse(user));
    }
  );

  app.patch(
    '/:id',
    {
      preHandler: [app.authenticate, app.assertOwnership('id')],
      schema: {
        params: UserIdParamsSchema,
        body: UpdateUserInputSchema,
        response: { 200: UserResponseSchema },
      },
    },
    async (request, reply) => {
      const user = await updateUser(request.params.id, request.body);
      return reply.send(toUserResponse(user));
    }
  );

  app.get(
    '/:id/preferences',
    {
      preHandler: [app.authenticate, app.assertOwnership('id')],
      schema: {
        params: UserIdParamsSchema,
        response: { 200: UserPreferencesResponseSchema },
      },
    },
    async (request, reply) => {
      const preferences = await getUserPreferences(request.params.id);
      return reply.send(toUserPreferencesResponse(preferences));
    }
  );

  app.patch(
    '/:id/preferences',
    {
      preHandler: [app.authenticate, app.assertOwnership('id')],
      schema: {
        params: UserIdParamsSchema,
        body: UpdatePreferencesInputSchema,
        response: { 200: UserPreferencesResponseSchema },
      },
    },
    async (request, reply) => {
      const preferences = await updateUserPreferences(request.params.id, request.body);
      return reply.send(toUserPreferencesResponse(preferences));
    }
  );
};

export default userRoutes;
