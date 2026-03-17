import { createClient } from '@supabase/supabase-js';

const url = process.env['SUPABASE_URL'];
const serviceRoleKey = process.env['SUPABASE_SERVICE_ROLE_KEY'];

if (!url) {
  throw new Error('Missing required environment variable: SUPABASE_URL');
}

if (!serviceRoleKey) {
  throw new Error('Missing required environment variable: SUPABASE_SERVICE_ROLE_KEY');
}

/**
 * Server-side Supabase client using the service role key.
 *
 * This client bypasses Row-Level Security — use it only in server contexts
 * (apps/api, apps/worker). Never expose it to the browser.
 *
 * Capabilities:
 * - Verify JWTs: supabase.auth.getUser(token)
 * - Admin auth operations: supabase.auth.admin.*
 */
export const supabase = createClient(url, serviceRoleKey, {
  auth: {
    // Disable automatic session persistence — the server is stateless,
    // sessions are managed per-request via cookies
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});
