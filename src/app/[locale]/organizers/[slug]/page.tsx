import { type Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ExternalLink, Send } from 'lucide-react';
import { LOCALE_LABELS, routing, type AppLocale } from '@/i18n/routing';
import { isUpcoming, todayInTashkent } from '@/lib/format';
import { resolveLocalizedText } from '@/lib/localized-text';
import { truncate } from '@/lib/generated-cover';
import { absoluteUrl, buildMetadata, localizedPath } from '@/lib/seo';
import { getAllOrganizerSlugs, getOrganizerBySlug } from '@/lib/queries/organizers';
import { getHackathonsByOrganizer } from '@/lib/queries/hackathons';
import { EmptyState } from '@/components/ui/EmptyState';
import { buttonClasses } from '@/components/ui/Button';
import { Monogram } from '@/components/brand/Monogram';
import { ScoreMark } from '@/components/score/ScoreMark';
import { ScoreBars } from '@/components/score/ScoreBars';
import { HackathonCard } from '@/components/hackathon/HackathonCard';

export const revalidate = 60;

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await getAllOrganizerSlugs();
  return routing.locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const organizer = await getOrganizerBySlug(slug);
  if (!organizer) return {};

  const t = await getTranslations({ locale, namespace: 'meta.organizer' });

  return buildMetadata({
    locale: locale as AppLocale,
    path: `/organizers/${slug}`,
    title: t('title', { name: organizer.name }),
    description: truncate(t('description', { name: organizer.name }), 300),
  });
}

/**
 * The organizer scoreboard (PRD 7.6): "This page is the accountability
 * scoreboard — make it excellent."
 *
 * Its job is to answer one question at a glance: *can this organizer be
 * trusted with your weekend?* So the aggregate score and the five category
 * averages across every event they have run come first, above the list of
 * events themselves.
 */
export default async function OrganizerPage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const organizer = await getOrganizerBySlug(slug);
  if (!organizer) notFound();

  const appLocale = locale as AppLocale;
  const t = await getTranslations('organizer');
  const tHackathon = await getTranslations('hackathon');

  const hackathons = await getHackathonsByOrganizer(slug);
  const today = todayInTashkent();

  const upcoming = hackathons.filter((item) => isUpcoming(item.effectiveEndDate, today));
  const past = hackathons.filter((item) => !isUpcoming(item.effectiveEndDate, today));
  const description = resolveLocalizedText(organizer.descriptions, appLocale);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: organizer.name,
    url: absoluteUrl(localizedPath(appLocale, `/organizers/${slug}`)),
    ...(organizer.website ? { sameAs: [organizer.website] } : {}),
    ...(description ? { description: truncate(description.value, 500) } : {}),
    ...(organizer.overall !== null && organizer.reviewCount > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: organizer.overall,
            reviewCount: organizer.reviewCount,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="border-b border-line bg-paper-2">
        <div className="container-page py-8 md:py-12">
          <div className="flex flex-wrap items-start gap-5">
            <Monogram name={organizer.name} slug={organizer.slug} size={72} />

            <div className="min-w-0 flex-1">
              <p className="eyebrow text-accent">{t('eyebrow')}</p>
              <h1 className="mt-2 text-display-2 text-ink">{organizer.name}</h1>

              <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-meta text-ink-3">
                <span>{t('hackathons', { count: organizer.hackathonCount })}</span>
                <span aria-hidden>·</span>
                <span>{t('reviews', { count: organizer.reviewCount })}</span>
              </p>

              {(organizer.website || organizer.telegram) && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {organizer.website && (
                    <a
                      href={organizer.website}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className={buttonClasses('secondary', 'sm')}
                    >
                      <ExternalLink size={15} strokeWidth={1.75} aria-hidden />
                      {tHackathon('links.website')}
                    </a>
                  )}
                  {organizer.telegram && (
                    <a
                      href={organizer.telegram}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className={buttonClasses('secondary', 'sm')}
                    >
                      <Send size={15} strokeWidth={1.75} aria-hidden />
                      {tHackathon('links.telegram')}
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {description && (
            <div className="mt-6 max-w-3xl">
              <p className="whitespace-pre-line text-body leading-relaxed text-ink-2">
                {description.value}
              </p>
              {description.isFallback && (
                <p className="mt-2 text-meta text-ink-3">
                  {tHackathon('descriptionFallback', {
                    language: LOCALE_LABELS[description.sourceLocale],
                  })}
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      <div className="container-page py-8 md:py-12">
        {/* ------------------------------------------- Aggregate track record */}
        <section
          aria-label={t('trackRecord')}
          className="panel notch-br overflow-hidden"
        >
          <div className="grid grid-cols-1 gap-px bg-line lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
            <div className="bg-surface p-5 sm:p-6">
              <p className="eyebrow text-ink-3">{t('trackRecord')}</p>
              {organizer.reviewCount > 0 ? (
                <ScoreMark
                  score={organizer.overall}
                  reviewCount={organizer.reviewCount}
                  size="lg"
                  className="mt-3"
                />
              ) : (
                <p className="mt-3 font-display text-h2 text-ink-3">{t('trackRecordEmpty')}</p>
              )}
            </div>

            <div className="bg-surface p-5 sm:p-6">
              <p className="eyebrow text-ink-3">{t('categoriesTitle')}</p>
              <ScoreBars averages={organizer.categories} className="mt-3" />
            </div>
          </div>
        </section>

        {/* --------------------------------------------------------- Events */}
        {hackathons.length === 0 ? (
          <EmptyState className="mt-10" title={t('empty')} />
        ) : (
          <>
            {upcoming.length > 0 && (
              <section className="mt-10 md:mt-14">
                <h2 className="border-b border-line pb-3 text-h1">{t('upcomingTitle')}</h2>
                <ul className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {upcoming.map((hackathon) => (
                    <li key={hackathon.id}>
                      <HackathonCard hackathon={hackathon} today={today} />
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {past.length > 0 && (
              <section className="mt-10 md:mt-14">
                <h2 className="border-b border-line pb-3 text-h1">{t('pastTitle')}</h2>
                <ul className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {past.map((hackathon) => (
                    <li key={hackathon.id}>
                      <HackathonCard hackathon={hackathon} today={today} />
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </div>
    </>
  );
}
