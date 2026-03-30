/**
 * Supabase Auth error codes.
 *
 * These are internal SDK codes returned by @supabase/supabase-js — not to be
 * confused with our public API error codes in packages/schema/errors/codes.ts.
 *
 * Reference: https://supabase.com/docs/reference/javascript/auth-error-codes
 */

/** Thrown by signUp when the email is already registered. */
export const SUPABASE_USER_ALREADY_EXISTS = 'user_already_exists';
