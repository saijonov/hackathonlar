import { useLocale, useTranslations } from 'next-intl';
import { CalendarDays, MapPin, TrendingDown, TrendingUp } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { type AppLocale } from '@/i18n/routing';
import { formatDateRange, formatDecimal, isUpcoming } from '@/lib/format';
import { categoryExtremes, formatScore } from '@/lib/score';
import { type HackathonCard as HackathonCardModel } from '@/lib/types';
import { cn } from '@/lib/utils/cn';
import { Badge } from '@/components/ui/Badge';
import { Monogram } from '@/components/brand/Monogram';
import { ScoreMark } from '@/components/score/ScoreMark';
import { Stars } from '@/components/score/Stars';
import { HackathonCover } from './HackathonCover';
import { FormatBadge } from './FormatBadge';

interface HackathonCardProps {
  hackathon: HackathonCardModel;
  today: string;
  priority?: boolean;
  className?: string;
}

/**
 * The catalog card (PRD 7.2).
 *
 * The whole card is one link. Its footer switches meaning by state:
 *   - reviewed  -> the hackathon's own ScoreMark plus best/weakest chips
 *   - upcoming  -> the ORGANIZER's historical average, which is the point of
 *                  the product: you can see an organizer's track record before
 *                  you commit a weekend to their next event (PRD 7.1).
 */
export function HackathonCard({ hackathon, today, priority = false, className }: HackathonCardProps) {
  const t = useTranslations('hackathon');
  const tHome = useTranslations('home.upcoming');
  const tScore = useTranslations('score');
  const locale = useLocale() as AppLocale;

  const upcoming = isUpcoming(hackathon.effectiveEndDate, today);
  const dates = formatDateRange(hackathon.startDate, hackathon.endDate, locale);
  const extremes = categoryExtremes(hackathon.score.categories);
  const showOrganizerRecord = upcoming && hackathon.score.reviewCount === 0;

  return (
    <article className={cn('h-full', className)}>
      <Link
        href={`/hackathons/${hackathon.slug}`}
        className="card-lift group flex h-full flex-col overflow-hidden rounded-lg border-2 border-ink bg-surface"
      >
        <div className="relative aspect-[16/9] w-full border-b border-line">
          <HackathonCover
            slug={hackathon.slug}
            name={hackathon.name}
            coverUrl={hackathon.coverUrl}
            priority={priority}
            titleless
            className="absolute inset-0"
          />
          <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">
            <FormatBadge format={hackathon.format} />
            {hackathon.city && (
              <Badge tone="neutral" icon={<MapPin size={11} strokeWidth={2} aria-hidden />}>
                {hackathon.city}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-3 p-4">
          <div className="min-w-0">
            <h2 className="text-h3 text-ink transition-colors group-hover:text-accent">
              {hackathon.name}
            </h2>

            {hackathon.organizer && (
              <p className="mt-2 flex min-w-0 items-center gap-1.5 text-meta text-ink-3">
                <Monogram
                  name={hackathon.organizer.name}
                  slug={hackathon.organizer.slug}
                  size={18}
                  className="rounded-xs"
                />
                <span className="truncate">{hackathon.organizer.name}</span>
              </p>
            )}
          </div>

          <p className="flex items-center gap-1.5 text-meta text-ink-3">
            <CalendarDays size={13} strokeWidth={1.75} aria-hidden className="shrink-0" />
            {dates ?? t('dateTbd')}
          </p>

          <div className="mt-auto border-t border-line pt-3">
            {showOrganizerRecord ? (
              <div className="grid grid-cols-1 gap-1.5">
                <p className="eyebrow text-ink-3">{tHome('organizerRating')}</p>
                {hackathon.organizerRecord.avgOverall !== null ? (
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="font-display text-h3 font-extrabold tabular-nums text-ink">
                      {formatScore(hackathon.organizerRecord.avgOverall, locale)}
                    </span>
                    <Stars value={hackathon.organizerRecord.avgOverall} size={12} decorative />
                    <span className="text-meta text-ink-3">
                      {tHome('organizerRatingBasis', {
                        count: hackathon.organizerRecord.ratedHackathonCount,
                      })}
                    </span>
                  </div>
                ) : (
                  <p className="text-meta text-ink-3">{tHome('organizerNoRating')}</p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                <ScoreMark
                  score={hackathon.score.overall}
                  reviewCount={hackathon.score.reviewCount}
                  size="sm"
                />
                {extremes && (
                  <div className="flex flex-wrap gap-1.5">
                    <Badge
                      tone="good"
                      icon={<TrendingUp size={11} strokeWidth={2} aria-hidden />}
                      title={`${tScore('best')}: ${tScore(`category.${extremes.best}`)}`}
                    >
                      {tScore(`category.${extremes.best}`)}{' '}
                      {formatDecimal(hackathon.score.categories[extremes.best] ?? 0, locale)}
                    </Badge>
                    <Badge
                      tone="bad"
                      icon={<TrendingDown size={11} strokeWidth={2} aria-hidden />}
                      title={`${tScore('weakest')}: ${tScore(`category.${extremes.worst}`)}`}
                    >
                      {tScore(`category.${extremes.worst}`)}{' '}
                      {formatDecimal(hackathon.score.categories[extremes.worst] ?? 0, locale)}
                    </Badge>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
