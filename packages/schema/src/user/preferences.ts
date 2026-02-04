/**
 * UserPreferences schema - user settings and customization.
 *
 * Each user has one preferences record (1:1 relationship).
 * Created automatically on user signup with default values.
 *
 * @example
 * import { UserPreferencesSchema, type UserPreferences } from '@decksmith/schema/user/preferences';
 */

import { z } from 'zod';

import {
  CurrencySchema,
  LanguageSchema,
  PrintSelectionSchema,
  ThemeSchema,
  UnitsSchema,
} from '../primitives/enums.js';
import { DateTimeSchema, UuidSchema } from '../primitives/common.js';

// =============================================================================
// COLLECTION VIEW CONFIG
// =============================================================================

/**
 * Collection view mode.
 *
 * - grid: Card images in a grid layout
 * - table: Spreadsheet-like with sortable columns
 * - list: Compact list with card name and key details
 * - binder: Simulates physical binder (3x3 grid per page)
 */
export const CollectionViewModeSchema = z.enum(['grid', 'table', 'list', 'binder']);
export type CollectionViewMode = z.infer<typeof CollectionViewModeSchema>;

/**
 * Collection view configuration schema.
 *
 * Stores user's preferences for how the collection is displayed.
 */
export const CollectionViewConfigSchema = z.object({
  /** View mode */
  viewMode: CollectionViewModeSchema.default('grid'),

  /** Visible columns in table view */
  visibleColumns: z.array(z.string()).default([]),

  /** Current sort field */
  sortBy: z.string().optional(),

  /** Sort direction */
  sortDirection: z.enum(['asc', 'desc']).default('asc'),

  /** Cards per page in binder view (9 = 3x3, 12 = 4x3) */
  binderCardsPerPage: z.number().int().positive().default(9),
});
export type CollectionViewConfig = z.infer<typeof CollectionViewConfigSchema>;

// =============================================================================
// NOTIFICATION PREFERENCES
// =============================================================================

/**
 * Notification preferences schema.
 */
export const NotificationPreferencesSchema = z.object({
  /** Email when PDF generation is complete */
  emailOnPdfReady: z.boolean().default(true),
});
export type NotificationPreferences = z.infer<typeof NotificationPreferencesSchema>;

// =============================================================================
// USER PREFERENCES SCHEMAS
// =============================================================================

/**
 * UserPreferences response schema - what the API returns.
 */
export const UserPreferencesResponseSchema = z.object({
  /** Unique preferences ID */
  id: UuidSchema,

  /** User ID (FK to User) */
  userId: UuidSchema,

  /** UI language */
  language: LanguageSchema,

  /** Measurement units */
  units: UnitsSchema,

  /** Default currency for prices */
  defaultCurrency: CurrencySchema,

  /** Default print selection strategy */
  defaultPrintSelection: PrintSelectionSchema,

  /** UI theme */
  theme: ThemeSchema,

  /** Collection view configuration */
  collectionViewConfig: CollectionViewConfigSchema,

  /** Notification preferences */
  notificationPreferences: NotificationPreferencesSchema,

  /** When preferences were created */
  createdAt: DateTimeSchema,

  /** When preferences were last updated */
  updatedAt: DateTimeSchema,
});
export type UserPreferences = z.infer<typeof UserPreferencesResponseSchema>;

/**
 * Update preferences input schema.
 *
 * All fields are optional - only include what you want to change.
 */
export const UpdatePreferencesInputSchema = z.object({
  language: LanguageSchema.optional(),
  units: UnitsSchema.optional(),
  defaultCurrency: CurrencySchema.optional(),
  defaultPrintSelection: PrintSelectionSchema.optional(),
  theme: ThemeSchema.optional(),
  collectionViewConfig: CollectionViewConfigSchema.partial().optional(),
  notificationPreferences: NotificationPreferencesSchema.partial().optional(),
});
export type UpdatePreferencesInput = z.infer<typeof UpdatePreferencesInputSchema>;

/**
 * Default preferences values.
 *
 * Applied when creating a new user's preferences.
 */
export const DEFAULT_PREFERENCES = {
  language: 'en',
  units: 'mm',
  defaultCurrency: 'eur',
  defaultPrintSelection: 'latest',
  theme: 'system',
  collectionViewConfig: {
    viewMode: 'grid',
    visibleColumns: [],
    sortDirection: 'asc',
    binderCardsPerPage: 9,
  },
  notificationPreferences: {
    emailOnPdfReady: true,
  },
} as const satisfies Omit<
  UserPreferences,
  'id' | 'userId' | 'createdAt' | 'updatedAt'
>;
