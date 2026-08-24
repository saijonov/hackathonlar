'use client';

import { useTranslations } from 'next-intl';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { BAND_CLASSES, scoreBand } from '@/lib/score';
import { type RatingDistribution } from '@/lib/types';
import { useInView } from '@/lib/hooks/use-in-view';

interface ScoreDistributionProps {
  distribution: RatingDistribution;
  className?: string;
}

/** 5 -> 1 histogram. `distribution[0]` is the count of 5-star reviews. */
export function ScoreDistribution({ distribution, className }: ScoreDistributionProps) {
  const t = useTranslations('score');
  const { ref, inView } = useInView<HTMLDivElement>();

  const total = distribution.reduce((sum, value) => sum + value, 0);

  return (
    <div ref={ref} className={cn('grid grid-cols-1 gap-1.5', className)}>
      <p className="eyebrow text-ink-3">{t('distribution')}</p>
      {distribution.map((count, index) => {
        const stars = 5 - index;
        const percent = total === 0 ? 0 : (count / total) * 100;
        const classes = BAND_CLASSES[scoreBand(stars)];

        return (
          <div key={stars} className="flex items-center gap-2">
            <span className="flex w-8 shrink-0 items-center gap-0.5 text-meta tabular-nums text-ink-3">
              {stars}
              <Star size={10} className="fill-current" aria-hidden />
            </span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-xs bg-paper-2">
              <div
                className={cn('score-bar-fill h-full rounded-xs', classes.fill)}
                data-visible={inView ? 'true' : 'false'}
                style={{ ['--score-bar-width' as string]: `${percent}%` }}
              />
            </div>
            <span className="w-6 shrink-0 text-right text-meta tabular-nums text-ink-3">{count}</span>
          </div>
        );
      })}
    </div>
  );
}
