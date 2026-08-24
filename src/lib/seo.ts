import { type Metadata } from 'next';
import { LOCALE_HTML_LANG, routing, type AppLocale } from '@/i18n/routing';
import { getSiteUrl } from '@/lib/supabase/env';

export const SITE_NAME = 'hackathonlar.uz';

/** Absolute URL for a locale-prefixed path: `/uz/hackathons`. */
export function absoluteUrl(path = ''): string {
  const base = getSiteUrl();
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

export function localizedPath(locale: AppLocale, path = ''): string {
  const clean = path === '/' ? '' : path;
  return `/${locale}${clean.startsWith('/') || clean === '' ? clean : `/${clean}`}`;
}

/**
 * hreflang alternates for every locale plus x-default (PRD 10 / 11).
 * `path` is the locale-less route, e.g. `/hackathons/cbu-coding-hackathon-2026`.
 */
export function alternatesFor(path = ''): NonNullable<Metadata['alternates']> {
  const languages: Record<string, string> = {};
  for (const locale of routing.locales) {
    languages[LOCALE_HTML_LANG[locale]] = absoluteUrl(localizedPath(locale, path));
  }
  languages['x-default'] = absoluteUrl(localizedPath(routing.defaultLocale, path));

  return { languages };
}

interface PageMetadataInput {
  locale: AppLocale;
  path?: string;
  title: string;
  description: string;
  /** Absolute or root-relative OG image URL. Falls back to the site default. */
  image?: string;
  type?: 'website' | 'article';
  noIndex?: boolean;
}

export function buildMetadata({
  locale,
  path = '',
  title,
  description,
  image,
  type = 'website',
  noIndex = false,
}: PageMetadataInput): Metadata {
  const url = absoluteUrl(localizedPath(locale, path));
  const ogImage = image ?? absoluteUrl('/opengraph-image');

  return {
    title,
    description,
    alternates: { canonical: url, ...alternatesFor(path) },
    openGraph: {
      type,
      url,
      siteName: SITE_NAME,
      title,
      description,
      locale: LOCALE_HTML_LANG[locale],
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
  };
}
