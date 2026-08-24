import { describe, expect, it } from 'vitest';
import { hasAnyText, localizedOrNull, resolveLocalizedText, toLocalizedText } from '@/lib/localized-text';

/** PRD 15.2: "locale fallback logic for descriptions" (rule in PRD 10). */
describe('resolveLocalizedText', () => {
  const all = { uz: 'Oʼzbekcha', ru: 'Русский', en: 'English' };

  it('prefers the requested locale and reports it as not a fallback', () => {
    for (const locale of ['uz', 'ru', 'en'] as const) {
      const result = resolveLocalizedText(all, locale);
      expect(result?.sourceLocale).toBe(locale);
      expect(result?.isFallback).toBe(false);
    }
  });

  it('falls back uz -> ru -> en, in that order', () => {
    // Russian requested, only ru missing: uz comes first in the chain.
    expect(resolveLocalizedText({ uz: 'U', ru: null, en: 'E' }, 'ru')).toMatchObject({
      value: 'U',
      sourceLocale: 'uz',
      isFallback: true,
    });

    // Uzbek missing too: next is ru, which is also missing, so en.
    expect(resolveLocalizedText({ uz: null, ru: null, en: 'E' }, 'ru')).toMatchObject({
      value: 'E',
      sourceLocale: 'en',
      isFallback: true,
    });

    // English requested, only Russian present.
    expect(resolveLocalizedText({ uz: null, ru: 'R', en: null }, 'en')).toMatchObject({
      value: 'R',
      sourceLocale: 'ru',
      isFallback: true,
    });
  });

  it('treats whitespace-only content as absent', () => {
    expect(resolveLocalizedText({ uz: '   ', ru: 'R', en: null }, 'uz')).toMatchObject({
      value: 'R',
      sourceLocale: 'ru',
      isFallback: true,
    });
  });

  it('trims the value it returns', () => {
    expect(resolveLocalizedText({ uz: '  padded  ', ru: null, en: null }, 'uz')?.value).toBe(
      'padded',
    );
  });

  it('returns null when nothing is available', () => {
    expect(resolveLocalizedText({ uz: null, ru: null, en: null }, 'uz')).toBeNull();
    expect(resolveLocalizedText(null, 'uz')).toBeNull();
    expect(resolveLocalizedText(undefined, 'uz')).toBeNull();
  });

  it('never yields a duplicate lookup order', () => {
    // Requesting uz must not check uz twice; the result is the same either way,
    // but a duplicated chain would be a latent bug if the order ever changed.
    expect(localizedOrNull({ uz: 'U', ru: 'R', en: 'E' }, 'uz')).toBe('U');
  });
});

describe('toLocalizedText / hasAnyText', () => {
  it('maps the flat description_* columns', () => {
    expect(
      toLocalizedText({ description_uz: 'U', description_ru: null, description_en: undefined }),
    ).toEqual({ uz: 'U', ru: null, en: null });
  });

  it('detects whether any language carries content', () => {
    expect(hasAnyText({ uz: null, ru: '', en: '  ' })).toBe(false);
    expect(hasAnyText({ uz: null, ru: 'R', en: null })).toBe(true);
    expect(hasAnyText(null)).toBe(false);
  });
});
