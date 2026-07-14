import { type Prisma, type PrismaUser, type PrismaUserPreferences, prisma } from '@decksmith/db';
import type { UpdatePreferencesInput } from '@decksmith/schema/user/preferences';
import type { UpdateUserInput } from '@decksmith/schema/user/user';
import {
  PREFERENCES_NOT_FOUND,
  USERNAME_TAKEN,
  USER_NOT_FOUND,
} from '@decksmith/schema/errors/codes';
import { mergeJsonField } from '@decksmith/utils';

import { ServiceError } from '../errors.js';
import { isUniqueConstraintError } from '../prisma-errors.js';

/**
 * Retrieves a user profile by ID.
 *
 * @param id - The user's UUID
 * @returns The Prisma user record
 */
export async function getUserById(id: string): Promise<PrismaUser> {
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    throw new ServiceError(USER_NOT_FOUND, 'User not found');
  }

  return user;
}

/**
 * Updates a user profile.
 *
 * @param id - The user's UUID
 * @param data - Fields to update (partial)
 * @returns The updated Prisma user record
 */
export async function updateUser(id: string, data: UpdateUserInput): Promise<PrismaUser> {
  const existing = await prisma.user.findUnique({ where: { id } });

  if (!existing) {
    throw new ServiceError(USER_NOT_FOUND, 'User not found');
  }

  try {
    return await prisma.user.update({ where: { id }, data });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new ServiceError(USERNAME_TAKEN, 'Username is already taken');
    }
    throw error;
  }
}

/**
 * Retrieves user preferences by user ID.
 *
 * @param userId - The user's UUID
 * @returns The Prisma user preferences record
 */
export async function getUserPreferences(userId: string): Promise<PrismaUserPreferences> {
  const preferences = await prisma.userPreferences.findUnique({ where: { userId } });

  if (!preferences) {
    throw new ServiceError(PREFERENCES_NOT_FOUND, 'User preferences not found');
  }

  return preferences;
}

/**
 * Updates user preferences with a shallow merge on JSON fields.
 *
 * @param userId - The user's UUID
 * @param data - Fields to update (partial); JSON fields are shallow-merged
 * @returns The updated Prisma user preferences record
 */
export async function updateUserPreferences(
  userId: string,
  data: UpdatePreferencesInput
): Promise<PrismaUserPreferences> {
  const existing = await prisma.userPreferences.findUnique({ where: { userId } });

  if (!existing) {
    throw new ServiceError(PREFERENCES_NOT_FOUND, 'User preferences not found');
  }

  const { collectionViewConfig, notificationPreferences, ...scalarFields } = data;

  return prisma.userPreferences.update({
    where: { userId },
    data: {
      ...scalarFields,
      collectionViewConfig: mergeJsonField(
        existing.collectionViewConfig,
        collectionViewConfig
      ) as Prisma.InputJsonValue,
      notificationPreferences: mergeJsonField(
        existing.notificationPreferences,
        notificationPreferences
      ) as Prisma.InputJsonValue,
    },
  });
}
