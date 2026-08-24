import { useTranslations } from 'next-intl';
import { SCORE_CATEGORIES } from '@/lib/score';
import { type CategoryAverages } from '@/lib/types';
import { cn } from '@/lib/utils/cn';
import { ScoreBar } from './ScoreBar';

interface ScoreBarsProps {
  averages: CategoryAverages;
  /** Show the one-line explainer of what each category measures. */
  withHints?: boolean;
  className?: string;
}

/** The five category bars, always in the same order across the whole site. */
export function ScoreBars({ averages, withHints = false, className }: ScoreBarsProps) {
  const t = useTranslations('score');

  return (
    <div className={cn('grid grid-cols-1 gap-4', className)}>
      {SCORE_CATEGORIES.map((category) => (
        <ScoreBar
          key={category}
          label={t(`category.${category}`)}
          hint={withHints ? t(`categoryHint.${category}`) : undefined}
          value={averages[category]}
        />
      ))}
    </div>
  );
}
