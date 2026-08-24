import 'server-only';

import { createClient } from '@/lib/supabase/server';

/**
 * PRD 8: "max 5 reviews and 3 hackathon submissions per user per day (enforce
 * server-side with a cheap count query)".
 *
 * A count over a covered index on (user_id, created_at) is genuinely cheap and,
 * unlike an in-memory counter, it survives a redeploy and works across every
 * serverless instance. It is a throttle against spam, not a security boundary —
 * the real boundaries are RLS and the unique constraints.
 */

export const RATE_LIMITS = {
  reviewsPerDay: 5,
  submissionsPerDay: 3,
  reportsPerDay: 10,
} as const;

function since24h(): string {
  return new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
}

export async function countRecentReviews(userId: string): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from('reviews')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', since24h());
  return count ?? 0;
}

export async function countRecentSubmissions(userId: string): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from('hackathons')
    .select('id', { count: 'exact', head: true })
    .eq('submitted_by', userId)
    .gte('created_at', since24h());
  return count ?? 0;
}

export async function countRecentReports(userId: string): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from('review_reports')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', since24h());
  return count ?? 0;
}
