'use client';

import { useLocale } from 'next-intl';
import { type AppLocale } from '@/i18n/routing';
import { cn } from '@/lib/utils/cn';
import { BAND_CLASSES, formatScore, scoreBand, scorePercent, toScore } from '@/lib/score';
import { useInView } from '@/lib/hooks/use-in-view';

interface ScoreBarProps {
  label: string;
  hint?: string;
  value: number | string | null | undefined;
  /** Rendered when there is no score at all. */
  emptyLabel?: string;
  className?: string;
}

/**
 * One category row: label, animated bar, number.
 *
 * "Communication scoring 1.5/5 should be instantly visible and damning"
 * (PRD 7.3) — hence the full-width track, the band colour and the number set
 * in the display face right at the end of the bar.
 */
export function ScoreBar({ label, hint, value, emptyLabel = '—', className }: ScoreBarProps) {
  const locale = useLocale() as AppLocale;
  const { ref, inView } = useInView<HTMLDivElement>();

  const score = toScore(value);
  const band = scoreBand(value);
  const classes = BAND_CLASSES[band];

  return (
    <div ref={ref} className={cn('grid grid-cols-1 gap-1.5', className)}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-meta font-medium text-ink-2">{label}</span>
        <span className={cn('font-display text-h3 tabular-nums', classes.text)}>
          {score === null ? emptyLabel : formatScore(score, locale)}
        </span>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-xs border border-line bg-paper-2">
        <div
          className={cn('score-bar-fill h-full rounded-xs', classes.fill)}
          data-visible={inView ? 'true' : 'false'}
          style={{ ['--score-bar-width' as string]: `${scorePercent(score)}%` }}
        />
      </div>

      {hint && <p className="text-micro leading-relaxed tracking-normal text-ink-3">{hint}</p>}
    </div>
  );
}
