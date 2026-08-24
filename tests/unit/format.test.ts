import { describe, expect, it } from 'vitest';
import {
  formatDate,
  formatDateRange,
  formatDecimal,
  formatNumber,
  isUpcoming,
  parseDateOnly,
  relativeTimeParts,
  todayInTashkent,
} from '@/lib/format';

/**
 * These functions are deliberately NOT thin wrappers over Intl: Chromium ships
 * no Uzbek CLDR data, so anything Intl-formatted in `uz` renders differently in
 * the browser than on the server. See the comment at the top of lib/format.ts.
 */

describe('parseDateOnly', () => {
  it('parses a calendar date at UTC midnight, with no timezone drift', () => {
    const date = parseDateOnly('2026-03-18');
    expect(date?.toISOString()).toBe('2026-03-18T00:00:00.000Z');
  });

  it('returns null for junk', () => {
    expect(parseDateOnly(null)).toBeNull();
    expect(parseDateOnly('')).toBeNull();
    expect(parseDateOnly('18/03/2026')).toBeNull();
  });
});

describe('formatDate', () => {
  it('formats Uzbek from our own month table, not Intl', () => {
    expect(formatDate('2026-03-18', 'uz')).toBe('18-mar 2026');
    expect(formatDate('2026-03-18', 'uz', 'long')).toBe('18-mart 2026');
    expect(formatDate('2026-09-01', 'uz', 'long')).toBe('1-sentabr 2026');
  });

  it('formats Russian and English via Intl, which both engines agree on', () => {
    expect(formatDate('2026-03-18', 'ru')).toContain('2026');
    expect(formatDate('2026-03-18', 'en')).toBe('Mar 18, 2026');
  });

  it('never shifts the day across a timezone boundary', () => {
    // A naive `new Date('2026-01-01')` formatted in a western timezone would
    // render 31 December. All three locales must show the 1st.
    for (const locale of ['uz', 'ru', 'en'] as const) {
      expect(formatDate('2026-01-01', locale)).toMatch(/1|01/);
      expect(formatDate('2026-01-01', locale)).toContain('2026');
    }
  });

  it('returns null when there is no date', () => {
    expect(formatDate(null, 'uz')).toBeNull();
  });
});

describe('formatDateRange', () => {
  it('collapses a same-month Uzbek range', () => {
    expect(formatDateRange('2026-03-18', '2026-03-21', 'uz')).toBe('18–21-mart 2026');
  });

  it('spans months within a year', () => {
    expect(formatDateRange('2026-02-28', '2026-03-03', 'uz')).toBe('28-fev — 3-mar 2026');
  });

  it('spans years', () => {
    expect(formatDateRange('2025-12-28', '2026-01-03', 'uz')).toBe('28-dek 2025 — 3-yan 2026');
  });

  it('collapses identical dates to a single date', () => {
    expect(formatDateRange('2026-09-25', '2026-09-25', 'uz')).toBe('25-sen 2026');
  });

  it('falls back to whichever end is present', () => {
    expect(formatDateRange('2026-03-18', null, 'uz')).toBe('18-mar 2026');
    expect(formatDateRange(null, '2026-03-18', 'uz')).toBe('18-mar 2026');
    expect(formatDateRange(null, null, 'uz')).toBeNull();
  });

  it('produces a non-empty range for ru and en', () => {
    expect(formatDateRange('2026-03-18', '2026-03-21', 'ru')).toBeTruthy();
    expect(formatDateRange('2026-03-18', '2026-03-21', 'en')).toBeTruthy();
  });
});

describe('formatDecimal / formatNumber', () => {
  it('uses a comma for uz/ru and a point for en', () => {
    expect(formatDecimal(4.25, 'uz')).toBe('4,3');
    expect(formatDecimal(4.25, 'ru')).toBe('4,3');
    expect(formatDecimal(4.25, 'en')).toBe('4.3');
  });

  it('groups thousands per locale', () => {
    expect(formatNumber(1234567, 'en')).toBe('1,234,567');
    // U+00A0 NO-BREAK SPACE, as CLDR specifies for uz and ru.
    expect(formatNumber(1234567, 'uz')).toBe('1\u00A0234\u00A0567');
    expect(formatNumber(1234567, 'ru')).toBe('1\u00A0234\u00A0567');
    expect(formatNumber(21, 'uz')).toBe('21');
    expect(formatNumber(0, 'en')).toBe('0');
  });
});

describe('relativeTimeParts', () => {
  const now = new Date('2026-08-25T12:00:00.000Z');

  it('picks the largest fitting unit', () => {
    expect(relativeTimeParts('2026-08-25T11:59:30.000Z', now)).toEqual({ key: 'justNow', count: 0 });
    expect(relativeTimeParts('2026-08-25T11:57:00.000Z', now)).toEqual({ key: 'minutesAgo', count: 3 });
    expect(relativeTimeParts('2026-08-25T09:00:00.000Z', now)).toEqual({ key: 'hoursAgo', count: 3 });
    expect(relativeTimeParts('2026-08-22T12:00:00.000Z', now)).toEqual({ key: 'daysAgo', count: 3 });
    expect(relativeTimeParts('2026-05-25T12:00:00.000Z', now)).toEqual({ key: 'monthsAgo', count: 3 });
    expect(relativeTimeParts('2023-08-25T12:00:00.000Z', now)).toEqual({ key: 'yearsAgo', count: 3 });
  });

  it('clamps future timestamps to "just now" rather than showing a negative', () => {
    expect(relativeTimeParts('2027-01-01T00:00:00.000Z', now)).toEqual({ key: 'justNow', count: 0 });
  });

  it('returns null for missing or unparseable input', () => {
    expect(relativeTimeParts(null, now)).toBeNull();
    expect(relativeTimeParts('nonsense', now)).toBeNull();
  });
});

describe('todayInTashkent / isUpcoming', () => {
  it('rolls over at Tashkent midnight, not UTC midnight', () => {
    // 19:30 UTC is already the next day in Asia/Tashkent (UTC+5).
    expect(todayInTashkent(new Date('2026-08-25T19:30:00.000Z'))).toBe('2026-08-26');
    expect(todayInTashkent(new Date('2026-08-25T18:00:00.000Z'))).toBe('2026-08-25');
  });

  it('treats an event ending today as still upcoming', () => {
    expect(isUpcoming('2026-08-25', '2026-08-25')).toBe(true);
    expect(isUpcoming('2026-08-26', '2026-08-25')).toBe(true);
    expect(isUpcoming('2026-08-24', '2026-08-25')).toBe(false);
  });

  it('treats a dateless event as not upcoming, so it never fills the rail', () => {
    expect(isUpcoming(null, '2026-08-25')).toBe(false);
  });
});
