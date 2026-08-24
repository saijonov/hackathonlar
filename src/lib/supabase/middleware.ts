import type { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { type Database } from './database.types';
import { getSupabaseAnonKey, getSupabaseUrl } from './env';

/**
 * Refreshes the Supabase session on every request and writes the rotated
 * cookies onto `response`.
 *
 * Server Components cannot set cookies, so without this the access token would
 * silently expire and users would appear randomly logged out.
 */
export async function updateSession(
  request: NextRequest,
  response: NextResponse,
): Promise<NextResponse> {
  const supabase = createServerClient<Database>(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // IMPORTANT: `getUser()` (not `getSession()`) — it revalidates the JWT with
  // the auth server, which is what actually triggers the refresh.
  await supabase.auth.getUser();

  return response;
}
