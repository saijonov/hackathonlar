'use server';

import { revalidateTag } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getSessionUser } from '@/lib/auth/session';
import { CACHE_TAGS } from '@/lib/queries/public-client';
import { reportSchema, reviewSchema, toFieldErrors } from '@/lib/validation/schemas';
import { todayInTashkent } from '@/lib/format';
import { RATE_LIMITS, countRecentReports, countRecentReviews } from './rate-limit';
import { fail, ok, type ActionResult } from './types';

/**
 * Review mutations.
 *
 * Every one of these re-checks the session server-side and lets RLS do the
 * final enforcement — the client is never trusted (PRD 6, 12). Postgres error
 * codes are translated into stable action codes so the UI can localize them and
 * no database text ever reaches the browser.
 */

function revalidateReviewSurfaces() {
  revalidateTag(CACHE_TAGS.reviews);
  revalidateTag(CACHE_TAGS.hackathons);
  revalidateTag(CACHE_TAGS.organizers);
  revalidateTag(CACHE_TAGS.stats);
}

export async function submitReview(input: unknown): Promise<ActionResult<{ id: string }>> {
  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) return fail('validation', toFieldErrors(parsed.error));

  const user = await getSessionUser();
  if (!user) return fail('unauthenticated');

  const supabase = await createClient();
  const value = parsed.data;

  // The hackathon must exist, be approved, and have actually started. RLS
  // enforces this too; checking here lets us return a precise reason.
  const { data: hackathon } = await supabase
    .from('hackathons')
    .select('id, status, start_date, end_date')
    .eq('id', value.hackathonId)
    .maybeSingle();

  if (!hackathon || hackathon.status !== 'approved') return fail('notFound');

  const startsOn = hackathon.start_date ?? hackathon.end_date;
  if (startsOn && startsOn > todayInTashkent()) return fail('notStarted');

  const { data: existing } = await supabase
    .from('reviews')
    .select('id, status')
    .eq('hackathon_id', value.hackathonId)
    .eq('user_id', user.id)
    .maybeSingle();

  const payload = {
    rating_organization: value.ratings.organization,
    rating_communication: value.ratings.communication,
    rating_judging: value.ratings.judging,
    rating_prizes: value.ratings.prizes,
    rating_venue: value.ratings.venue,
    title: value.title,
    body: value.body,
    pros: value.pros,
    cons: value.cons,
    is_anonymous: value.isAnonymous,
    participated_as: value.participatedAs,
  };

  if (existing) {
    // A review an admin has hidden must not be editable back into visibility.
    if (existing.status === 'hidden') return fail('forbidden');

    const { error } = await supabase.from('reviews').update(payload).eq('id', existing.id);
    if (error) return fail('unknown');

    revalidateReviewSurfaces();
    return ok({ id: existing.id });
  }

  if ((await countRecentReviews(user.id)) >= RATE_LIMITS.reviewsPerDay) {
    return fail('rateLimited');
  }

  const { data, error } = await supabase
    .from('reviews')
    .insert({ ...payload, hackathon_id: value.hackathonId, user_id: user.id })
    .select('id')
    .single();

  if (error) {
    // 23505 = unique_violation on (hackathon_id, user_id).
    if (error.code === '23505') return fail('duplicate');
    return fail('unknown');
  }

  revalidateReviewSurfaces();
  return ok({ id: data.id });
}

export async function deleteReview(reviewId: string): Promise<ActionResult<undefined>> {
  const user = await getSessionUser();
  if (!user) return fail('unauthenticated');

  const supabase = await createClient();
  // RLS restricts this to the author (or an admin); no extra check needed.
  const { error } = await supabase.from('reviews').delete().eq('id', reviewId);
  if (error) return fail('unknown');

  revalidateReviewSurfaces();
  return ok();
}

/** "Foydali" toggle. Voting twice retracts the vote (PRD 15: "once only"). */
export async function toggleHelpful(
  reviewId: string,
): Promise<ActionResult<{ voted: boolean; count: number }>> {
  const user = await getSessionUser();
  if (!user) return fail('unauthenticated');

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from('review_votes')
    .select('id')
    .eq('review_id', reviewId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from('review_votes').delete().eq('id', existing.id);
    if (error) return fail('unknown');
  } else {
    const { error } = await supabase
      .from('review_votes')
      .insert({ review_id: reviewId, user_id: user.id });

    if (error) {
      if (error.code === '23505') return fail('duplicate');
      // The RLS policy rejects voting on your own review, which surfaces as a
      // row-level-security violation rather than a constraint error.
      if (error.code === '42501') return fail('ownVote');
      return fail('unknown');
    }
  }

  // Read the total back from public_reviews, NOT by counting review_votes:
  // RLS restricts that table to the caller's own votes, so counting it would
  // return 1 instead of the real total and the button would show a wrong
  // number until the next full render.
  const { data: updated } = await supabase
    .from('public_reviews')
    .select('helpful_count')
    .eq('id', reviewId)
    .maybeSingle();

  revalidateTag(CACHE_TAGS.reviews);
  return ok({ voted: !existing, count: updated?.helpful_count ?? 0 });
}

export async function reportReview(input: unknown): Promise<ActionResult<undefined>> {
  const parsed = reportSchema.safeParse(input);
  if (!parsed.success) return fail('validation', toFieldErrors(parsed.error));

  const user = await getSessionUser();
  if (!user) return fail('unauthenticated');

  if ((await countRecentReports(user.id)) >= RATE_LIMITS.reportsPerDay) {
    return fail('rateLimited');
  }

  const supabase = await createClient();
  const { error } = await supabase.from('review_reports').insert({
    review_id: parsed.data.reviewId,
    user_id: user.id,
    reason: parsed.data.reason,
  });

  if (error) {
    if (error.code === '23505') return fail('alreadyReported');
    return fail('unknown');
  }

  return ok();
}
