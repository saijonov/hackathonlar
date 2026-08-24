import { describe, expect, it } from 'vitest';
import {
  REVIEW_LIMITS,
  hackathonSubmissionSchema,
  profileSchema,
  reportSchema,
  reviewSchema,
  slugify,
  toFieldErrors,
  isAllowedImage,
  UPLOAD_LIMITS,
} from '@/lib/validation/schemas';

/** PRD 15.2: "review validation (zod schemas, min lengths, 1–5 bounds)". */

const validReview = {
  hackathonId: '11111111-1111-4111-8111-111111111111',
  ratings: { organization: 5, communication: 4, judging: 4, prizes: 5, venue: 5 },
  title: 'Jadval aniq, sovrin oʼz vaqtida',
  body: 'a'.repeat(REVIEW_LIMITS.bodyMin),
  isAnonymous: false,
  participatedAs: 'finalist',
};

describe('reviewSchema', () => {
  it('accepts a well-formed review', () => {
    expect(reviewSchema.safeParse(validReview).success).toBe(true);
  });

  it('enforces the 50-character body minimum that forces substance', () => {
    const short = reviewSchema.safeParse({
      ...validReview,
      body: 'a'.repeat(REVIEW_LIMITS.bodyMin - 1),
    });
    expect(short.success).toBe(false);
    if (!short.success) expect(toFieldErrors(short.error).body).toBe('tooShort');

    expect(
      reviewSchema.safeParse({ ...validReview, body: 'a'.repeat(REVIEW_LIMITS.bodyMin) }).success,
    ).toBe(true);
  });

  it('rejects a body over the 3000-character database limit', () => {
    const long = reviewSchema.safeParse({
      ...validReview,
      body: 'a'.repeat(REVIEW_LIMITS.bodyMax + 1),
    });
    expect(long.success).toBe(false);
    if (!long.success) expect(toFieldErrors(long.error).body).toBe('tooLong');
  });

  it('enforces the title bounds', () => {
    expect(reviewSchema.safeParse({ ...validReview, title: 'abcd' }).success).toBe(false);
    expect(reviewSchema.safeParse({ ...validReview, title: 'abcde' }).success).toBe(true);
    expect(
      reviewSchema.safeParse({ ...validReview, title: 'a'.repeat(REVIEW_LIMITS.titleMax + 1) })
        .success,
    ).toBe(false);
  });

  it('requires all five categories', () => {
    const { communication: _dropped, ...incomplete } = validReview.ratings;
    const result = reviewSchema.safeParse({ ...validReview, ratings: incomplete });
    expect(result.success).toBe(false);
    if (!result.success) expect(toFieldErrors(result.error)['ratings.communication']).toBeDefined();
  });

  it('bounds every rating to 1–5 integers', () => {
    for (const bad of [0, 6, -1, 3.5]) {
      const result = reviewSchema.safeParse({
        ...validReview,
        ratings: { ...validReview.ratings, judging: bad },
      });
      expect(result.success, `rating ${bad} should be rejected`).toBe(false);
    }
    for (const good of [1, 2, 3, 4, 5]) {
      expect(
        reviewSchema.safeParse({
          ...validReview,
          ratings: { ...validReview.ratings, judging: good },
        }).success,
      ).toBe(true);
    }
  });

  it('normalises blank pros/cons to null rather than empty strings', () => {
    const result = reviewSchema.safeParse({ ...validReview, pros: '   ', cons: '' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.pros).toBeNull();
      expect(result.data.cons).toBeNull();
    }
  });

  it('rejects an unknown participation role', () => {
    expect(reviewSchema.safeParse({ ...validReview, participatedAs: 'ceo' }).success).toBe(false);
  });

  it('rejects a non-uuid hackathon id', () => {
    expect(reviewSchema.safeParse({ ...validReview, hackathonId: 'nope' }).success).toBe(false);
  });
});

describe('reportSchema', () => {
  it('requires a reason of at least 3 characters', () => {
    const id = '11111111-1111-4111-8111-111111111111';
    expect(reportSchema.safeParse({ reviewId: id, reason: 'ab' }).success).toBe(false);
    expect(reportSchema.safeParse({ reviewId: id, reason: 'spam' }).success).toBe(true);
  });
});

describe('hackathonSubmissionSchema', () => {
  const base = {
    name: 'CBU Coding Hackathon 2026',
    organizerId: '11111111-1111-4111-8111-111111111111',
    format: 'offline',
    descriptionLocale: 'uz',
    description: 'a'.repeat(60),
    tracks: [],
  };

  it('accepts a minimal valid submission', () => {
    expect(hackathonSubmissionSchema.safeParse(base).success).toBe(true);
  });

  it('rejects an end date before the start date', () => {
    const result = hackathonSubmissionSchema.safeParse({
      ...base,
      startDate: '2026-03-20',
      endDate: '2026-03-18',
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(toFieldErrors(result.error).endDate).toBe('dateOrder');
  });

  it('accepts equal start and end dates (a one-day event)', () => {
    expect(
      hackathonSubmissionSchema.safeParse({
        ...base,
        startDate: '2026-03-20',
        endDate: '2026-03-20',
      }).success,
    ).toBe(true);
  });

  it('mirrors the database CHECK: an online event cannot have a city', () => {
    const result = hackathonSubmissionSchema.safeParse({
      ...base,
      format: 'online',
      city: 'Tashkent',
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(toFieldErrors(result.error).city).toBe('cityWithOnline');

    expect(hackathonSubmissionSchema.safeParse({ ...base, format: 'online' }).success).toBe(true);
  });

  it('requires either an existing organizer or a new organizer name', () => {
    const neither = hackathonSubmissionSchema.safeParse({ ...base, organizerId: '' });
    expect(neither.success).toBe(false);
    if (!neither.success) expect(toFieldErrors(neither.error).organizerId).toBe('required');

    expect(
      hackathonSubmissionSchema.safeParse({
        ...base,
        organizerId: '',
        newOrganizerName: 'IT Park Uzbekistan',
      }).success,
    ).toBe(true);
  });

  it('rejects malformed URLs but accepts blanks', () => {
    expect(hackathonSubmissionSchema.safeParse({ ...base, website: 'not a url' }).success).toBe(
      false,
    );
    expect(hackathonSubmissionSchema.safeParse({ ...base, website: '' }).success).toBe(true);
    expect(
      hackathonSubmissionSchema.safeParse({ ...base, website: 'https://it-park.uz' }).success,
    ).toBe(true);
  });

  it('requires a description of at least 40 characters', () => {
    expect(hackathonSubmissionSchema.safeParse({ ...base, description: 'short' }).success).toBe(
      false,
    );
  });
});

describe('profileSchema', () => {
  it('bounds the display name to 2–60 characters', () => {
    expect(profileSchema.safeParse({ displayName: 'A' }).success).toBe(false);
    expect(profileSchema.safeParse({ displayName: 'Ali' }).success).toBe(true);
    expect(profileSchema.safeParse({ displayName: 'a'.repeat(61) }).success).toBe(false);
  });
});

describe('isAllowedImage', () => {
  it('accepts the allowed types within the size limit', () => {
    expect(isAllowedImage({ type: 'image/png', size: 1000 }, UPLOAD_LIMITS.coverMaxBytes)).toBe(
      true,
    );
    expect(isAllowedImage({ type: 'image/webp', size: 1000 }, UPLOAD_LIMITS.coverMaxBytes)).toBe(
      true,
    );
  });

  it('rejects the wrong mime type or an oversized file', () => {
    expect(isAllowedImage({ type: 'image/gif', size: 1000 }, UPLOAD_LIMITS.coverMaxBytes)).toBe(
      false,
    );
    expect(
      isAllowedImage({ type: 'application/pdf', size: 10 }, UPLOAD_LIMITS.coverMaxBytes),
    ).toBe(false);
    expect(
      isAllowedImage(
        { type: 'image/png', size: UPLOAD_LIMITS.coverMaxBytes + 1 },
        UPLOAD_LIMITS.coverMaxBytes,
      ),
    ).toBe(false);
  });
});

describe('slugify', () => {
  it('produces a slug the database CHECK constraint accepts', () => {
    const pattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    for (const input of [
      'CBU Coding Hackathon 2026',
      'Urban.Tech Uzbekistan 2024 Hackathon',
      "Kod va g'oyalar jangi",
      'Ecology, Art & Technology Hackathon',
      'Хакатон Самарканд 2025',
      'National AI Hackathon — Nukus Stage',
    ]) {
      const slug = slugify(input);
      expect(slug, `"${input}" -> "${slug}"`).toMatch(pattern);
    }
  });

  it('transliterates Cyrillic and strips the tutuq belgisi', () => {
    expect(slugify('Хакатон Самарканд')).toBe('hakaton-samarkand');
    expect(slugify('Kod va g‘oyalar')).toBe('kod-va-goyalar');
    expect(slugify('Boʻlajak')).toBe('bolajak');
  });

  it('collapses punctuation and trims separators', () => {
    expect(slugify('  Hello --- World!!  ')).toBe('hello-world');
    expect(slugify('Urban.Tech 2024')).toBe('urban-tech-2024');
  });

  it('never ends with a separator, even when truncated at the limit', () => {
    const slug = slugify(`${'word '.repeat(40)}`);
    expect(slug.endsWith('-')).toBe(false);
    expect(slug.length).toBeLessThanOrEqual(90);
  });
});
