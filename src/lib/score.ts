/**
 * The score language of the whole site.
 *
 * PRD 9.2: "score >= 4 green, 3–3.9 amber, < 3 red — used consistently in every
 * score chip, bar, and number across the site." That rule is implemented once,
 * here, and nowhere else. Every visual that carries a rating derives its colour
 * from `scoreBand()`.
 */

export const SCORE_CATEGORIES = [
  'organization',
  'communication',
  'judging',
  'prizes',
  'venue',
] as const;

export type ScoreCategory = (typeof SCORE_CATEGORIES)[number];

export const MIN_RATING = 1;
export const MAX_RATING = 5;

/** Reviews below this count don't qualify for the top/bottom rails (PRD 7.1). */
export const MIN_REVIEWS_FOR_RANKING = 3;

export type ScoreBand = 'good' | 'mid' | 'bad' | 'none';

export type CategoryRatings = Record<ScoreCategory, number>;

/**
 * PostgREST can hand back `numeric` columns as either a JSON number or a
 * string depending on version and column type, and aggregates over an empty
 * set come back as `null`. Normalise once, at the edge.
 */
export function toScore(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === '') return null;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function scoreBand(value: number | string | null | undefined): ScoreBand {
  const score = toScore(value);
  if (score === null) return 'none';
  if (score >= 4) return 'good';
  if (score >= 3) return 'mid';
  return 'bad';
}

/**
 * Tailwind class tokens per band. Written as complete literal class names so
 * Tailwind's source scanner can see them — never build these by interpolation.
 */
export const BAND_CLASSES: Record<
  ScoreBand,
  { text: string; tint: string; fill: string; border: string; dot: string }
> = {
  good: {
    text: 'text-good',
    tint: 'bg-good-soft',
    fill: 'bg-good',
    border: 'border-good',
    dot: 'bg-good',
  },
  mid: {
    text: 'text-mid',
    tint: 'bg-mid-soft',
    fill: 'bg-mid',
    border: 'border-mid',
    dot: 'bg-mid',
  },
  bad: {
    text: 'text-bad',
    tint: 'bg-bad-soft',
    fill: 'bg-bad',
    border: 'border-bad',
    dot: 'bg-bad',
  },
  none: {
    text: 'text-none',
    tint: 'bg-none-soft',
    fill: 'bg-none',
    border: 'border-none',
    dot: 'bg-none',
  },
};

/** Width of a score bar, as a 0–100 percentage of the 5-point scale. */
export function scorePercent(value: number | string | null | undefined): number {
  const score = toScore(value);
  if (score === null) return 0;
  return Math.max(0, Math.min(100, (score / MAX_RATING) * 100));
}

/** The overall score of a single review: the mean of its five categories. */
export function computeOverall(ratings: CategoryRatings): number {
  const sum = SCORE_CATEGORIES.reduce((total, category) => total + ratings[category], 0);
  return sum / SCORE_CATEGORIES.length;
}

/** Mean of a list, ignoring nulls. Returns null for an empty/all-null list. */
export function average(values: Array<number | string | null | undefined>): number | null {
  const numbers = values.map(toScore).filter((value): value is number => value !== null);
  if (numbers.length === 0) return null;
  return numbers.reduce((total, value) => total + value, 0) / numbers.length;
}

/** Round half-up to `decimals` places, matching Postgres `round(numeric, n)`. */
export function roundScore(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  // `Math.round` is half-up for positives, and scores are never negative.
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

/**
 * Locale-aware score string, always with one decimal so scores line up in a
 * column: "4.2" in en/uz, "4,2" in ru.
 */
export function formatScore(
  value: number | string | null | undefined,
  locale: string,
  fallback = '—',
): string {
  const score = toScore(value);
  if (score === null) return fallback;
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(score);
}

/**
 * Which category drags a hackathon down, and which one carries it. Powers the
 * "best / weakest" chips on catalog cards (PRD 7.2). Returns null when there
 * is nothing to compare.
 */
export function categoryExtremes(
  averages: Partial<Record<ScoreCategory, number | string | null>>,
): { best: ScoreCategory; worst: ScoreCategory } | null {
  const entries = SCORE_CATEGORIES.map((category) => [category, toScore(averages[category])] as const)
    .filter((entry): entry is readonly [ScoreCategory, number] => entry[1] !== null);

  if (entries.length < 2) return null;

  let best = entries[0]!;
  let worst = entries[0]!;
  for (const entry of entries) {
    if (entry[1] > best[1]) best = entry;
    if (entry[1] < worst[1]) worst = entry;
  }

  // All five identical: there is no meaningful "best" or "weakest" to show.
  if (best[1] === worst[1]) return null;

  return { best: best[0], worst: worst[0] };
}

/** Star fill fractions for a 5-star row: [1, 1, 0.4, 0, 0] for a 2.4. */
export function starFractions(value: number | string | null | undefined): number[] {
  const score = toScore(value) ?? 0;
  return Array.from({ length: MAX_RATING }, (_, index) =>
    Math.max(0, Math.min(1, score - index)),
  );
}

export function isValidRating(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= MIN_RATING &&
    value <= MAX_RATING
  );
}
