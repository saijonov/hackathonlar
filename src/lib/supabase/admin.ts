import 'server-only';

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { type Database } from './database.types';
import { getSupabaseServiceRoleKey, getSupabaseUrl } from './env';

/**
 * Service-role client — bypasses RLS entirely.
 *
 * RULES:
 *   1. Server-side only. `import 'server-only'` makes a client import a build
 *      error rather than a silent key leak.
 *   2. Never call this without first passing through `requireAdmin()` (or an
 *      equivalent explicit authorization check in the same function).
 *   3. It carries no user session, so `auth.uid()` is null inside every query —
 *      do not rely on RLS helpers here, do the check in TypeScript.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}
