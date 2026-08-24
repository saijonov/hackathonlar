import 'server-only';

import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import { mapProfile } from '@/lib/queries/mappers';
import { type Profile } from '@/lib/types';

export interface SessionUser {
  id: string;
  email: string | null;
  profile: Profile | null;
}

/**
 * The signed-in user for this request, or null.
 *
 * `getUser()` rather than `getSession()`: it validates the JWT against the auth
 * server, so a forged or stale cookie cannot pass. Wrapped in React `cache` so
 * a page that checks auth in the layout, the page and a server action still
 * makes a single round trip.
 */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  const { data: profileRow } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_url, role')
    .eq('id', user.id)
    .maybeSingle();

  return {
    id: user.id,
    email: user.email ?? null,
    profile: profileRow ? mapProfile(profileRow) : null,
  };
});

export async function isAdmin(): Promise<boolean> {
  const user = await getSessionUser();
  return user?.profile?.role === 'admin';
}

/** Thrown by the `require*` helpers; server actions turn it into a result. */
export class AuthorizationError extends Error {
  constructor(
    message: string,
    readonly kind: 'unauthenticated' | 'forbidden',
  ) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new AuthorizationError('Authentication required', 'unauthenticated');
  return user;
}

/**
 * Gate for every admin surface and every service-role mutation.
 * Server-side only — client state is never trusted (PRD 6, 12).
 */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.profile?.role !== 'admin') {
    throw new AuthorizationError('Administrator role required', 'forbidden');
  }
  return user;
}
