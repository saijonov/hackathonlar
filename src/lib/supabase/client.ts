'use client';

import { createBrowserClient } from '@supabase/ssr';
import { type Database } from './database.types';
import { getSupabaseAnonKey, getSupabaseUrl } from './env';

let browserClient: ReturnType<typeof createBrowserClient<Database>> | undefined;

/**
 * Browser Supabase client. Memoised so every component shares one auth state
 * subscription — creating a second client causes duplicated token refreshes.
 *
 * Only ever used for auth flows (sign in / sign up / OAuth) and for reading the
 * live session. All data mutations go through server actions.
 */
export function createClient() {
  browserClient ??= createBrowserClient<Database>(getSupabaseUrl(), getSupabaseAnonKey());
  return browserClient;
}
