import { z } from 'zod';
import { MAX_RATING, MIN_RATING, SCORE_CATEGORIES } from '@/lib/score';
import { HACKATHON_FORMATS, PARTICIPATION_ROLES } from '@/lib/types';

/**
 * Shared zod schemas — the single definition of what is valid.
 *
 * The same schema runs in the browser (instant feedback) and again inside every
 * server action (the only copy that is actually trusted, PRD 12). Every limit
 * here mirrors a CHECK constraint in the database, so a payload that slips past
 * both layers still cannot corrupt a row.
 *
 * Error messages are stable *codes*, not prose: the UI renders them through
 * next-intl (`validation.<code>`) so validation is localized like everything
 * else, and adding a locale never means touching this file.
 */

export const FIELD_ERROR_CODES = [
  'required',
  'tooShort',
  'tooLong',
  'invalid',
  'range',
  'dateOrder',
  'descriptionRequired',
  'cityWithOnline',
] as const;

export type FieldErrorCode = (typeof FIELD_ERROR_CODES)[number];

const code = (value: FieldErrorCode) => value;

// ---------------------------------------------------------------------------
// Reviews (PRD 7.4)
// ---------------------------------------------------------------------------

export const REVIEW_LIMITS = {
  titleMin: 5,
  titleMax: 100,
  /** PRD 7.4: "min length 50 chars for body to force substance". */
  bodyMin: 50,
  bodyMax: 3000,
  prosConsMax: 500,
} as const;

const rating = z
  .number({ error: code('required') })
  .int(code('invalid'))
  .min(MIN_RATING, code('range'))
  .max(MAX_RATING, code('range'));

const ratingsShape = Object.fromEntries(
  SCORE_CATEGORIES.map((category) => [category, rating]),
) as Record<(typeof SCORE_CATEGORIES)[number], typeof rating>;

export const reviewRatingsSchema = z.object(ratingsShape);

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, code('tooLong'))
    .transform((value) => (value.length === 0 ? null : value))
    .nullable();

export const reviewSchema = z.object({
  hackathonId: z.uuid(code('invalid')),
  ratings: reviewRatingsSchema,
  title: z
    .string({ error: code('required') })
    .trim()
    .min(REVIEW_LIMITS.titleMin, code('tooShort'))
    .max(REVIEW_LIMITS.titleMax, code('tooLong')),
  body: z
    .string({ error: code('required') })
    .trim()
    .min(REVIEW_LIMITS.bodyMin, code('tooShort'))
    .max(REVIEW_LIMITS.bodyMax, code('tooLong')),
  pros: optionalText(REVIEW_LIMITS.prosConsMax).optional().default(null),
  cons: optionalText(REVIEW_LIMITS.prosConsMax).optional().default(null),
  isAnonymous: z.boolean().default(false),
  participatedAs: z.enum(PARTICIPATION_ROLES as unknown as [string, ...string[]]),
});

export type ReviewInput = z.input<typeof reviewSchema>;
export type ReviewParsed = z.output<typeof reviewSchema>;

export const reportSchema = z.object({
  reviewId: z.uuid(code('invalid')),
  reason: z
    .string({ error: code('required') })
    .trim()
    .min(3, code('tooShort'))
    .max(500, code('tooLong')),
});

// ---------------------------------------------------------------------------
// Hackathon submission (PRD 7.5)
// ---------------------------------------------------------------------------

export const SUBMISSION_LIMITS = {
  nameMin: 3,
  nameMax: 160,
  descriptionMin: 40,
  descriptionMax: 6000,
  cityMax: 80,
  prizePoolMax: 120,
  maxTracks: 12,
} as const;

const optionalUrl = z
  .union([z.literal(''), z.url(code('invalid'))])
  .optional()
  .transform((value) => (value ? value : null));

const isoDate = z
  .union([z.literal(''), z.string().regex(/^\d{4}-\d{2}-\d{2}$/, code('invalid'))])
  .optional()
  .transform((value) => (value ? value : null));

export const hackathonSubmissionSchema = z
  .object({
    name: z
      .string({ error: code('required') })
      .trim()
      .min(SUBMISSION_LIMITS.nameMin, code('tooShort'))
      .max(SUBMISSION_LIMITS.nameMax, code('tooLong')),
    organizerId: z.union([z.uuid(code('invalid')), z.literal('')]).optional(),
    newOrganizerName: z
      .string()
      .trim()
      .max(140, code('tooLong'))
      .optional()
      .transform((value) => (value ? value : null)),
    newOrganizerWebsite: optionalUrl,
    newOrganizerTelegram: optionalUrl,
    city: z
      .string()
      .trim()
      .max(SUBMISSION_LIMITS.cityMax, code('tooLong'))
      .optional()
      .transform((value) => (value ? value : null)),
    format: z.enum(HACKATHON_FORMATS as unknown as [string, ...string[]]),
    startDate: isoDate,
    endDate: isoDate,
    prizePool: z
      .string()
      .trim()
      .max(SUBMISSION_LIMITS.prizePoolMax, code('tooLong'))
      .optional()
      .transform((value) => (value ? value : null)),
    tracks: z
      .array(z.string().trim().min(1).max(60))
      .max(SUBMISSION_LIMITS.maxTracks, code('tooLong'))
      .default([]),
    website: optionalUrl,
    telegram: optionalUrl,
    registrationUrl: optionalUrl,
    coverUrl: optionalUrl,
    descriptionLocale: z.enum(['uz', 'ru', 'en']),
    description: z
      .string({ error: code('required') })
      .trim()
      .min(SUBMISSION_LIMITS.descriptionMin, code('tooShort'))
      .max(SUBMISSION_LIMITS.descriptionMax, code('tooLong')),
  })
  .superRefine((value, ctx) => {
    if (value.startDate && value.endDate && value.endDate < value.startDate) {
      ctx.addIssue({ code: 'custom', message: code('dateOrder'), path: ['endDate'] });
    }
    // Mirrors the hackathons_city_matches_format CHECK constraint.
    if (value.format === 'online' && value.city) {
      ctx.addIssue({ code: 'custom', message: code('cityWithOnline'), path: ['city'] });
    }
    if (!value.organizerId && !value.newOrganizerName) {
      ctx.addIssue({ code: 'custom', message: code('required'), path: ['organizerId'] });
    }
  });

export type HackathonSubmissionInput = z.input<typeof hackathonSubmissionSchema>;

// ---------------------------------------------------------------------------
// Profile (PRD 7.7)
// ---------------------------------------------------------------------------

export const profileSchema = z.object({
  displayName: z
    .string({ error: code('required') })
    .trim()
    .min(2, code('tooShort'))
    .max(60, code('tooLong')),
  avatarUrl: optionalUrl,
});

// ---------------------------------------------------------------------------
// Admin (PRD 7.8)
// ---------------------------------------------------------------------------

export const officialResponseSchema = z.object({
  reviewId: z.uuid(code('invalid')),
  body: z
    .string({ error: code('required') })
    .trim()
    .min(10, code('tooShort'))
    .max(2000, code('tooLong')),
  authorLabel: z
    .string({ error: code('required') })
    .trim()
    .min(2, code('tooShort'))
    .max(120, code('tooLong')),
});

export const organizerSchema = z.object({
  id: z.uuid().optional(),
  slug: z
    .string({ error: code('required') })
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, code('invalid'))
    .max(120, code('tooLong')),
  name: z
    .string({ error: code('required') })
    .trim()
    .min(2, code('tooShort'))
    .max(140, code('tooLong')),
  logoUrl: optionalUrl,
  website: optionalUrl,
  telegram: optionalUrl,
  descriptionUz: z.string().trim().max(4000, code('tooLong')).optional(),
  descriptionRu: z.string().trim().max(4000, code('tooLong')).optional(),
  descriptionEn: z.string().trim().max(4000, code('tooLong')).optional(),
});

export const moderationSchema = z.object({
  hackathonId: z.uuid(code('invalid')),
  action: z.enum(['approve', 'reject']),
  rejectionReason: z
    .string()
    .trim()
    .max(500, code('tooLong'))
    .optional()
    .transform((value) => (value ? value : null)),
});

// ---------------------------------------------------------------------------
// Uploads (PRD 7.5 / 12)
// ---------------------------------------------------------------------------

export const UPLOAD_LIMITS = {
  coverMaxBytes: 2 * 1024 * 1024,
  avatarMaxBytes: 1 * 1024 * 1024,
  mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'] as const,
} as const;

export function isAllowedImage(file: { type: string; size: number }, maxBytes: number) {
  return (
    (UPLOAD_LIMITS.mimeTypes as readonly string[]).includes(file.type) && file.size <= maxBytes
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export type FieldErrors = Record<string, FieldErrorCode>;

/**
 * Collapses a ZodError into one code per field path — the UI only ever shows
 * one message per input, so keeping several would be dead weight.
 */
export function toFieldErrors(error: z.ZodError): FieldErrors {
  const result: FieldErrors = {};
  for (const issue of error.issues) {
    const path = issue.path.join('.') || 'form';
    if (!(path in result)) {
      const message = issue.message as FieldErrorCode;
      result[path] = (FIELD_ERROR_CODES as readonly string[]).includes(message)
        ? message
        : 'invalid';
    }
  }
  return result;
}

/** Slug from a hackathon name: "CBU Coding Hackathon 2026" -> "cbu-coding-hackathon-2026". */
export function slugify(value: string): string {
  const translit: Record<string, string> = {
    ʻ: '',
    ʼ: '',
    '‘': '',
    '’': '',
    "'": '',
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z',
    и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
    с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh',
    щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
    ў: 'o', қ: 'q', ғ: 'g', ҳ: 'h',
  };

  return value
    .toLowerCase()
    .split('')
    .map((char) => translit[char] ?? char)
    .join('')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90)
    .replace(/-+$/g, '');
}
