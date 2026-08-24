import { describe, expect, it } from 'vitest';
import {
  BAND_CLASSES,
  MAX_RATING,
  MIN_RATING,
  average,
  categoryExtremes,
  computeOverall,
  formatScore,
  isValidRating,
  roundScore,
  scoreBand,
  scorePercent,
  starFractions,
  toScore,
} from '@/lib/score';

/**
 * PRD 15.2: "rating aggregation math".
 *
 * The band boundaries are the most consequential numbers on the site — they
 * decide whether a hackathon is rendered green, amber or red — so they are
 * tested exactly at the edges, not just in the middle of each range.
 */
describe('scoreBand', () => {
  it('places scores in the documented bands', () => {
    expect(scoreBand(5)).toBe('good');
    expect(scoreBand(4.5)).toBe('good');
    expect(scoreBand(3.9)).toBe('mid');
    expect(scoreBand(3)).toBe('mid');
    expect(scoreBand(2.99)).toBe('bad');
    expect(scoreBand(1)).toBe('bad');
  });

  it('treats the band boundaries as inclusive lower bounds', () => {
    // 4.0 is good, not mid. 3.0 is mid, not bad. Off-by-one here would
    // mis-colour every score sitting exactly on a boundary.
    expect(scoreBand(4.0)).toBe('good');
    expect(scoreBand(3.9999)).toBe('mid');
    expect(scoreBand(3.0)).toBe('mid');
    expect(scoreBand(2.9999)).toBe('bad');
  });

  it('returns "none" for anything that is not a number', () => {
    expect(scoreBand(null)).toBe('none');
    expect(scoreBand(undefined)).toBe('none');
    expect(scoreBand('')).toBe('none');
    expect(scoreBand('not-a-number')).toBe('none');
    expect(scoreBand(Number.NaN)).toBe('none');
  });

  it('accepts the string numerics PostgREST can return for numeric columns', () => {
    expect(scoreBand('4.30')).toBe('good');
    expect(scoreBand('2.27')).toBe('bad');
  });

  it('has a class token set for every band', () => {
    for (const band of ['good', 'mid', 'bad', 'none'] as const) {
      expect(BAND_CLASSES[band].text).toMatch(/^text-/);
      expect(BAND_CLASSES[band].tint).toMatch(/^bg-/);
      expect(BAND_CLASSES[band].fill).toMatch(/^bg-/);
    }
  });
});

describe('toScore', () => {
  it('normalises numbers, numeric strings, null and rubbish', () => {
    expect(toScore(4.2)).toBe(4.2);
    expect(toScore('4.2')).toBe(4.2);
    expect(toScore(0)).toBe(0);
    expect(toScore(null)).toBeNull();
    expect(toScore(undefined)).toBeNull();
    expect(toScore('')).toBeNull();
    expect(toScore('abc')).toBeNull();
    expect(toScore(Number.POSITIVE_INFINITY)).toBeNull();
  });
});

describe('computeOverall', () => {
  it('is the mean of the five categories', () => {
    expect(
      computeOverall({ organization: 5, communication: 4, judging: 4, prizes: 5, venue: 5 }),
    ).toBeCloseTo(4.6, 10);
  });

  it('matches the values the database generates for the seeded reviews', () => {
    // These are the exact ratings of the three Urban.Tech demo reviews, whose
    // stored `overall` column reads 2.2, 1.8 and 2.8 — the JS and the SQL
    // generated column must never drift apart.
    expect(
      computeOverall({ organization: 3, communication: 1, judging: 2, prizes: 2, venue: 3 }),
    ).toBeCloseTo(2.2, 10);
    expect(
      computeOverall({ organization: 2, communication: 1, judging: 2, prizes: 1, venue: 3 }),
    ).toBeCloseTo(1.8, 10);
    expect(
      computeOverall({ organization: 3, communication: 2, judging: 3, prizes: 2, venue: 4 }),
    ).toBeCloseTo(2.8, 10);
  });

  it('returns the rating itself when all five agree', () => {
    expect(
      computeOverall({ organization: 3, communication: 3, judging: 3, prizes: 3, venue: 3 }),
    ).toBe(3);
  });
});

describe('average', () => {
  it('averages the seeded Urban.Tech overalls to the value the view reports', () => {
    // hackathon_stats reports 2.27 for urban-tech-uzbekistan-2024-hackathon.
    expect(roundScore(average([2.2, 1.8, 2.8]) ?? 0, 2)).toBe(2.27);
  });

  it('ignores nulls rather than counting them as zero', () => {
    expect(average([4, null, 2])).toBe(3);
    expect(average([null, undefined])).toBeNull();
    expect(average([])).toBeNull();
  });
});

describe('roundScore', () => {
  it('rounds half up, matching Postgres round(numeric, n)', () => {
    expect(roundScore(2.265, 2)).toBe(2.27);
    expect(roundScore(4.005, 2)).toBe(4.01);
    expect(roundScore(3.3333, 2)).toBe(3.33);
    expect(roundScore(3.6, 1)).toBe(3.6);
  });
});

describe('scorePercent', () => {
  it('maps the 1–5 scale onto 0–100', () => {
    expect(scorePercent(5)).toBe(100);
    expect(scorePercent(2.5)).toBe(50);
    expect(scorePercent(1)).toBe(20);
    expect(scorePercent(null)).toBe(0);
  });

  it('clamps out-of-range values instead of overflowing the bar', () => {
    expect(scorePercent(9)).toBe(100);
    expect(scorePercent(-3)).toBe(0);
  });
});

describe('starFractions', () => {
  it('produces one fraction per star', () => {
    expect(starFractions(5)).toHaveLength(MAX_RATING);
  });

  it('fills whole stars then a partial one', () => {
    expect(starFractions(2.4)).toEqual([1, 1, expect.closeTo(0.4, 10), 0, 0]);
    expect(starFractions(5)).toEqual([1, 1, 1, 1, 1]);
    expect(starFractions(0)).toEqual([0, 0, 0, 0, 0]);
    expect(starFractions(null)).toEqual([0, 0, 0, 0, 0]);
  });
});

describe('categoryExtremes', () => {
  it('finds the strongest and weakest category', () => {
    expect(
      categoryExtremes({
        organization: 3,
        communication: 1.33,
        judging: 2.33,
        prizes: 1.67,
        venue: 3.33,
      }),
    ).toEqual({ best: 'venue', worst: 'communication' });
  });

  it('returns null when every category is identical — there is no story to tell', () => {
    expect(
      categoryExtremes({
        organization: 4,
        communication: 4,
        judging: 4,
        prizes: 4,
        venue: 4,
      }),
    ).toBeNull();
  });

  it('returns null when fewer than two categories have data', () => {
    expect(categoryExtremes({ organization: 4 })).toBeNull();
    expect(categoryExtremes({})).toBeNull();
  });
});

describe('formatScore', () => {
  it('always shows exactly one decimal so score columns align', () => {
    expect(formatScore(4, 'en')).toBe('4.0');
    expect(formatScore(4.25, 'en')).toBe('4.3');
  });

  it('uses a comma in Uzbek and Russian, a point in English', () => {
    expect(formatScore(3.6, 'uz')).toBe('3,6');
    expect(formatScore(3.6, 'ru')).toBe('3,6');
    expect(formatScore(3.6, 'en')).toBe('3.6');
  });

  it('falls back to an em dash when there is no score', () => {
    expect(formatScore(null, 'uz')).toBe('—');
    expect(formatScore(undefined, 'en', 'n/a')).toBe('n/a');
  });
});

describe('isValidRating', () => {
  it('accepts only integers within 1–5', () => {
    for (let value = MIN_RATING; value <= MAX_RATING; value += 1) {
      expect(isValidRating(value)).toBe(true);
    }
    expect(isValidRating(0)).toBe(false);
    expect(isValidRating(6)).toBe(false);
    expect(isValidRating(3.5)).toBe(false);
    expect(isValidRating('4')).toBe(false);
    expect(isValidRating(null)).toBe(false);
  });
});
