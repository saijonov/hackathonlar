import { useTranslations } from 'next-intl';
import { type ScoreSummary } from '@/lib/types';
import { ScoreMark } from '@/components/score/ScoreMark';
import { ScoreBars } from '@/components/score/ScoreBars';
import { ScoreDistribution } from '@/components/score/ScoreDistribution';
import { cn } from '@/lib/utils/cn';

interface ScorePanelProps {
  score: ScoreSummary;
  className?: string;
}

/**
 * The verdict block (PRD 7.3).
 *
 * Deliberately the loudest thing on the page after the title: a `lg` ScoreMark,
 * the 5→1 histogram, and the five category bars. A hackathon whose
 * communication averages 1.3 has that fact sitting in a red bar right under its
 * name — which is the entire point of the product.
 */
export function ScorePanel({ score, className }: ScorePanelProps) {
  const t = useTranslations('hackathon.scorePanel');
  const tScore = useTranslations('score');

  if (score.reviewCount === 0) {
    return (
      <section
        className={cn(
          'rounded-lg border-2 border-dashed border-line-2 bg-paper-2/60 p-6 text-center',
          className,
        )}
      >
        <p className="font-display text-h2 text-ink">{t('empty')}</p>
        <p className="mx-auto mt-2 max-w-sm text-body text-ink-3">{t('emptyBody')}</p>
      </section>
    );
  }

  return (
    <section
      aria-label={t('title')}
      data-testid="score-panel"
      className={cn('panel notch-br overflow-hidden', className)}
    >
      <div className="grid grid-cols-1 gap-px bg-line lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="bg-surface p-5 sm:p-6">
          <p className="eyebrow text-ink-3">{tScore('overall')}</p>
          <ScoreMark
            score={score.overall}
            reviewCount={score.reviewCount}
            size="lg"
            className="mt-3"
          />
          <ScoreDistribution distribution={score.distribution} className="mt-6" />
        </div>

        <div className="bg-surface p-5 sm:p-6">
          <p className="eyebrow text-ink-3">{tScore('categoriesTitle')}</p>
          <ScoreBars averages={score.categories} className="mt-3" />
        </div>
      </div>
    </section>
  );
}
