import { useLocale, useTranslations } from 'next-intl';
import { type AppLocale } from '@/i18n/routing';
import { cn } from '@/lib/utils/cn';
import { BAND_CLASSES, formatScore, scoreBand, toScore } from '@/lib/score';
import { Stars } from './Stars';

export type ScoreMarkSize = 'xs' | 'sm' | 'md' | 'lg';

interface ScoreMarkProps {
  score: number | string | null | undefined;
  reviewCount?: number;
  size?: ScoreMarkSize;
  /** Hide the star row (dense tables, tight cards). */
  showStars?: boolean;
  /** Hide the "N reviews" caption. */
  showCount?: boolean;
  className?: string;
}

/**
 * THE signature component (docs/design-system.md §5).
 *
 *   ┌─┬──────┐
 *   │▌│ 2.8  │  ★★★☆☆   14 sharh
 *   └─┴──────┘
 *
 * A scoreboard cell: a coloured left rule, a tinted cell holding the number in
 * the display face, then optional stars and review count. Rendered at four
 * sizes and reused on every surface that shows a rating, which is what makes
 * the score language of the site feel like one system.
 */

const SIZES: Record<
  ScoreMarkSize,
  {
    cell: string;
    rule: string;
    number: string;
    star: number;
    gap: string;
    caption: string;
    radius: string;
  }
> = {
  xs: {
    cell: 'h-[22px] min-w-[38px] px-1.5',
    rule: 'w-[3px]',
    number: 'text-meta font-bold',
    star: 10,
    gap: 'gap-1.5',
    caption: 'text-micro',
    radius: 'rounded-xs',
  },
  sm: {
    cell: 'h-7 min-w-[46px] px-2',
    rule: 'w-[3px]',
    number: 'text-h3 font-extrabold',
    star: 12,
    gap: 'gap-2',
    caption: 'text-meta',
    radius: 'rounded-sm',
  },
  md: {
    cell: 'h-10 min-w-[62px] px-2.5',
    rule: 'w-[4px]',
    number: 'text-h1 font-extrabold',
    star: 15,
    gap: 'gap-2.5',
    caption: 'text-meta',
    radius: 'rounded-sm',
  },
  lg: {
    cell: 'h-16 min-w-[96px] px-4 sm:h-20 sm:min-w-[116px]',
    rule: 'w-[6px]',
    number: 'text-display-2 font-extrabold',
    star: 20,
    gap: 'gap-3',
    caption: 'text-body',
    radius: 'rounded-md',
  },
};

export function ScoreMark({
  score,
  reviewCount,
  size = 'sm',
  showStars = true,
  showCount = true,
  className,
}: ScoreMarkProps) {
  const t = useTranslations('score');
  const locale = useLocale() as AppLocale;
  const styles = SIZES[size];

  const value = toScore(score);
  const band = scoreBand(score);
  const classes = BAND_CLASSES[band];
  const display = value === null ? '—' : formatScore(value, locale);
  const ariaLabel = value === null ? t('noScore') : t('outOf', { score: display });

  return (
    <div className={cn('flex items-center', styles.gap, className)}>
      <div
        className={cn('flex shrink-0 overflow-hidden', styles.radius)}
        title={ariaLabel}
        aria-label={ariaLabel}
        role="img"
      >
        <span className={cn('shrink-0', styles.rule, classes.fill)} aria-hidden />
        <span
          className={cn(
            'flex items-center justify-center font-display tabular-nums',
            styles.cell,
            styles.number,
            classes.tint,
            classes.text,
          )}
          aria-hidden
        >
          {display}
        </span>
      </div>

      {showStars && value !== null && <Stars value={value} size={styles.star} decorative />}

      {showCount && typeof reviewCount === 'number' && (
        <span className={cn('shrink-0 text-ink-3', styles.caption)}>
          {reviewCount === 0 ? t('noReviews') : t('reviewCount', { count: reviewCount })}
        </span>
      )}
    </div>
  );
}
