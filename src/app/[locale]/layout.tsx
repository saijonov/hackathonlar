import { type ReactNode } from 'react';
import { type Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { Analytics } from '@vercel/analytics/next';
import { LOCALE_HTML_LANG, routing, type AppLocale } from '@/i18n/routing';
import { fontVariables } from '../fonts';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { getSessionUser } from '@/lib/auth/session';
import { SITE_NAME, absoluteUrl, alternatesFor } from '@/lib/seo';
import '../globals.css';

type LayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

/**
 * THIS IS THE ROOT LAYOUT.
 *
 * There is deliberately no `app/layout.tsx`. With one present it becomes the
 * root, and because `<html>`/`<body>` live here instead, Next had nowhere to
 * put generated metadata: <title>, <meta name="description">, the canonical
 * link and every OpenGraph tag were emitted *inside <body>*. Measured before
 * the fix — `document.querySelector('meta[name=description]').parentElement`
 * returned BODY, and Lighthouse scored SEO 91 with "Document does not have a
 * meta description" on every page.
 *
 * Dropping the passthrough root layout makes this file the root, so metadata
 * lands in <head> where it belongs. Nothing needs a locale-less layout:
 * robots/sitemap/opengraph-image/auth-callback are route handlers, and the
 * middleware locale-prefixes every other path, so unmatched routes reach
 * `[locale]/not-found.tsx`.
 */

/** Pre-renders the three locale shells at build time. */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};

  const t = await getTranslations({ locale, namespace: 'meta.home' });

  return {
    metadataBase: new URL(absoluteUrl()),
    title: {
      default: t('title'),
      // Every page title ends with the brand, newspaper-masthead style.
      template: `%s — ${SITE_NAME}`,
    },
    description: t('description'),
    applicationName: SITE_NAME,
    alternates: { canonical: absoluteUrl(`/${locale}`), ...alternatesFor('') },
    formatDetection: { telephone: false },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      locale: LOCALE_HTML_LANG[locale as AppLocale],
    },
    twitter: { card: 'summary_large_image' },
  };
}

export const viewport = {
  themeColor: '#F5F1E8',
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1,
};

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  // Required for static rendering of every page beneath this layout.
  setRequestLocale(locale);

  const [messages, sessionUser, t] = await Promise.all([
    getMessages(),
    getSessionUser(),
    getTranslations('common'),
  ]);

  return (
    <html lang={LOCALE_HTML_LANG[locale as AppLocale]} className={fontVariables}>
      <body className="flex min-h-dvh flex-col">
        <NextIntlClientProvider messages={messages}>
          <AuthProvider
            initialUserId={sessionUser?.id ?? null}
            initialEmail={sessionUser?.email ?? null}
            initialProfile={sessionUser?.profile ?? null}
          >
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
            >
              {t('skipToContent')}
            </a>
            <SiteHeader />
            <main id="main" className="flex-1">
              {children}
            </main>
            <SiteFooter />
          </AuthProvider>
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
