import 'server-only';

import { unstable_cache } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { type OwnReview, type PublicReview } from '@/lib/types';
import { mapOwnReview, mapPublicReview } from './mappers';
import { CACHE_TAGS, DEFAULT_REVALIDATE, createPublicClient } from './public-client';

export type ReviewSort = 'helpful' | 'newest';

const REVIEW_COLUMNS = '*';

/**
 * Reviews for one hackathon.
 *
 * Fetched with the cookie-less public client so the result is cacheable and
 * identical for everyone — which also means `viewer_has_voted` /
 * `viewer_is_author` come back false. The caller merges the real viewer state
 * in via `getViewerReviewState`; see that function for why this split exists.
 */
export const getReviewsForHackathon = unstable_cache(
  async (hackathonId: string, sort: ReviewSort = 'helpful'): Promise<PublicReview[]> => {
    const supabase = createPublicClient();
    let request = supabase.from('public_reviews').select(REVIEW_COLUMNS).eq('hackathon_id', hackathonId);

    // PRD 7.3: "sorted by helpful votes then recency".
    request =
      sort === 'helpful'
        ? request.order('helpful_count', { ascending: false }).order('created_at', { ascending: false })
        : request.order('created_at', { ascending: false });

    const { data, error } = await request.limit(200);
    if (error) throw new Error(`Reviews query failed: ${error.message}`);

    return (data ?? []).map(mapPublicReview);
  },
  ['reviews-for-hackathon'],
  { revalidate: DEFAULT_REVALIDATE, tags: [CACHE_TAGS.reviews] },
);

/** Latest reviews across the whole site — the home page rail (PRD 7.1). */
export const getRecentReviews = unstable_cache(
  async (limit = 6): Promise<PublicReview[]> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from('public_reviews')
      .select(REVIEW_COLUMNS)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw new Error(`Recent reviews query failed: ${error.message}`);
    return (data ?? []).map(mapPublicReview);
  },
  ['recent-reviews'],
  { revalidate: DEFAULT_REVALIDATE, tags: [CACHE_TAGS.reviews] },
);

export interface ViewerReviewState {
  /** Review ids the signed-in user has marked helpful. */
  votedReviewIds: Set<string>;
  /** Review ids the signed-in user wrote — including their anonymous ones. */
  ownReviewIds: Set<string>;
  /** Review ids the signed-in user has already reported. */
  reportedReviewIds: Set<string>;
}

const EMPTY_VIEWER_STATE: ViewerReviewState = {
  votedReviewIds: new Set(),
  ownReviewIds: new Set(),
  reportedReviewIds: new Set(),
};

/**
 * Per-viewer overlay for a list of reviews. Never cached, always scoped to the
 * caller's session, and it only ever reveals facts about the caller's *own*
 * rows — so it cannot be used to deanonymise anybody else's review.
 */
export async function getViewerReviewState(reviewIds: string[]): Promise<ViewerReviewState> {
  if (reviewIds.length === 0) return EMPTY_VIEWER_STATE;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return EMPTY_VIEWER_STATE;

  const [votes, own, reports] = await Promise.all([
    supabase.from('review_votes').select('review_id').eq('user_id', user.id).in('review_id', reviewIds),
    supabase.from('reviews').select('id').eq('user_id', user.id).in('id', reviewIds),
    supabase
      .from('review_reports')
      .select('review_id')
      .eq('user_id', user.id)
      .in('review_id', reviewIds),
  ]);

  return {
    votedReviewIds: new Set((votes.data ?? []).map((row) => row.review_id)),
    ownReviewIds: new Set((own.data ?? []).map((row) => row.id)),
    reportedReviewIds: new Set((reports.data ?? []).map((row) => row.review_id)),
  };
}

/** Applies the viewer overlay onto cached public reviews. */
export function withViewerState(
  reviews: PublicReview[],
  state: ViewerReviewState,
): Array<PublicReview & { viewerHasReported: boolean }> {
  return reviews.map((review) => ({
    ...review,
    viewerHasVoted: state.votedReviewIds.has(review.id),
    viewerIsAuthor: state.ownReviewIds.has(review.id),
    viewerHasReported: state.reportedReviewIds.has(review.id),
  }));
}

/** The signed-in user's own review of a hackathon, for the edit flow. */
export async function getOwnReviewForHackathon(hackathonId: string): Promise<OwnReview | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('reviews')
    .select('*, hackathons(slug, name)')
    .eq('hackathon_id', hackathonId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (error || !data) return null;
  return mapOwnReview(data);
}

/** Everything the signed-in user has written, for /profile. */
export async function getOwnReviews(): Promise<OwnReview[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('reviews')
    .select('*, hackathons(slug, name)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data.map(mapOwnReview);
}
