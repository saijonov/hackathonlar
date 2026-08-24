import { type Database } from '@/lib/supabase/database.types';
import { toLocalizedText } from '@/lib/localized-text';
import { toScore } from '@/lib/score';
import {
  type AdminHackathon,
  type AdminReview,
  type CategoryAverages,
  type CategoryRatings,
  type HackathonCard,
  type HackathonFormat,
  type HackathonStatus,
  type OrganizerCard,
  type OwnReview,
  type ParticipatedAs,
  type PlatformStats,
  type Profile,
  type PublicReview,
  type RatingDistribution,
  type ReviewStatus,
  type SubmissionSummary,
  type UserRole,
} from '@/lib/types';

/**
 * Row -> domain mapping. This is the ONLY place that deals with the fact that
 * Postgres declares every view column nullable, and the only place that
 * coerces PostgREST numerics. Everything downstream gets honest types.
 */

type Views = Database['public']['Views'];
type Tables = Database['public']['Tables'];

export type HackathonCardRow = Views['hackathon_cards']['Row'];
export type PublicReviewRow = Views['public_reviews']['Row'];
export type OrganizerCardRow = Views['organizer_cards']['Row'];
export type PlatformStatsRow = Views['platform_stats']['Row'];
export type AdminReviewRow = Views['admin_reviews']['Row'];
export type AdminHackathonRow = Views['admin_hackathons']['Row'];

/** Guards a value the database declares NOT NULL but types as nullable. */
function required<T>(value: T | null | undefined, field: string): T {
  if (value === null || value === undefined) {
    throw new Error(`Malformed row from Supabase: expected "${field}" to be present`);
  }
  return value;
}

function asFormat(value: string | null | undefined): HackathonFormat {
  return value === 'online' || value === 'hybrid' ? value : 'offline';
}

function asStatus(value: string | null | undefined): HackathonStatus {
  return value === 'approved' || value === 'rejected' ? value : 'pending';
}

function asReviewStatus(value: string | null | undefined): ReviewStatus {
  return value === 'hidden' ? 'hidden' : 'published';
}

function asParticipation(value: string | null | undefined): ParticipatedAs {
  switch (value) {
    case 'finalist':
    case 'winner':
    case 'mentor':
    case 'volunteer':
      return value;
    default:
      return 'participant';
  }
}

function asRole(value: string | null | undefined): UserRole {
  return value === 'admin' ? 'admin' : 'user';
}

function count(value: number | null | undefined): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function categoryAverages(row: {
  avg_organization: number | null;
  avg_communication: number | null;
  avg_judging: number | null;
  avg_prizes: number | null;
  avg_venue: number | null;
}): CategoryAverages {
  return {
    organization: toScore(row.avg_organization),
    communication: toScore(row.avg_communication),
    judging: toScore(row.avg_judging),
    prizes: toScore(row.avg_prizes),
    venue: toScore(row.avg_venue),
  };
}

function distribution(row: {
  dist_5: number | null;
  dist_4: number | null;
  dist_3: number | null;
  dist_2: number | null;
  dist_1: number | null;
}): RatingDistribution {
  return [count(row.dist_5), count(row.dist_4), count(row.dist_3), count(row.dist_2), count(row.dist_1)];
}

function ratingsOf(row: {
  rating_organization: number | null;
  rating_communication: number | null;
  rating_judging: number | null;
  rating_prizes: number | null;
  rating_venue: number | null;
}): CategoryRatings {
  return {
    organization: required(row.rating_organization, 'rating_organization'),
    communication: required(row.rating_communication, 'rating_communication'),
    judging: required(row.rating_judging, 'rating_judging'),
    prizes: required(row.rating_prizes, 'rating_prizes'),
    venue: required(row.rating_venue, 'rating_venue'),
  };
}

export function mapHackathonCard(row: HackathonCardRow): HackathonCard {
  const organizerId = row.organizer_id;
  const organizerSlug = row.organizer_slug;

  return {
    id: required(row.id, 'id'),
    slug: required(row.slug, 'slug'),
    name: required(row.name, 'name'),
    organizer:
      organizerId && organizerSlug
        ? {
            id: organizerId,
            slug: organizerSlug,
            name: row.organizer_name ?? organizerSlug,
            logoUrl: row.organizer_logo_url,
          }
        : null,
    descriptions: toLocalizedText(row),
    city: row.city,
    format: asFormat(row.format),
    startDate: row.start_date,
    endDate: row.end_date,
    effectiveStartDate: row.effective_start_date,
    effectiveEndDate: row.effective_end_date,
    prizePool: row.prize_pool,
    tracks: row.tracks ?? [],
    website: row.website,
    telegram: row.telegram,
    registrationUrl: row.registration_url,
    coverUrl: row.cover_url,
    createdAt: required(row.created_at, 'created_at'),
    score: {
      reviewCount: count(row.review_count),
      overall: toScore(row.avg_overall),
      categories: categoryAverages(row),
      distribution: distribution(row),
    },
    organizerRecord: {
      avgOverall: toScore(row.organizer_avg_overall),
      reviewCount: count(row.organizer_review_count),
      ratedHackathonCount: count(row.organizer_rated_hackathon_count),
      hackathonCount: count(row.organizer_hackathon_count),
    },
  };
}

export function mapPublicReview(row: PublicReviewRow): PublicReview {
  const isAnonymous = row.is_anonymous ?? false;

  return {
    id: required(row.id, 'id'),
    hackathonId: required(row.hackathon_id, 'hackathon_id'),
    hackathonSlug: required(row.hackathon_slug, 'hackathon_slug'),
    hackathonName: required(row.hackathon_name, 'hackathon_name'),
    hackathonCoverUrl: row.hackathon_cover_url,
    isAnonymous,
    // Defence in depth: the view already nulls these for anonymous reviews.
    authorId: isAnonymous ? null : row.author_id,
    displayName: required(row.display_name, 'display_name'),
    avatarUrl: isAnonymous ? null : row.avatar_url,
    ratings: ratingsOf(row),
    overall: required(toScore(row.overall), 'overall'),
    title: required(row.title, 'title'),
    body: required(row.body, 'body'),
    pros: row.pros,
    cons: row.cons,
    participatedAs: asParticipation(row.participated_as),
    createdAt: required(row.created_at, 'created_at'),
    updatedAt: required(row.updated_at, 'updated_at'),
    editedAt: row.edited_at,
    helpfulCount: count(row.helpful_count),
    viewerHasVoted: row.viewer_has_voted ?? false,
    viewerIsAuthor: row.viewer_is_author ?? false,
    officialResponse: row.response_body
      ? {
          body: row.response_body,
          authorLabel: row.response_author_label ?? '',
          createdAt: required(row.response_created_at, 'response_created_at'),
        }
      : null,
  };
}

export function mapOrganizerCard(row: OrganizerCardRow): OrganizerCard {
  return {
    id: required(row.id, 'id'),
    slug: required(row.slug, 'slug'),
    name: required(row.name, 'name'),
    logoUrl: row.logo_url,
    website: row.website,
    telegram: row.telegram,
    descriptions: toLocalizedText(row),
    hackathonCount: count(row.hackathon_count),
    pastHackathonCount: count(row.past_hackathon_count),
    ratedHackathonCount: count(row.rated_hackathon_count),
    reviewCount: count(row.review_count),
    overall: toScore(row.avg_overall),
    categories: categoryAverages(row),
  };
}

export function mapPlatformStats(row: PlatformStatsRow | null | undefined): PlatformStats {
  return {
    hackathonCount: count(row?.hackathon_count),
    organizerCount: count(row?.organizer_count),
    reviewCount: count(row?.review_count),
    avgOverall: toScore(row?.avg_overall),
  };
}

export function mapProfile(row: Pick<
  Tables['profiles']['Row'],
  'id' | 'display_name' | 'avatar_url' | 'role'
>): Profile {
  return {
    id: row.id,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    role: asRole(row.role),
  };
}

export function mapSubmission(
  row: Pick<
    Tables['hackathons']['Row'],
    'id' | 'slug' | 'name' | 'status' | 'rejection_reason' | 'created_at' | 'city' | 'format' | 'start_date' | 'end_date'
  >,
): SubmissionSummary {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    status: asStatus(row.status),
    rejectionReason: row.rejection_reason,
    createdAt: row.created_at,
    city: row.city,
    format: asFormat(row.format),
    startDate: row.start_date,
    endDate: row.end_date,
  };
}

type OwnReviewRow = Tables['reviews']['Row'] & {
  hackathons: { slug: string; name: string } | null;
};

export function mapOwnReview(row: OwnReviewRow): OwnReview {
  return {
    id: row.id,
    hackathonId: row.hackathon_id,
    hackathonSlug: row.hackathons?.slug ?? '',
    hackathonName: row.hackathons?.name ?? '',
    title: row.title,
    body: row.body,
    overall: required(toScore(row.overall), 'overall'),
    ratings: ratingsOf(row),
    isAnonymous: row.is_anonymous,
    status: asReviewStatus(row.status),
    participatedAs: asParticipation(row.participated_as),
    pros: row.pros,
    cons: row.cons,
    createdAt: row.created_at,
    editedAt: row.edited_at,
  };
}

export function mapAdminReview(row: AdminReviewRow): AdminReview {
  return {
    id: required(row.id, 'id'),
    hackathonId: required(row.hackathon_id, 'hackathon_id'),
    hackathonSlug: required(row.hackathon_slug, 'hackathon_slug'),
    hackathonName: required(row.hackathon_name, 'hackathon_name'),
    authorId: required(row.author_id, 'author_id'),
    authorDisplayName: required(row.author_display_name, 'author_display_name'),
    authorAvatarUrl: row.author_avatar_url,
    authorEmail: row.author_email,
    isAnonymous: row.is_anonymous ?? false,
    ratings: ratingsOf(row),
    overall: required(toScore(row.overall), 'overall'),
    title: required(row.title, 'title'),
    body: required(row.body, 'body'),
    pros: row.pros,
    cons: row.cons,
    participatedAs: asParticipation(row.participated_as),
    status: asReviewStatus(row.status),
    createdAt: required(row.created_at, 'created_at'),
    editedAt: row.edited_at,
    helpfulCount: count(row.helpful_count),
    openReportCount: count(row.open_report_count),
    reportReasons: row.report_reasons ?? [],
    officialResponse:
      row.response_id && row.response_body
        ? {
            id: row.response_id,
            body: row.response_body,
            authorLabel: row.response_author_label ?? '',
            createdAt: required(row.created_at, 'created_at'),
          }
        : null,
  };
}

export function mapAdminHackathon(row: AdminHackathonRow): AdminHackathon {
  return {
    id: required(row.id, 'id'),
    slug: required(row.slug, 'slug'),
    name: required(row.name, 'name'),
    organizerId: row.organizer_id,
    organizerName: row.organizer_name,
    organizerSlug: row.organizer_slug,
    descriptions: toLocalizedText(row),
    city: row.city,
    format: asFormat(row.format),
    startDate: row.start_date,
    endDate: row.end_date,
    prizePool: row.prize_pool,
    tracks: row.tracks ?? [],
    website: row.website,
    telegram: row.telegram,
    registrationUrl: row.registration_url,
    coverUrl: row.cover_url,
    status: asStatus(row.status),
    rejectionReason: row.rejection_reason,
    submittedById: row.submitted_by,
    submittedByName: row.submitted_by_name,
    submittedByEmail: row.submitted_by_email,
    createdAt: required(row.created_at, 'created_at'),
    reviewCount: count(row.review_count),
    avgOverall: toScore(row.avg_overall),
  };
}
