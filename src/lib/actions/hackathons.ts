'use server';

import { revalidateTag } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSessionUser } from '@/lib/auth/session';
import { CACHE_TAGS } from '@/lib/queries/public-client';
import { hackathonSubmissionSchema, slugify, toFieldErrors } from '@/lib/validation/schemas';
import { RATE_LIMITS, countRecentSubmissions } from './rate-limit';
import { fail, ok, type ActionResult } from './types';

/**
 * Finds a free slug by appending -2, -3, … Uses the service-role client on
 * purpose: a normal user cannot read pending or rejected hackathons, so their
 * own client would happily hand back a slug that is already taken and the
 * insert would then fail with an opaque unique violation.
 */
async function uniqueSlug(table: 'hackathons' | 'organizers', base: string): Promise<string> {
  const admin = createAdminClient();
  const root = base || 'hakaton';

  for (let attempt = 0; attempt < 50; attempt += 1) {
    const candidate = attempt === 0 ? root : `${root}-${attempt + 1}`;
    const { data } = await admin.from(table).select('id').eq('slug', candidate).maybeSingle();
    if (!data) return candidate;
  }

  // Extremely unlikely; keeps the function total rather than looping forever.
  return `${root}-${Date.now().toString(36)}`;
}

/**
 * Submits a hackathon for moderation (PRD 7.5).
 *
 * The hackathon row is inserted with the *user's* client so RLS is the thing
 * that guarantees `status = 'pending'` and `submitted_by = auth.uid()` — a
 * genuine, testable security boundary rather than a TypeScript promise. Only
 * the optional "create a new organizer" step uses the service role, because
 * organizers are admin-managed and a submitter has no insert rights on them.
 */
export async function submitHackathon(
  input: unknown,
): Promise<ActionResult<{ slug: string; id: string }>> {
  const parsed = hackathonSubmissionSchema.safeParse(input);
  if (!parsed.success) return fail('validation', toFieldErrors(parsed.error));

  const user = await getSessionUser();
  if (!user) return fail('unauthenticated');

  if ((await countRecentSubmissions(user.id)) >= RATE_LIMITS.submissionsPerDay) {
    return fail('rateLimited');
  }

  const value = parsed.data;
  let organizerId = value.organizerId || null;

  if (!organizerId && value.newOrganizerName) {
    const admin = createAdminClient();
    const organizerSlug = await uniqueSlug('organizers', slugify(value.newOrganizerName));

    const { data: organizer, error: organizerError } = await admin
      .from('organizers')
      .insert({
        slug: organizerSlug,
        name: value.newOrganizerName,
        website: value.newOrganizerWebsite,
        telegram: value.newOrganizerTelegram,
      })
      .select('id')
      .single();

    if (organizerError || !organizer) return fail('unknown');
    organizerId = organizer.id;
    revalidateTag(CACHE_TAGS.organizers);
  }

  if (!organizerId) return fail('validation', { organizerId: 'required' });

  const supabase = await createClient();
  const slug = await uniqueSlug('hackathons', slugify(value.name));

  const descriptions = {
    description_uz: value.descriptionLocale === 'uz' ? value.description : null,
    description_ru: value.descriptionLocale === 'ru' ? value.description : null,
    description_en: value.descriptionLocale === 'en' ? value.description : null,
  };

  const { data, error } = await supabase
    .from('hackathons')
    .insert({
      slug,
      name: value.name,
      organizer_id: organizerId,
      ...descriptions,
      city: value.format === 'online' ? null : value.city,
      format: value.format,
      start_date: value.startDate,
      end_date: value.endDate,
      prize_pool: value.prizePool,
      tracks: value.tracks,
      website: value.website,
      telegram: value.telegram,
      registration_url: value.registrationUrl,
      cover_url: value.coverUrl,
      submitted_by: user.id,
    })
    .select('id, slug')
    .single();

  if (error) {
    if (error.code === '23505') return fail('duplicate');
    return fail('unknown');
  }

  // Pending submissions are invisible publicly, but /profile lists them.
  revalidateTag(CACHE_TAGS.hackathons);
  return ok({ id: data.id, slug: data.slug });
}
