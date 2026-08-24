import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { parse, TYPE, type MessageFormatElement } from '@formatjs/icu-messageformat-parser';
import IntlMessageFormat from 'intl-messageformat';
import { describe, expect, it } from 'vitest';

/**
 * PRD 10: "All UI strings via next-intl; zero hardcoded strings in components"
 * and "Russian and English full parity".
 *
 * A missing key is invisible in development (next-intl falls back to the key
 * name) but very visible to a Russian reader in production, so parity is
 * asserted mechanically rather than trusted.
 */

const MESSAGES_DIR = join(process.cwd(), 'src/messages');
const LOCALES = ['uz', 'ru', 'en'] as const;

function load(locale: string): Record<string, unknown> {
  return JSON.parse(readFileSync(join(MESSAGES_DIR, `${locale}.json`), 'utf8'));
}

function leaves(value: Record<string, unknown>, prefix = ''): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, child] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (child && typeof child === 'object' && !Array.isArray(child)) {
      Object.assign(out, leaves(child as Record<string, unknown>, path));
    } else {
      out[path] = child as string;
    }
  }
  return out;
}

/** Real ICU argument names, walked from the AST — a regex would mistake the
 *  first word inside a plural branch for a placeholder. */
function argumentNames(ast: MessageFormatElement[], out = new Set<string>()): Set<string> {
  for (const node of ast) {
    if (
      node.type === TYPE.argument ||
      node.type === TYPE.number ||
      node.type === TYPE.date ||
      node.type === TYPE.time ||
      node.type === TYPE.select ||
      node.type === TYPE.plural
    ) {
      out.add(node.value);
    }
    if ('options' in node && node.options) {
      for (const option of Object.values(node.options)) argumentNames(option.value, out);
    }
    if ('children' in node && node.children) argumentNames(node.children, out);
  }
  return out;
}

const catalogues = Object.fromEntries(LOCALES.map((locale) => [locale, leaves(load(locale))])) as
  Record<(typeof LOCALES)[number], Record<string, string>>;

describe('message catalogues', () => {
  it('ships exactly the three configured locales', () => {
    const files = readdirSync(MESSAGES_DIR).filter((file) => file.endsWith('.json')).sort();
    expect(files).toEqual(['en.json', 'ru.json', 'uz.json']);
  });

  it('has identical keys in every locale', () => {
    const base = Object.keys(catalogues.uz).sort();
    expect(base.length).toBeGreaterThan(400);

    for (const locale of ['ru', 'en'] as const) {
      expect(Object.keys(catalogues[locale]).sort(), `${locale} key set`).toEqual(base);
    }
  });

  it('has no empty strings', () => {
    for (const locale of LOCALES) {
      for (const [key, value] of Object.entries(catalogues[locale])) {
        expect(typeof value, `${locale}.${key}`).toBe('string');
        expect(value.trim().length, `${locale}.${key} is empty`).toBeGreaterThan(0);
      }
    }
  });

  it('parses as valid ICU in every locale', () => {
    for (const locale of LOCALES) {
      for (const [key, value] of Object.entries(catalogues[locale])) {
        expect(() => parse(value), `${locale}.${key}`).not.toThrow();
      }
    }
  });

  it('keeps the same ICU arguments across locales', () => {
    for (const [key, source] of Object.entries(catalogues.uz)) {
      const expected = [...argumentNames(parse(source))].sort();
      for (const locale of ['ru', 'en'] as const) {
        const actual = [...argumentNames(parse(catalogues[locale][key]!))].sort();
        expect(actual, `${locale}.${key}`).toEqual(expected);
      }
    }
  });

  it('renders every message without throwing', () => {
    const sample = {
      count: 2,
      score: '4.2',
      name: 'CBU Coding Hackathon 2026',
      organizer: 'IT Park',
      email: 'a@b.c',
      min: 50,
      seconds: 30,
      current: 1,
      total: 3,
      start: 'a',
      end: 'b',
      language: 'uz',
    };

    for (const locale of LOCALES) {
      for (const [key, value] of Object.entries(catalogues[locale])) {
        expect(() => new IntlMessageFormat(value, locale).format(sample), `${locale}.${key}`).not.toThrow();
      }
    }
  });

  it('uses the full Russian plural set wherever Uzbek uses a plural', () => {
    // Russian needs one/few/many; shipping only `other` would read as
    // "5 отзыва" to every Russian speaker on the site.
    for (const [key, source] of Object.entries(catalogues.uz)) {
      if (!source.includes('plural,')) continue;

      const russian = catalogues.ru[key]!;
      for (const category of ['one', 'few', 'many', 'other']) {
        expect(russian, `ru.${key} missing "${category}"`).toContain(`${category} {`);
      }
      const english = catalogues.en[key]!;
      for (const category of ['one', 'other']) {
        expect(english, `en.${key} missing "${category}"`).toContain(`${category} {`);
      }
    }
  });

  it('renders Russian plurals with the correct form at 1, 2, 5, 11 and 21', () => {
    const message = catalogues.ru['score.reviewCount']!;
    const render = (count: number) => new IntlMessageFormat(message, 'ru').format({ count });

    expect(render(1)).toBe('1 отзыв');
    expect(render(2)).toBe('2 отзыва');
    expect(render(5)).toBe('5 отзывов');
    expect(render(11)).toBe('11 отзывов');
    expect(render(21)).toBe('21 отзыв');
  });

  it('keeps the contractual anonymity labels exact', () => {
    // These mirror the label the database applies in public_reviews; the UI
    // swaps in the localized variant, so they must not drift.
    expect(catalogues.uz['review.anonymous']).toBe('Anonim ishtirokchi');
    expect(catalogues.ru['review.anonymous']).toBe('Анонимный участник');
    expect(catalogues.en['review.anonymous']).toBe('Anonymous participant');
  });

  it('keeps the anonymity microcopy honest in every locale', () => {
    // PRD 7.4 requires stating that a moderator can still see the author.
    expect(catalogues.uz['review.form.anonymousHint']).toMatch(/[Mm]oderator/);
    expect(catalogues.ru['review.form.anonymousHint']).toMatch(/модератор/i);
    expect(catalogues.en['review.form.anonymousHint']).toMatch(/moderator/i);
  });

  it('uses U+2018/U+2019 for the Uzbek tutuq belgisi, never U+02BB/U+02BC', () => {
    // Geologica has no U+02BB and Plex renders it with a visible gap; see
    // docs/design-system.md §3.0.
    const raw = readFileSync(join(MESSAGES_DIR, 'uz.json'), 'utf8');
    expect(raw).not.toContain('ʻ');
    expect(raw).not.toContain('ʼ');
    expect(raw).toContain('‘');
  });

  it('keeps the brand line identical in all locales', () => {
    for (const locale of LOCALES) {
      expect(catalogues[locale]['footer.madeIn']).toBe('Made in Uzbekistan 🇺🇿');
    }
  });
});
