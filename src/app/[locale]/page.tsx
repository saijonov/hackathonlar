import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { ArrowRight, Plus, TrendingDown, Trophy } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { type AppLocale } from '@/i18n/routing';
import { todayInTashkent } from '@/lib/format';
import { MIN_REVIEWS_FOR_RANKING } from '@/lib/score';
import { getPlatformStats } from '@/lib/queries/stats';
import { getRankedHackathons, getUpcomingHackathons } from '@/lib/queries/hackathons';
import { getRecentReviews } from '@/lib/queries/reviews';
import { buttonClasses } from '@/components/ui/Button';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { Starburst } from '@/components/brand/Starburst';
import { StatsStrip } from '@/components/home/StatsStrip';
import { HackathonCard } from '@/components/hackathon/HackathonCard';
import { ReviewTeaser } from '@/components/review/ReviewTeaser';
import { RankingRow } from '@/components/home/RankingRow';

export const revalidate = 60;

type PageProps = { params: Promise<{ locale: string }> };

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('home');
  const tNav = await getTranslations('nav');
  const today = todayInTashkent();

  const [stats, upcoming, topRated, lowestRated, recentReviews] = await Promise.all([
    getPlatformStats(),
    getUpcomingHackathons(6),
    getRankedHackathons('top', 3),
    getRankedHackathons('bottom', 3),
    getRecentReviews(6),
  ]);

  // With only a handful of hackathons above the review threshold, "highest"
  // and "lowest" would otherwise list the same events twice — which reads as a
  // bug and undermines the point of the split.
  const topIds = new Set(topRated.map((item) => item.id));
  const bottomRated = lowestRated.filter((item) => !topIds.has(item.id));
  const hasRanking = topRated.length > 0;

  return (
    <>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="border-b border-line bg-paper">
        <div className="container-page grid grid-cols-1 gap-10 py-14 md:py-20 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-end lg:gap-16">
          <div className="max-w-3xl">
            <p className="eyebrow flex items-center gap-2 text-accent">
              <span aria-hidden className="h-px w-8 bg-accent/40" />
              {t('hero.eyebrow')}
            </p>

            <div className="mt-5 flex items-start gap-6">
              <h1 className="display-caps text-display-1 text-ink">{t('hero.title')}</h1>
              <Starburst size={96} label="01" className="mt-2 hidden shrink-0 lg:block" />
            </div>

            <p className="mt-5 max-w-xl text-body-lg text-ink-2">{t('hero.subtitle')}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/hackathons" className={buttonClasses('primary', 'lg')}>
                {t('hero.ctaPrimary')}
                <ArrowRight size={18} strokeWidth={2} aria-hidden />
              </Link>
              <Link href="/submit" className={buttonClasses('secondary', 'lg')}>
                <Plus size={18} strokeWidth={2} aria-hidden />
                {t('hero.ctaSecondary')}
              </Link>
            </div>
          </div>

          <StatsStrip stats={stats} className="lg:mb-1" />
        </div>
      </section>

      {/* ----------------------------------------------------------- Upcoming */}
      <section className="border-b border-line bg-paper-2">
        <div className="container-page py-14 md:py-16">
          <SectionHeader
            eyebrow={t('upcoming.eyebrow')}
            title={t('upcoming.title')}
            description={t('upcoming.subtitle')}
            action={
              <Link
                href="/hackathons?tab=upcoming"
                className="inline-flex min-h-11 items-center gap-1.5 text-meta font-semibold text-accent underline underline-offset-4 hover:text-accent-ink"
              >
                {tNav('hackathons')}
                <ArrowRight size={15} strokeWidth={2} aria-hidden />
              </Link>
            }
          />

          <div className="mt-8">
            {upcoming.length > 0 ? (
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {upcoming.map((hackathon, index) => (
                  <li key={hackathon.id}>
                    <HackathonCard hackathon={hackathon} today={today} priority={index < 3} />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                title={t('upcoming.empty')}
                action={
                  <Link href="/submit" className={buttonClasses('primary', 'md')}>
                    <Plus size={17} aria-hidden />
                    {t('cta.button')}
                  </Link>
                }
              />
            )}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- Top / bottom */}
      {hasRanking && (
        <section className="border-b border-line bg-paper">
          <div className="container-page py-14 md:py-16">
            <div
              className={
                bottomRated.length > 0
                  ? 'grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10'
                  : 'grid grid-cols-1 gap-8'
              }
            >
              <div>
                <div className="mb-5 flex items-center gap-2.5">
                  <Badge tone="good" icon={<Trophy size={12} strokeWidth={2} aria-hidden />} micro>
                    {t('ranking.eyebrow')}
                  </Badge>
                  <h2 className="text-h1">{t('ranking.topTitle')}</h2>
                </div>
                <ol className="grid grid-cols-1 gap-2.5">
                  {topRated.map((hackathon, index) => (
                    <li key={hackathon.id}>
                      <RankingRow hackathon={hackathon} rank={index + 1} />
                    </li>
                  ))}
                </ol>
              </div>

              {bottomRated.length > 0 && (
                <div>
                  <div className="mb-5 flex items-center gap-2.5">
                    <Badge tone="bad" icon={<TrendingDown size={12} strokeWidth={2} aria-hidden />} micro>
                      {t('ranking.eyebrow')}
                    </Badge>
                    <h2 className="text-h1">{t('ranking.bottomTitle')}</h2>
                  </div>
                  <ol className="grid grid-cols-1 gap-2.5">
                    {bottomRated.map((hackathon, index) => (
                      <li key={hackathon.id}>
                        <RankingRow hackathon={hackathon} rank={index + 1} />
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>

            <p className="mt-6 text-meta text-ink-3">
              {t('ranking.note', { count: MIN_REVIEWS_FOR_RANKING })}
            </p>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------ Recent reviews */}
      <section className="border-b border-line bg-paper-2">
        <div className="container-page py-14 md:py-16">
          <SectionHeader eyebrow={t('recent.eyebrow')} title={t('recent.title')} />

          <div className="mt-8">
            {recentReviews.length > 0 ? (
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {recentReviews.map((review) => (
                  <li key={review.id}>
                    <ReviewTeaser review={review} />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                title={t('recent.empty')}
                action={
                  <Link href="/hackathons" className={buttonClasses('primary', 'md')}>
                    {t('hero.ctaPrimary')}
                  </Link>
                }
              />
            )}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- How it works */}
      <section className="border-b border-line bg-paper">
        <div className="container-page py-14 md:py-16">
          <SectionHeader eyebrow={t('how.eyebrow')} title={t('how.title')} />

          <ol className="mt-8 grid grid-cols-1 panel notch-br gap-px overflow-hidden bg-line md:grid-cols-3">
            {(['step1', 'step2', 'step3'] as const).map((step, index) => (
              <li key={step} className="bg-surface p-6">
                <span
                  aria-hidden
                  className="font-display text-display-2 leading-none tabular-nums text-numeral"
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-3 text-h2">{t(`how.${step}.title`)}</h3>
                <p className="mt-2 text-body text-ink-2">{t(`how.${step}.body`)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ----------------------------------------------------------- CTA band */}
      <section className="container-page py-14 md:py-20">
        <div className="panel notch-r notch-size-lg flex flex-wrap items-center justify-between gap-6 p-7 sm:p-10">
          <div className="max-w-xl">
            <h2 className="display-caps text-h1 text-ink">{t('cta.title')}</h2>
            <p className="mt-2 text-body text-ink-2">{t('cta.body')}</p>
          </div>
          <Link href="/submit" className={buttonClasses('primary', 'lg')}>
            <Plus size={18} strokeWidth={2} aria-hidden />
            {t('cta.button')}
          </Link>
        </div>
      </section>
    </>
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta.home' });
  const { buildMetadata } = await import('@/lib/seo');

  return buildMetadata({
    locale: locale as AppLocale,
    path: '',
    title: t('title'),
    description: t('description'),
  });
}
