import 'server-only';

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { type Database } from './database.types';
import { getSupabaseAnonKey, getSupabaseUrl } from './env';

/**
 * Request-scoped Supabase client that runs as the signed-in user (or as `anon`
 * when there is no session), so every query is subject to RLS.
 *
 * A new client per render is mandatory — sharing one across requests would leak
 * one user's session into another's response.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component, where cookies are read-only. The
          // middleware refreshes the session, so this is safe to swallow —
          // this is the pattern Supabase documents for the App Router.
        }
      },
    },
  });
}
