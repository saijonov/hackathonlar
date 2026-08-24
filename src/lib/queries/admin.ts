import 'server-only';

import { createClient } from '@/lib/supabase/server';
import { type AdminHackathon, type AdminReview } from '@/lib/types';
import { mapAdminHackathon, mapAdminReview } from './mappers';

/**
 * Admin reads.
 *
 * These use the *session* client, not the service role: the `admin_reviews`
 * and `admin_hackathons` views gate themselves on `has_admin_access()`, so a
 * non-admin JWT simply returns zero rows. That keeps the database as the
 * authority on who is an admin, rather than trusting the page that called this.
 *
 * Never cached — moderation must always see the current state.
 */

export interface AdminOverview {
  pendingCount: number;
  openReportCount: number;
  reviewCount: number;
  hackathonCount: number;
}

export async function getAdminOverview(): Promise<AdminOverview> {
  const supabase = await createClient();

  const [pending, reports, reviews, hackathons] = await Promise.all([
    supabase.from('hackathons').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('review_reports').select('id', { count: 'exact', head: true }).eq('status', 'open'),
    supabase.from('reviews').select('id', { count: 'exact', head: true }),
    supabase.from('hackathons').select('id', { count: 'exact', head: true }),
  ]);

  return {
    pendingCount: pending.count ?? 0,
    openReportCount: reports.count ?? 0,
    reviewCount: reviews.count ?? 0,
    hackathonCount: hackathons.count ?? 0,
  };
}

export async function getModerationQueue(): Promise<AdminHackathon[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('admin_hackathons')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  if (error || !data) return [];
  return data.map(mapAdminHackathon);
}

export async function getAdminHackathons(status?: 'pending' | 'approved' | 'rejected') {
  const supabase = await createClient();
  let request = supabase.from('admin_hackathons').select('*');
  if (status) request = request.eq('status', status);

  const { data, error } = await request.order('created_at', { ascending: false }).limit(500);
  if (error || !data) return [];
  return data.map(mapAdminHackathon);
}

export type AdminReviewFilter = 'all' | 'reported' | 'hidden';

export async function getAdminReviews(filter: AdminReviewFilter = 'all'): Promise<AdminReview[]> {
  const supabase = await createClient();
  let request = supabase.from('admin_reviews').select('*');

  if (filter === 'reported') request = request.gt('open_report_count', 0);
  if (filter === 'hidden') request = request.eq('status', 'hidden');

  // Reported reviews float to the top of the default list (PRD 7.8).
  const { data, error } = await request
    .order('open_report_count', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(300);

  if (error || !data) return [];
  return data.map(mapAdminReview);
}

export interface AdminReport {
  id: string;
  reviewId: string;
  reason: string;
  createdAt: string;
  reporterName: string | null;
  reviewTitle: string | null;
  hackathonSlug: string | null;
}

export async function getOpenReports(): Promise<AdminReport[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('review_reports')
    .select('id, review_id, reason, created_at, profiles(display_name), reviews(title, hackathons(slug))')
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(200);

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    reviewId: row.review_id,
    reason: row.reason,
    createdAt: row.created_at,
    reporterName: row.profiles?.display_name ?? null,
    reviewTitle: row.reviews?.title ?? null,
    hackathonSlug: row.reviews?.hackathons?.slug ?? null,
  }));
}

export async function getAdminOrganizers() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('organizers')
    .select('id, slug, name, logo_url, website, telegram, description_uz, description_ru, description_en')
    .order('name', { ascending: true });

  if (error || !data) return [];
  return data;
}
