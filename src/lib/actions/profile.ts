'use server';

import { revalidateTag } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getSessionUser } from '@/lib/auth/session';
import { CACHE_TAGS } from '@/lib/queries/public-client';
import { profileSchema, toFieldErrors } from '@/lib/validation/schemas';
import { fail, ok, type ActionResult } from './types';

/**
 * Updates the caller's own profile.
 *
 * `profiles` only grants UPDATE on (display_name, avatar_url) to the
 * `authenticated` role, so even a crafted payload physically cannot touch
 * `role` — the column privilege stops it before RLS is even consulted.
 */
export async function updateProfile(input: unknown): Promise<ActionResult<undefined>> {
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return fail('validation', toFieldErrors(parsed.error));

  const user = await getSessionUser();
  if (!user) return fail('unauthenticated');

  const supabase = await createClient();
  const { error } = await supabase
    .from('profiles')
    .update({
      display_name: parsed.data.displayName,
      avatar_url: parsed.data.avatarUrl,
    })
    .eq('id', user.id);

  if (error) return fail('unknown');

  // Display names appear on every non-anonymous review.
  revalidateTag(CACHE_TAGS.reviews);
  return ok();
}
