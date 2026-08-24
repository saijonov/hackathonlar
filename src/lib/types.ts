import { type ScoreCategory } from './score';

/**
 * Domain types used by every component.
 *
 * These are deliberately *not* the generated Supabase row types. Postgres
 * reports every column of a view as nullable, which would force a `?? ''` at
 * hundreds of call sites even though `hackathons.slug` is `not null`. Instead
 * the query layer maps rows into these honest shapes exactly once (see
 * `src/lib/queries/mappers.ts`), coercing PostgREST's numerics along the way.
 */

export type HackathonFormat = 'offline' | 'online' | 'hybrid';
export type HackathonStatus = 'pending' | 'approved' | 'rejected';
export type ReviewStatus = 'published' | 'hidden';
export type ParticipatedAs = 'participant' | 'finalist' | 'winner' | 'mentor' | 'volunteer';
export type ReportStatus = 'open' | 'resolved' | 'dismissed';
export type UserRole = 'user' | 'admin';

export const HACKATHON_FORMATS: readonly HackathonFormat[] = ['offline', 'online', 'hybrid'];
export const PARTICIPATION_ROLES: readonly ParticipatedAs[] = [
  'participant',
  'finalist',
  'winner',
  'mentor',
  'volunteer',
];

/** A field that exists in all three locales; any of them may be absent. */
export interface LocalizedText {
  uz: string | null;
  ru: string | null;
  en: string | null;
}

export type CategoryAverages = Record<ScoreCategory, number | null>;
export type CategoryRatings = Record<ScoreCategory, number>;

/** 5-star histogram, index 0 = five stars … index 4 = one star. */
export type RatingDistribution = readonly [number, number, number, number, number];

export interface ScoreSummary {
  reviewCount: number;
  overall: number | null;
  categories: CategoryAverages;
  distribution: RatingDistribution;
}

export interface OrganizerRef {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
}

/** The organizer's historical record, shown on upcoming hackathon cards. */
export interface OrganizerTrackRecord {
  avgOverall: number | null;
  reviewCount: number;
  ratedHackathonCount: number;
  hackathonCount: number;
}

export interface HackathonCard {
  id: string;
  slug: string;
  name: string;
  organizer: OrganizerRef | null;
  descriptions: LocalizedText;
  city: string | null;
  format: HackathonFormat;
  startDate: string | null;
  endDate: string | null;
  effectiveStartDate: string | null;
  effectiveEndDate: string | null;
  prizePool: string | null;
  tracks: string[];
  website: string | null;
  telegram: string | null;
  registrationUrl: string | null;
  coverUrl: string | null;
  createdAt: string;
  score: ScoreSummary;
  organizerRecord: OrganizerTrackRecord;
}

export interface OfficialResponse {
  body: string;
  authorLabel: string;
  createdAt: string;
}

export interface PublicReview {
  id: string;
  hackathonId: string;
  hackathonSlug: string;
  hackathonName: string;
  hackathonCoverUrl: string | null;
  isAnonymous: boolean;
  /** Always null when `isAnonymous` — the database never sends it. */
  authorId: string | null;
  displayName: string;
  avatarUrl: string | null;
  ratings: CategoryRatings;
  overall: number;
  title: string;
  body: string;
  pros: string | null;
  cons: string | null;
  participatedAs: ParticipatedAs;
  createdAt: string;
  updatedAt: string;
  editedAt: string | null;
  helpfulCount: number;
  viewerHasVoted: boolean;
  viewerIsAuthor: boolean;
  officialResponse: OfficialResponse | null;
}

export interface OrganizerCard {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  website: string | null;
  telegram: string | null;
  descriptions: LocalizedText;
  hackathonCount: number;
  pastHackathonCount: number;
  ratedHackathonCount: number;
  reviewCount: number;
  overall: number | null;
  categories: CategoryAverages;
}

export interface PlatformStats {
  hackathonCount: number;
  organizerCount: number;
  reviewCount: number;
  avgOverall: number | null;
}

export interface Profile {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  role: UserRole;
}

/** A hackathon the signed-in user submitted, in any status (PRD 7.5 / 7.7). */
export interface SubmissionSummary {
  id: string;
  slug: string;
  name: string;
  status: HackathonStatus;
  rejectionReason: string | null;
  createdAt: string;
  city: string | null;
  format: HackathonFormat;
  startDate: string | null;
  endDate: string | null;
}

/** A review written by the signed-in user, shown on /profile. */
export interface OwnReview {
  id: string;
  hackathonId: string;
  hackathonSlug: string;
  hackathonName: string;
  title: string;
  body: string;
  overall: number;
  ratings: CategoryRatings;
  isAnonymous: boolean;
  status: ReviewStatus;
  participatedAs: ParticipatedAs;
  pros: string | null;
  cons: string | null;
  createdAt: string;
  editedAt: string | null;
}

// ---------------------------------------------------------------------------
// Admin-only shapes. These intentionally carry the real author of every review,
// including anonymous ones (PRD 7.8).
// ---------------------------------------------------------------------------

export interface AdminReview {
  id: string;
  hackathonId: string;
  hackathonSlug: string;
  hackathonName: string;
  authorId: string;
  authorDisplayName: string;
  authorAvatarUrl: string | null;
  authorEmail: string | null;
  isAnonymous: boolean;
  ratings: CategoryRatings;
  overall: number;
  title: string;
  body: string;
  pros: string | null;
  cons: string | null;
  participatedAs: ParticipatedAs;
  status: ReviewStatus;
  createdAt: string;
  editedAt: string | null;
  helpfulCount: number;
  openReportCount: number;
  reportReasons: string[];
  officialResponse: (OfficialResponse & { id: string }) | null;
}

export interface AdminHackathon {
  id: string;
  slug: string;
  name: string;
  organizerId: string | null;
  organizerName: string | null;
  organizerSlug: string | null;
  descriptions: LocalizedText;
  city: string | null;
  format: HackathonFormat;
  startDate: string | null;
  endDate: string | null;
  prizePool: string | null;
  tracks: string[];
  website: string | null;
  telegram: string | null;
  registrationUrl: string | null;
  coverUrl: string | null;
  status: HackathonStatus;
  rejectionReason: string | null;
  submittedById: string | null;
  submittedByName: string | null;
  submittedByEmail: string | null;
  createdAt: string;
  reviewCount: number;
  avgOverall: number | null;
}
