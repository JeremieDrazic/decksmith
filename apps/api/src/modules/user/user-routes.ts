import { type Prisma, prisma } from '@decksmith/db';
import {
  PREFERENCES_NOT_FOUND,
  USERNAME_TAKEN,
  USER_NOT_FOUND,
} from '@decksmith/schema/errors/codes';
import { UuidSchema } from '@decksmith/schema/primitives/common';
import {
  UpdatePreferencesInputSchema,
  UserPreferencesResponseSchema,
} from '@decksmith/schema/user/preferences';
import { UpdateUserInputSchema, UserResponseSchema } from '@decksmith/schema/user/user';
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { toUserPreferencesResponse, toUserResponse } from './user-mapper.js';

import { createHttpError } from '@/utils/http-errors.js';
import { mergeJsonField } from '@/utils/json-merge.js';
import { isUniqueConstraintError } from '@/utils/prisma-errors.js';

// ---------------------------------------------------------------------------
// Shared schemas
// ---------------------------------------------------------------------------

const UserIdParamsSchema = z.object({ id: UuidSchema });

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

/**
 * User domain routes.
 *
 * Provides CRUD operations for user profiles and preferences.
 * All routes are prefixed by the parent plugin (`/api/v1/users`).
 */
// eslint-disable-next-line @typescript-eslint/require-await
const userRoutes: FastifyPluginAsyncZod = async (app) => {
  // -------------------------------------------------------------------------
  // GET /users/:id — Retrieve a user profile
  // -------------------------------------------------------------------------
  app.get(
    '/:id',
    {
      schema: {
        params: UserIdParamsSchema,
        response: { 200: UserResponseSchema },
      },
    },
    async (request, reply) => {
      const user = await prisma.user.findUnique({
        where: { id: request.params.id },
      });

      if (!user) {
        throw createHttpError(USER_NOT_FOUND, 'User not found', 404);
      }

      return reply.send(toUserResponse(user));
    }
  );

  // -------------------------------------------------------------------------
  // PATCH /users/:id — Update a user profile
  // -------------------------------------------------------------------------
  app.patch(
    '/:id',
    {
      schema: {
        params: UserIdParamsSchema,
        body: UpdateUserInputSchema,
        response: { 200: UserResponseSchema },
      },
    },
    async (request, reply) => {
      const existing = await prisma.user.findUnique({
        where: { id: request.params.id },
      });

      if (!existing) {
        throw createHttpError(USER_NOT_FOUND, 'User not found', 404);
      }

      try {
        const updated = await prisma.user.update({
          where: { id: request.params.id },
          data: request.body,
        });

        return await reply.send(toUserResponse(updated));
      } catch (error) {
        if (isUniqueConstraintError(error)) {
          throw createHttpError(USERNAME_TAKEN, 'Username is already taken', 409);
        }
        throw error;
      }
    }
  );

  // -------------------------------------------------------------------------
  // GET /users/:id/preferences — Retrieve user preferences
  // -------------------------------------------------------------------------
  app.get(
    '/:id/preferences',
    {
      schema: {
        params: UserIdParamsSchema,
        response: { 200: UserPreferencesResponseSchema },
      },
    },
    async (request, reply) => {
      const preferences = await prisma.userPreferences.findUnique({
        where: { userId: request.params.id },
      });

      if (!preferences) {
        throw createHttpError(PREFERENCES_NOT_FOUND, 'User preferences not found', 404);
      }

      return reply.send(toUserPreferencesResponse(preferences));
    }
  );

  // -------------------------------------------------------------------------
  // PATCH /users/:id/preferences — Update user preferences
  // -------------------------------------------------------------------------
  app.patch(
    '/:id/preferences',
    {
      schema: {
        params: UserIdParamsSchema,
        body: UpdatePreferencesInputSchema,
        response: { 200: UserPreferencesResponseSchema },
      },
    },
    async (request, reply) => {
      const existing = await prisma.userPreferences.findUnique({
        where: { userId: request.params.id },
      });

      if (!existing) {
        throw createHttpError(PREFERENCES_NOT_FOUND, 'User preferences not found', 404);
      }

      const { collectionViewConfig, notificationPreferences, ...scalarFields } = request.body;

      const data = {
        ...scalarFields,
        collectionViewConfig: mergeJsonField(
          existing.collectionViewConfig,
          collectionViewConfig
        ) as Prisma.InputJsonValue,
        notificationPreferences: mergeJsonField(
          existing.notificationPreferences,
          notificationPreferences
        ) as Prisma.InputJsonValue,
      };

      const updated = await prisma.userPreferences.update({
        where: { userId: request.params.id },
        data,
      });

      return reply.send(toUserPreferencesResponse(updated));
    }
  );
};

export default userRoutes;
