import 'server-only';

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { type Database } from '@/lib/supabase/database.types';
import { getSupabaseAnonKey, getSupabaseUrl } from '@/lib/supabase/env';

/**
 * A cookie-less `anon` Supabase client for public reads.
 *
 * Why this exists alongside `lib/supabase/server.ts`: that client reads
 * `cookies()`, which opts the whole render out of caching. Catalog, detail and
 * home data are identical for every visitor, so they are fetched with this
 * session-free client and wrapped in `unstable_cache` (PRD 11: "catalog/detail
 * data cached with sensible revalidate"). Anything viewer-specific — your own
 * helpful votes, your own review — is fetched separately with the session
 * client and merged in.
 *
 * It runs as `anon`, so RLS still applies: unapproved hackathons and hidden
 * reviews are unreachable through it, exactly as for a real visitor.
 */
let publicClient: ReturnType<typeof createSupabaseClient<Database>> | undefined;

export function createPublicClient() {
  publicClient ??= createSupabaseClient<Database>(getSupabaseUrl(), getSupabaseAnonKey(), {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { headers: { 'x-application-name': 'hackathonlar.uz/public' } },
  });
  return publicClient;
}

/**
 * Cache tags. Mutations call `revalidateTag` with these so a freshly published
 * review shows up immediately instead of up to 60s later.
 */
export const CACHE_TAGS = {
  hackathons: 'hackathons',
  reviews: 'reviews',
  organizers: 'organizers',
  stats: 'stats',
} as const;

export const DEFAULT_REVALIDATE = 60;

/** PostgREST treats `,` `.` `(` `)` and `*` as syntax inside `or=` filters. */
export function sanitizeSearchTerm(term: string): string {
  return term
    .trim()
    .slice(0, 80)
    .replace(/[,.()*\\%"']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
