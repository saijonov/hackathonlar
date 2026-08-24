import { LOCALE_HTML_LANG, type AppLocale } from '@/i18n/routing';

/**
 * Date and number formatting.
 *
 * WHY THIS DOES NOT JUST CALL `Intl` FOR EVERYTHING
 * -------------------------------------------------
 * Chromium ships **no Uzbek CLDR data**. Measured, both engines asked for the
 * same `uz` tag:
 *
 *              Node (full ICU)      Chromium
 *   number     "3,6"                "3.6"
 *   date       "18-mar, 2026"       "2026 M03 18"
 *   relative   "3 kun oldin"        "-3 d"
 *
 * So anything formatted with `Intl` in Uzbek renders correctly during SSR and
 * then either hydration-mismatches or degrades into "2026 M03 18" in the
 * browser — for the locale that is our *default* and the majority of traffic.
 *
 * Everything below is therefore deterministic:
 *   - Uzbek dates and all numbers are formatted from explicit tables here.
 *   - `Intl` is used only for ru/en dates, which both engines support
 *     identically (verified).
 *   - Relative time doesn't touch `Intl` at all; it returns a message key that
 *     next-intl renders from our own catalogue, so all three locales are
 *     correct and pluralised properly.
 *
 * Two further rules:
 *   1. `date` columns are calendar days, not instants. They are formatted in
 *      UTC so "2026-03-18" never slides a day either way.
 *   2. `timestamptz` columns are instants, formatted in Asia/Tashkent.
 */

export const SITE_TIME_ZONE = 'Asia/Tashkent';

/** Uzbek Latin month names (modern orthography: sentabr, oktabr). */
const UZ_MONTHS_LONG = [
  'yanvar',
  'fevral',
  'mart',
  'aprel',
  'may',
  'iyun',
  'iyul',
  'avgust',
  'sentabr',
  'oktabr',
  'noyabr',
  'dekabr',
] as const;

const UZ_MONTHS_SHORT = [
  'yan',
  'fev',
  'mar',
  'apr',
  'may',
  'iyn',
  'iyl',
  'avg',
  'sen',
  'okt',
  'noy',
  'dek',
] as const;

/** Decimal separator per locale. Uzbek and Russian use a comma. */
const DECIMAL_SEPARATOR: Record<AppLocale, string> = { uz: ',', ru: ',', en: '.' };
/** Thousands separator. CLDR uses U+00A0 NO-BREAK SPACE for uz and ru — written
 *  as an escape so it is visible in source and cannot be mangled by an editor. */
const GROUP_SEPARATOR: Record<AppLocale, string> = { uz: '\u00A0', ru: '\u00A0', en: ',' };

function intlLocale(locale: AppLocale): string {
  return LOCALE_HTML_LANG[locale] ?? locale;
}

/** Parses a `YYYY-MM-DD` calendar date into a UTC-midnight Date. */
export function parseDateOnly(value: string | null | undefined): Date | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return null;
  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  return Number.isNaN(date.getTime()) ? null : date;
}

// ---------------------------------------------------------------------------
// Numbers
// ---------------------------------------------------------------------------

/** Integer with locale-correct grouping. Deterministic across engines. */
export function formatNumber(value: number, locale: AppLocale): string {
  const rounded = Math.round(value);
  const sign = rounded < 0 ? '-' : '';
  const digits = Math.abs(rounded).toString();
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, GROUP_SEPARATOR[locale]);
  return `${sign}${grouped}`;
}

/**
 * A 1-decimal score: "4.2" in English, "4,2" in Uzbek and Russian.
 * Always exactly one decimal place so scores line up in a column.
 */
export function formatDecimal(value: number, locale: AppLocale, fractionDigits = 1): string {
  return value.toFixed(fractionDigits).replace('.', DECIMAL_SEPARATOR[locale]);
}

// ---------------------------------------------------------------------------
// Dates
// ---------------------------------------------------------------------------

function formatUzbekDate(date: Date, style: 'short' | 'long'): string {
  const day = date.getUTCDate();
  const month = (style === 'long' ? UZ_MONTHS_LONG : UZ_MONTHS_SHORT)[date.getUTCMonth()];
  return `${day}-${month} ${date.getUTCFullYear()}`;
}

export function formatDate(
  value: string | null | undefined,
  locale: AppLocale,
  style: 'short' | 'long' = 'short',
): string | null {
  const date = parseDateOnly(value);
  if (!date) return null;
  if (locale === 'uz') return formatUzbekDate(date, style);

  return new Intl.DateTimeFormat(intlLocale(locale), {
    day: 'numeric',
    month: style === 'long' ? 'long' : 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

function formatUzbekRange(start: Date, end: Date): string {
  const sameYear = start.getUTCFullYear() === end.getUTCFullYear();
  const sameMonth = sameYear && start.getUTCMonth() === end.getUTCMonth();

  if (sameMonth) {
    // "18–21-mart 2026"
    return `${start.getUTCDate()}–${end.getUTCDate()}-${UZ_MONTHS_LONG[end.getUTCMonth()]} ${end.getUTCFullYear()}`;
  }
  if (sameYear) {
    // "28-fev — 3-mar 2026"
    return `${start.getUTCDate()}-${UZ_MONTHS_SHORT[start.getUTCMonth()]} — ${end.getUTCDate()}-${UZ_MONTHS_SHORT[end.getUTCMonth()]} ${end.getUTCFullYear()}`;
  }
  return `${formatUzbekDate(start, 'short')} — ${formatUzbekDate(end, 'short')}`;
}

export function formatDateRange(
  start: string | null | undefined,
  end: string | null | undefined,
  locale: AppLocale,
): string | null {
  const startDate = parseDateOnly(start);
  const endDate = parseDateOnly(end);

  if (!startDate && !endDate) return null;
  if (!startDate) return formatDate(end, locale);
  if (!endDate) return formatDate(start, locale);
  if (startDate.getTime() === endDate.getTime()) return formatDate(start, locale);

  if (locale === 'uz') return formatUzbekRange(startDate, endDate);

  // `formatRange` already knows every per-locale elision rule for ru and en.
  return new Intl.DateTimeFormat(intlLocale(locale), {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).formatRange(startDate, endDate);
}

// ---------------------------------------------------------------------------
// Relative time
// ---------------------------------------------------------------------------

export type RelativeTimeKey =
  | 'justNow'
  | 'minutesAgo'
  | 'hoursAgo'
  | 'daysAgo'
  | 'monthsAgo'
  | 'yearsAgo';

export interface RelativeTimeParts {
  key: RelativeTimeKey;
  count: number;
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

/**
 * Splits an instant into a message key + count so next-intl can render it from
 * our own catalogue — correct Uzbek, correct Russian plurals, no ICU
 * dependency in the browser. `now` is injectable so tests are deterministic.
 */
export function relativeTimeParts(
  value: string | Date | null | undefined,
  now: Date = new Date(),
): RelativeTimeParts | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  // Future timestamps are clamped: nothing on this site happens later than now.
  const elapsed = Math.max(0, now.getTime() - date.getTime());

  if (elapsed >= YEAR) return { key: 'yearsAgo', count: Math.floor(elapsed / YEAR) };
  if (elapsed >= MONTH) return { key: 'monthsAgo', count: Math.floor(elapsed / MONTH) };
  if (elapsed >= DAY) return { key: 'daysAgo', count: Math.floor(elapsed / DAY) };
  if (elapsed >= HOUR) return { key: 'hoursAgo', count: Math.floor(elapsed / HOUR) };
  if (elapsed >= MINUTE) return { key: 'minutesAgo', count: Math.floor(elapsed / MINUTE) };
  return { key: 'justNow', count: 0 };
}

// ---------------------------------------------------------------------------
// "Today" in the audience's timezone
// ---------------------------------------------------------------------------

/**
 * Today in Asia/Tashkent as `YYYY-MM-DD` — the reference point for the
 * Upcoming / Past split, so the tabs flip at local midnight, not UTC.
 * `en-CA` is used purely because it yields ISO order and is supported
 * identically everywhere.
 */
export function todayInTashkent(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: SITE_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

export function isUpcoming(
  effectiveEndDate: string | null | undefined,
  today: string = todayInTashkent(),
): boolean {
  if (!effectiveEndDate) return false;
  return effectiveEndDate >= today;
}
