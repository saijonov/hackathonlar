'use server';

import { revalidateTag } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { type TablesUpdate } from '@/lib/supabase/database.types';
import { AuthorizationError, requireAdmin } from '@/lib/auth/session';
import { CACHE_TAGS } from '@/lib/queries/public-client';
import {
  moderationSchema,
  officialResponseSchema,
  organizerSchema,
  slugify,
  toFieldErrors,
} from '@/lib/validation/schemas';
import { fail, ok, type ActionResult } from './types';

/**
 * Admin mutations (PRD 7.8).
 *
 * Shape of every function here: `requireAdmin()` first — a server-side check
 * against the database's own `profiles.role`, never client state — and only
 * then the service-role client. `guard()` makes that ordering impossible to get
 * wrong, since forgetting it means the action simply has no client to use.
 */
async function guard<T>(run: (admin: ReturnType<typeof createAdminClient>) => Promise<ActionResult<T>>) {
  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return fail(error.kind === 'unauthenticated' ? 'unauthenticated' : 'forbidden');
    }
    return fail('unknown');
  }

  try {
    return await run(createAdminClient());
  } catch {
    return fail('unknown');
  }
}

function revalidateEverything() {
  revalidateTag(CACHE_TAGS.hackathons);
  revalidateTag(CACHE_TAGS.reviews);
  revalidateTag(CACHE_TAGS.organizers);
  revalidateTag(CACHE_TAGS.stats);
}

// ---------------------------------------------------------------------------
// Moderation queue
// ---------------------------------------------------------------------------

export async function moderateHackathon(input: unknown): Promise<ActionResult<undefined>> {
  const parsed = moderationSchema.safeParse(input);
  if (!parsed.success) return fail('validation', toFieldErrors(parsed.error));

  return guard(async (admin) => {
    const { hackathonId, action, rejectionReason } = parsed.data;

    const { error } = await admin
      .from('hackathons')
      .update({
        status: action === 'approve' ? 'approved' : 'rejected',
        rejection_reason: action === 'reject' ? rejectionReason : null,
      })
      .eq('id', hackathonId);

    if (error) return fail('unknown');

    revalidateEverything();
    return ok();
  });
}

/**
 * The fields an admin form may write. Declaring them explicitly (rather than
 * taking a `Record<string, unknown>`) means an unexpected key is a compile
 * error, not a silent column write.
 */
export interface AdminHackathonPatch {
  name?: string;
  organizer_id?: string | null;
  description_uz?: string | null;
  description_ru?: string | null;
  description_en?: string | null;
  city?: string | null;
  format?: string;
  start_date?: string | null;
  end_date?: string | null;
  prize_pool?: string | null;
  tracks?: string[];
  website?: string | null;
  telegram?: string | null;
  registration_url?: string | null;
  cover_url?: string | null;
  status?: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string | null;
}

/** Empty strings from HTML forms mean "cleared", which in SQL is NULL. */
function normalizePatch(patch: AdminHackathonPatch): TablesUpdate<'hackathons'> {
  const update: TablesUpdate<'hackathons'> = {};

  if (patch.name !== undefined) update.name = patch.name;
  if (patch.organizer_id !== undefined) update.organizer_id = patch.organizer_id || null;
  if (patch.description_uz !== undefined) update.description_uz = patch.description_uz || null;
  if (patch.description_ru !== undefined) update.description_ru = patch.description_ru || null;
  if (patch.description_en !== undefined) update.description_en = patch.description_en || null;
  if (patch.city !== undefined) update.city = patch.city || null;
  if (patch.format !== undefined) update.format = patch.format;
  if (patch.start_date !== undefined) update.start_date = patch.start_date || null;
  if (patch.end_date !== undefined) update.end_date = patch.end_date || null;
  if (patch.prize_pool !== undefined) update.prize_pool = patch.prize_pool || null;
  if (patch.tracks !== undefined) update.tracks = patch.tracks;
  if (patch.website !== undefined) update.website = patch.website || null;
  if (patch.telegram !== undefined) update.telegram = patch.telegram || null;
  if (patch.registration_url !== undefined) update.registration_url = patch.registration_url || null;
  if (patch.cover_url !== undefined) update.cover_url = patch.cover_url || null;
  if (patch.status !== undefined) update.status = patch.status;
  if (patch.rejection_reason !== undefined) update.rejection_reason = patch.rejection_reason || null;

  // Keep the hackathons_city_matches_format CHECK satisfied.
  if (update.format === 'online') update.city = null;

  return update;
}

/** Edit-then-approve, and ordinary edits of an already-published hackathon. */
export async function updateHackathon(
  hackathonId: string,
  patch: AdminHackathonPatch,
): Promise<ActionResult<undefined>> {
  return guard(async (admin) => {
    const update = normalizePatch(patch);
    if (Object.keys(update).length === 0) return ok();

    const { error } = await admin.from('hackathons').update(update).eq('id', hackathonId);
    if (error) return fail('unknown');

    revalidateEverything();
    return ok();
  });
}

/** Admin-created hackathons skip moderation entirely (PRD 7.8). */
export async function createHackathon(
  patch: AdminHackathonPatch,
): Promise<ActionResult<{ slug: string }>> {
  return guard(async (admin) => {
    const name = (patch.name ?? '').trim();
    if (name.length < 3) return fail('validation', { name: 'tooShort' });

    const hasDescription = [patch.description_uz, patch.description_ru, patch.description_en].some(
      (value) => (value ?? '').trim().length > 0,
    );
    if (!hasDescription) return fail('validation', { description: 'descriptionRequired' });

    let slug = slugify(name);
    for (let attempt = 0; attempt < 50; attempt += 1) {
      const candidate = attempt === 0 ? slug : `${slug}-${attempt + 1}`;
      const { data } = await admin.from('hackathons').select('id').eq('slug', candidate).maybeSingle();
      if (!data) {
        slug = candidate;
        break;
      }
    }

    const normalized = normalizePatch({ ...patch, name });
    const { data, error } = await admin
      .from('hackathons')
      .insert({
        ...normalized,
        slug,
        name,
        format: patch.format ?? 'offline',
        tracks: patch.tracks ?? [],
        status: 'approved',
      })
      .select('slug')
      .single();

    if (error) return fail(error.code === '23505' ? 'duplicate' : 'unknown');

    revalidateEverything();
    return ok({ slug: data.slug });
  });
}

export async function deleteHackathon(hackathonId: string): Promise<ActionResult<undefined>> {
  return guard(async (admin) => {
    const { error } = await admin.from('hackathons').delete().eq('id', hackathonId);
    if (error) return fail('unknown');
    revalidateEverything();
    return ok();
  });
}

// ---------------------------------------------------------------------------
// Review moderation
// ---------------------------------------------------------------------------

/**
 * Hiding a review removes it from every public surface AND from every
 * aggregate — the views only ever count `status = 'published'` (PRD 8).
 */
export async function setReviewVisibility(
  reviewId: string,
  status: 'published' | 'hidden',
): Promise<ActionResult<undefined>> {
  return guard(async (admin) => {
    const { error } = await admin.from('reviews').update({ status }).eq('id', reviewId);
    if (error) return fail('unknown');
    revalidateEverything();
    return ok();
  });
}

export async function resolveReport(
  reportId: string,
  status: 'resolved' | 'dismissed',
): Promise<ActionResult<undefined>> {
  return guard(async (admin) => {
    const { error } = await admin.from('review_reports').update({ status }).eq('id', reportId);
    if (error) return fail('unknown');
    revalidateTag(CACHE_TAGS.reviews);
    return ok();
  });
}

// ---------------------------------------------------------------------------
// Official responses (PRD 8: admin-mediated, since v1 has no organizer accounts)
// ---------------------------------------------------------------------------

export async function saveOfficialResponse(input: unknown): Promise<ActionResult<undefined>> {
  const parsed = officialResponseSchema.safeParse(input);
  if (!parsed.success) return fail('validation', toFieldErrors(parsed.error));

  return guard(async (admin) => {
    const { error } = await admin.from('official_responses').upsert(
      {
        review_id: parsed.data.reviewId,
        body: parsed.data.body,
        author_label: parsed.data.authorLabel,
      },
      { onConflict: 'review_id' },
    );

    if (error) return fail('unknown');
    revalidateTag(CACHE_TAGS.reviews);
    return ok();
  });
}

export async function deleteOfficialResponse(reviewId: string): Promise<ActionResult<undefined>> {
  return guard(async (admin) => {
    const { error } = await admin.from('official_responses').delete().eq('review_id', reviewId);
    if (error) return fail('unknown');
    revalidateTag(CACHE_TAGS.reviews);
    return ok();
  });
}

// ---------------------------------------------------------------------------
// Organizers
// ---------------------------------------------------------------------------

export async function saveOrganizer(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = organizerSchema.safeParse(input);
  if (!parsed.success) return fail('validation', toFieldErrors(parsed.error));

  return guard(async (admin) => {
    const value = parsed.data;
    const payload = {
      slug: value.slug,
      name: value.name,
      logo_url: value.logoUrl,
      website: value.website,
      telegram: value.telegram,
      description_uz: value.descriptionUz || null,
      description_ru: value.descriptionRu || null,
      description_en: value.descriptionEn || null,
    };

    const query = value.id
      ? admin.from('organizers').update(payload).eq('id', value.id).select('id').single()
      : admin.from('organizers').insert(payload).select('id').single();

    const { data, error } = await query;
    if (error) return fail(error.code === '23505' ? 'duplicate' : 'unknown');

    revalidateTag(CACHE_TAGS.organizers);
    revalidateTag(CACHE_TAGS.hackathons);
    return ok({ id: data.id });
  });
}

export async function deleteOrganizer(organizerId: string): Promise<ActionResult<undefined>> {
  return guard(async (admin) => {
    const { error } = await admin.from('organizers').delete().eq('id', organizerId);
    if (error) return fail('unknown');
    revalidateTag(CACHE_TAGS.organizers);
    revalidateTag(CACHE_TAGS.hackathons);
    return ok();
  });
}
