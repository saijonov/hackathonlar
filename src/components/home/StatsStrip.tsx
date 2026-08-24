'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { type AppLocale } from '@/i18n/routing';
import { formatNumber } from '@/lib/format';
import { formatScore, scoreBand, BAND_CLASSES } from '@/lib/score';
import { type PlatformStats } from '@/lib/types';
import { useInView } from '@/lib/hooks/use-in-view';
import { cn } from '@/lib/utils/cn';

interface StatsStripProps {
  stats: PlatformStats;
  className?: string;
}

const COUNT_DURATION_MS = 900;

/**
 * Counts from 0 to `value` once, on first view.
 *
 * `prefers-reduced-motion` is handled inside `useInView`, which reports "in
 * view" immediately in that case — so the number simply appears at its final
 * value instead of ticking (docs/design-system.md §6).
 */
function useCountUp(value: number, active: boolean): number {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!active) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || value === 0) {
      setCurrent(value);
      return;
    }

    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / COUNT_DURATION_MS);
      // easeOutExpo, matching --ease-out-expo used by the score bars.
      const eased = progress === 1 ? 1 : 1 - 2 ** (-10 * progress);
      setCurrent(Math.round(eased * value));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, active]);

  return current;
}

function StatCell({
  value,
  label,
  active,
  tone,
}: {
  value: number;
  label: string;
  active: boolean;
  tone?: string;
}) {
  const locale = useLocale() as AppLocale;
  const counted = useCountUp(value, active);

  return (
    <div className="flex flex-col justify-center px-4 py-4 sm:px-6">
      <span
        className={cn('font-display text-display-2 leading-none tabular-nums', tone ?? 'text-ink')}
      >
        {formatNumber(counted, locale)}
      </span>
      <span className="mt-1.5 text-meta text-ink-3">{label}</span>
    </div>
  );
}

/**
 * The live numbers under the hero (PRD 7.1). Every figure comes from the
 * database — there is no hardcoded "10,000+ users" here.
 */
export function StatsStrip({ stats, className }: StatsStripProps) {
  const t = useTranslations('home.stats');
  const locale = useLocale() as AppLocale;
  const { ref, inView } = useInView<HTMLDivElement>();

  const averageBand = BAND_CLASSES[scoreBand(stats.avgOverall)];

  return (
    <div
      ref={ref}
      className={cn(
        'grid grid-cols-2 divide-x divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface sm:grid-cols-4 sm:divide-y-0',
        className,
      )}
    >
      <StatCell value={stats.hackathonCount} label={t('hackathons')} active={inView} />
      <StatCell value={stats.reviewCount} label={t('reviews')} active={inView} />
      <StatCell value={stats.organizerCount} label={t('organizers')} active={inView} />

      <div className="flex flex-col justify-center px-4 py-4 sm:px-6">
        <span
          className={cn(
            'font-display text-display-2 leading-none tabular-nums',
            stats.avgOverall === null ? 'text-ink-3' : averageBand.text,
          )}
        >
          {stats.avgOverall === null ? '—' : formatScore(stats.avgOverall, locale)}
        </span>
        <span className="mt-1.5 text-meta text-ink-3">
          {stats.avgOverall === null ? t('averageEmpty') : t('average')}
        </span>
      </div>
    </div>
  );
}
