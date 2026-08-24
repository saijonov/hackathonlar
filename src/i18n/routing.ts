import { defineRouting } from 'next-intl/routing';

/**
 * PRD 7: every route is locale-prefixed and `/` redirects to `/uz`.
 * `localePrefix: 'always'` is what produces that redirect, and it keeps the
 * three locales symmetrical for hreflang/sitemap purposes.
 */
export const routing = defineRouting({
  locales: ['uz', 'ru', 'en'],
  defaultLocale: 'uz',
  localePrefix: 'always',
  localeCookie: {
    name: 'NEXT_LOCALE',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  },
  // Emits <Link rel="alternate" hreflang> response headers for search engines.
  alternateLinks: true,
  localeDetection: true,
});

export type AppLocale = (typeof routing.locales)[number];

export const LOCALE_LABELS: Record<AppLocale, string> = {
  uz: "O'zbekcha",
  ru: 'Русский',
  en: 'English',
};

/** Short label for the compact header switcher. */
export const LOCALE_SHORT: Record<AppLocale, string> = {
  uz: 'UZ',
  ru: 'RU',
  en: 'EN',
};

/** BCP-47 tags used for `<html lang>`, Intl formatting and hreflang. */
export const LOCALE_HTML_LANG: Record<AppLocale, string> = {
  uz: 'uz-Latn-UZ',
  ru: 'ru-UZ',
  en: 'en',
};

export function isAppLocale(value: string): value is AppLocale {
  return (routing.locales as readonly string[]).includes(value);
}
