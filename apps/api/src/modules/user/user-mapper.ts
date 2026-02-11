import type { PrismaUser, PrismaUserPreferences } from '@decksmith/db';
import type {
  CollectionViewConfig,
  NotificationPreferences,
  UserPreferences,
} from '@decksmith/schema/user/preferences';
import type { User } from '@decksmith/schema/user/user';

/**
 * Convert a Prisma User record to the API response DTO.
 *
 * @param prismaUser - Raw Prisma User record from the database
 * @returns User DTO with ISO 8601 timestamps
 */
export function toUserResponse(prismaUser: PrismaUser): User {
  return {
    id: prismaUser.id,
    email: prismaUser.email,
    username: prismaUser.username,
    displayName: prismaUser.displayName,
    avatarUrl: prismaUser.avatarUrl,
    createdAt: prismaUser.createdAt.toISOString(),
    updatedAt: prismaUser.updatedAt.toISOString(),
  };
}

/**
 * Convert a Prisma UserPreferences record to the API response DTO.
 *
 * Prisma stores JSON fields as untyped `JsonValue`. We cast them to the
 * specific DTO types since the data was validated by Zod on the way in.
 *
 * @param prismaPrefs - Raw Prisma UserPreferences record from the database
 * @returns UserPreferences DTO with typed JSON fields and ISO timestamps
 */
export function toUserPreferencesResponse(prismaPrefs: PrismaUserPreferences): UserPreferences {
  return {
    id: prismaPrefs.id,
    userId: prismaPrefs.userId,
    language: prismaPrefs.language as UserPreferences['language'],
    units: prismaPrefs.units as UserPreferences['units'],
    defaultCurrency: prismaPrefs.defaultCurrency as UserPreferences['defaultCurrency'],
    defaultPrintSelection:
      prismaPrefs.defaultPrintSelection as UserPreferences['defaultPrintSelection'],
    theme: prismaPrefs.theme as UserPreferences['theme'],
    collectionViewConfig: prismaPrefs.collectionViewConfig as CollectionViewConfig,
    notificationPreferences: prismaPrefs.notificationPreferences as NotificationPreferences,
    createdAt: prismaPrefs.createdAt.toISOString(),
    updatedAt: prismaPrefs.updatedAt.toISOString(),
  };
}
