import { type Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import {
  ArrowLeft,
  CalendarDays,
  ExternalLink,
  MapPin,
  PenLine,
  Send,
  Ticket,
  Trophy,
} from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { LOCALE_LABELS, routing, type AppLocale } from '@/i18n/routing';
import { formatDateRange, formatDecimal, isUpcoming, todayInTashkent } from '@/lib/format';
import { resolveLocalizedText } from '@/lib/localized-text';
import { truncate } from '@/lib/generated-cover';
import { absoluteUrl, buildMetadata, localizedPath } from '@/lib/seo';
import {
  getAllHackathonSlugs,
  getHackathonBySlug,
  getHackathonsByOrganizer,
} from '@/lib/queries/hackathons';
import {
  getOwnReviewForHackathon,
  getReviewsForHackathon,
  getViewerReviewState,
  withViewerState,
} from '@/lib/queries/reviews';
import { buttonClasses } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Monogram } from '@/components/brand/Monogram';
import { HackathonCover } from '@/components/hackathon/HackathonCover';
import { FormatBadge } from '@/components/hackathon/FormatBadge';
import { ScorePanel } from '@/components/hackathon/ScorePanel';
import { HackathonCard } from '@/components/hackathon/HackathonCard';
import { StickyReviewCta } from '@/components/hackathon/StickyReviewCta';
import { ReviewCard } from '@/components/review/ReviewCard';

export const revalidate = 60;

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

/** Pre-render every approved hackathon in every locale at build time. */
export async function generateStaticParams() {
  const slugs = await getAllHackathonSlugs();
  return routing.locales.flatMap((locale) =>
    slugs.map(({ slug }) => ({ locale, slug })),
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const hackathon = await getHackathonBySlug(slug);
  if (!hackathon) return {};

  const t = await getTranslations({ locale, namespace: 'meta.hackathon' });
  const appLocale = locale as AppLocale;
  const organizerName = hackathon.organizer?.name ?? '—';

  const description =
    hackathon.score.overall !== null
      ? t('descriptionWithScore', {
          name: hackathon.name,
          score: formatDecimal(hackathon.score.overall, appLocale),
          count: hackathon.score.reviewCount,
          organizer: organizerName,
        })
      : t('descriptionNoScore', { name: hackathon.name, organizer: organizerName });

  return buildMetadata({
    locale: appLocale,
    path: `/hackathons/${slug}`,
    title: t('title', { name: hackathon.name }),
    description: truncate(description, 300),
    image: absoluteUrl(`${localizedPath(appLocale, `/hackathons/${slug}`)}/opengraph-image`),
    type: 'article',
  });
}

export default async function HackathonDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const hackathon = await getHackathonBySlug(slug);
  if (!hackathon) notFound();

  const appLocale = locale as AppLocale;
  const t = await getTranslations('hackathon');

  const today = todayInTashkent();
  const upcoming = isUpcoming(hackathon.effectiveEndDate, today);

  const [reviews, ownReview, organizerHackathons] = await Promise.all([
    getReviewsForHackathon(hackathon.id, 'helpful'),
    getOwnReviewForHackathon(hackathon.id),
    hackathon.organizer ? getHackathonsByOrganizer(hackathon.organizer.slug) : Promise.resolve([]),
  ]);

  // Viewer-specific flags are fetched separately so the review list itself
  // stays cacheable and identical for everyone (see lib/queries/reviews.ts).
  const viewerState = await getViewerReviewState(reviews.map((review) => review.id));
  const reviewsWithViewer = withViewerState(reviews, viewerState);

  const description = resolveLocalizedText(hackathon.descriptions, appLocale);
  const dates = formatDateRange(hackathon.startDate, hackathon.endDate, appLocale);
  const otherByOrganizer = organizerHackathons.filter((item) => item.id !== hackathon.id);
  const ratedByOrganizer = otherByOrganizer.filter((item) => item.score.reviewCount > 0);

  const canReview = !upcoming || hackathon.score.reviewCount > 0;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: hackathon.name,
    url: absoluteUrl(localizedPath(appLocale, `/hackathons/${slug}`)),
    ...(description ? { description: truncate(description.value, 500) } : {}),
    ...(hackathon.startDate ? { startDate: hackathon.startDate } : {}),
    ...(hackathon.endDate ? { endDate: hackathon.endDate } : {}),
    eventAttendanceMode:
      hackathon.format === 'online'
        ? 'https://schema.org/OnlineEventAttendanceMode'
        : hackathon.format === 'hybrid'
          ? 'https://schema.org/MixedEventAttendanceMode'
          : 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    location: hackathon.city
      ? {
          '@type': 'Place',
          name: hackathon.city,
          address: { '@type': 'PostalAddress', addressLocality: hackathon.city, addressCountry: 'UZ' },
        }
      : { '@type': 'VirtualLocation', url: hackathon.website ?? absoluteUrl() },
    ...(hackathon.organizer
      ? {
          organizer: {
            '@type': 'Organization',
            name: hackathon.organizer.name,
            url: absoluteUrl(localizedPath(appLocale, `/organizers/${hackathon.organizer.slug}`)),
          },
        }
      : {}),
    ...(hackathon.score.overall !== null && hackathon.score.reviewCount > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: hackathon.score.overall,
            reviewCount: hackathon.score.reviewCount,
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
        // Structured data for Event + AggregateRating (PRD 7.3).
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* --------------------------------------------------------- Header */}
      <section className="border-b border-line bg-paper-2">
        <div className="container-page py-6 md:py-10">
          <Link
            href="/hackathons"
            className="inline-flex min-h-11 items-center gap-1.5 text-meta font-medium text-ink-3 transition-colors hover:text-accent"
          >
            <ArrowLeft size={15} strokeWidth={2} aria-hidden />
            {t('backToCatalog')}
          </Link>

          <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)] lg:gap-10">
            <div className="min-w-0">
              <div className="flex flex-wrap gap-2">
                <FormatBadge format={hackathon.format} />
                {hackathon.city && (
                  <Badge tone="neutral" icon={<MapPin size={11} strokeWidth={2} aria-hidden />}>
                    {hackathon.city}
                  </Badge>
                )}
                {upcoming && (
                  <Badge tone="good" micro>
                    {t('upcoming.notice')}
                  </Badge>
                )}
              </div>

              <h1 className="mt-3 text-display-2 text-ink">{hackathon.name}</h1>

              {hackathon.organizer && (
                <Link
                  href={`/organizers/${hackathon.organizer.slug}`}
                  className="mt-4 inline-flex items-center gap-2.5 rounded-md text-ink-2 transition-colors hover:text-accent"
                >
                  <Monogram
                    name={hackathon.organizer.name}
                    slug={hackathon.organizer.slug}
                    size={32}
                  />
                  <span className="font-display font-semibold underline-offset-4 hover:underline">
                    {hackathon.organizer.name}
                  </span>
                </Link>
              )}

              <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-3">
                <div>
                  <dt className="eyebrow text-ink-3">{t('dates')}</dt>
                  <dd className="mt-1 flex items-center gap-1.5 text-body text-ink">
                    <CalendarDays size={15} strokeWidth={1.75} aria-hidden className="text-ink-3" />
                    {dates ?? t('dateTbd')}
                  </dd>
                </div>

                {hackathon.prizePool && (
                  <div>
                    <dt className="eyebrow text-ink-3">{t('prizePool')}</dt>
                    <dd className="mt-1 flex items-center gap-1.5 text-body font-semibold text-ink">
                      <Trophy size={15} strokeWidth={1.75} aria-hidden className="text-ink-3" />
                      {hackathon.prizePool}
                    </dd>
                  </div>
                )}
              </dl>

              {hackathon.tracks.length > 0 && (
                <div className="mt-5">
                  <p className="eyebrow text-ink-3">{t('tracks')}</p>
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {hackathon.tracks.map((track) => (
                      <li key={track}>
                        <Badge tone="neutral">{track}</Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-6 flex flex-wrap gap-2">
                {canReview && (
                  <Link
                    href={`/hackathons/${slug}/review`}
                    className={buttonClasses('primary', 'md')}
                    data-testid="write-review-cta"
                  >
                    <PenLine size={16} strokeWidth={2} aria-hidden />
                    {ownReview ? t('editReview') : t('writeReview')}
                  </Link>
                )}

                {hackathon.registrationUrl && upcoming && (
                  <a
                    href={hackathon.registrationUrl}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className={buttonClasses('secondary', 'md')}
                  >
                    <Ticket size={16} strokeWidth={1.75} aria-hidden />
                    {t('links.register')}
                  </a>
                )}

                {hackathon.website && (
                  <a
                    href={hackathon.website}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className={buttonClasses('ghost', 'md')}
                  >
                    <ExternalLink size={16} strokeWidth={1.75} aria-hidden />
                    {t('links.website')}
                  </a>
                )}

                {hackathon.telegram && (
                  <a
                    href={hackathon.telegram}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className={buttonClasses('ghost', 'md')}
                  >
                    <Send size={16} strokeWidth={1.75} aria-hidden />
                    {t('links.telegram')}
                  </a>
                )}
              </div>
            </div>

            <div className="relative aspect-[16/9] w-full overflow-hidden notch-br lg:aspect-[4/3]">
              <HackathonCover
                slug={hackathon.slug}
                name={hackathon.name}
                coverUrl={hackathon.coverUrl}
                priority
                sizes="(max-width: 1024px) 100vw, 380px"
                // The H1 is directly beside this, and the 4:3 crop would slice
                // the generated title in half.
                titleless
                className="absolute inset-0"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- Score */}
      <div className="container-page py-8 md:py-10">
        <ScorePanel score={hackathon.score} />

        {description && (
          <section className="mt-8 max-w-3xl">
            <h2 className="text-h1">{t('about')}</h2>
            <p className="mt-3 whitespace-pre-line text-body-lg leading-relaxed text-ink-2">
              {description.value}
            </p>
            {description.isFallback && (
              <p className="mt-2 text-meta text-ink-3">
                {t('descriptionFallback', { language: LOCALE_LABELS[description.sourceLocale] })}
              </p>
            )}
          </section>
        )}

        {/* ------------------------------------------------------ Reviews */}
        <section className="mt-10 md:mt-14">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line pb-3">
            <h2 className="text-h1">
              {t('reviews.title')}{' '}
              <span className="font-display tabular-nums text-ink-3">
                {hackathon.score.reviewCount > 0 ? hackathon.score.reviewCount : ''}
              </span>
            </h2>
            {hackathon.score.reviewCount > 1 && (
              <p className="text-meta text-ink-3">{t('reviews.sortHelpful')}</p>
            )}
          </div>

          {reviewsWithViewer.length > 0 ? (
            <ul className="mt-5 grid grid-cols-1 gap-4">
              {reviewsWithViewer.map((review) => (
                <li key={review.id}>
                  <ReviewCard review={review} hackathonSlug={slug} />
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              className="mt-5"
              title={upcoming ? t('upcoming.notice') : t('reviews.empty')}
              body={upcoming ? undefined : t('reviews.emptyBody')}
              action={
                canReview ? (
                  <Link href={`/hackathons/${slug}/review`} className={buttonClasses('primary', 'md')}>
                    <PenLine size={16} strokeWidth={2} aria-hidden />
                    {t('writeReview')}
                  </Link>
                ) : undefined
              }
            />
          )}
        </section>

        {/* --- For upcoming events, show the organizer's track record instead */}
        {upcoming && hackathon.organizer && (
          <section className="mt-12">
            <div className="border-b border-line pb-3">
              <h2 className="text-h1">{t('upcoming.organizerRecord')}</h2>
            </div>

            {ratedByOrganizer.length > 0 ? (
              <ul className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {ratedByOrganizer.slice(0, 6).map((item) => (
                  <li key={item.id}>
                    <HackathonCard hackathon={item} today={today} />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState className="mt-5" compact title={t('upcoming.organizerRecordEmpty')} />
            )}
          </section>
        )}

        {/* ------------------------------- Other events by the same organizer */}
        {!upcoming && otherByOrganizer.length > 0 && (
          <section className="mt-12">
            <div className="border-b border-line pb-3">
              <h2 className="text-h1">{t('otherByOrganizer')}</h2>
            </div>
            <ul className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {otherByOrganizer.slice(0, 3).map((item) => (
                <li key={item.id}>
                  <HackathonCard hackathon={item} today={today} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {canReview && (
        <StickyReviewCta
          href={`/hackathons/${slug}/review`}
          label={ownReview ? t('editReview') : t('writeReview')}
          score={hackathon.score.overall}
          reviewCount={hackathon.score.reviewCount}
        />
      )}
    </>
  );
}
