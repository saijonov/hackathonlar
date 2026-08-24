import { type AppLocale, routing } from '@/i18n/routing';
import { type LocalizedText } from './types';

/**
 * PRD 10: "Hackathon/organizer descriptions: show the locale's version if
 * present, otherwise fall back uz → ru → en with a subtle '(uz)' tag."
 *
 * The returned `sourceLocale` is what drives that tag: the UI shows it only
 * when it differs from the locale the reader asked for, so a Russian reader
 * seeing Uzbek copy knows why.
 */
export interface ResolvedText {
  value: string;
  sourceLocale: AppLocale;
  /** True when we had to fall back to a different language than requested. */
  isFallback: boolean;
}

const FALLBACK_ORDER: readonly AppLocale[] = ['uz', 'ru', 'en'];

export function resolveLocalizedText(
  text: Partial<LocalizedText> | null | undefined,
  locale: AppLocale,
): ResolvedText | null {
  if (!text) return null;

  // Requested locale first, then the documented uz → ru → en chain.
  const seen = new Set<AppLocale>();
  const order: AppLocale[] = [];
  for (const candidate of [locale, ...FALLBACK_ORDER]) {
    if (!seen.has(candidate)) {
      seen.add(candidate);
      order.push(candidate);
    }
  }

  for (const candidate of order) {
    const value = text[candidate];
    if (typeof value === 'string' && value.trim().length > 0) {
      return {
        value: value.trim(),
        sourceLocale: candidate,
        isFallback: candidate !== locale,
      };
    }
  }

  return null;
}

/** Convenience for places that only need the string (cards, meta tags). */
export function localizedOrNull(
  text: Partial<LocalizedText> | null | undefined,
  locale: AppLocale,
): string | null {
  return resolveLocalizedText(text, locale)?.value ?? null;
}

/** Builds a LocalizedText out of the flat `*_uz | *_ru | *_en` DB columns. */
export function toLocalizedText(row: {
  description_uz?: string | null;
  description_ru?: string | null;
  description_en?: string | null;
}): LocalizedText {
  return {
    uz: row.description_uz ?? null,
    ru: row.description_ru ?? null,
    en: row.description_en ?? null,
  };
}

/** True when at least one language carries content. */
export function hasAnyText(text: Partial<LocalizedText> | null | undefined): boolean {
  if (!text) return false;
  return routing.locales.some((locale) => (text[locale] ?? '').trim().length > 0);
}
