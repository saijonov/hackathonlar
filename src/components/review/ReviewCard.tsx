import { useTranslations } from 'next-intl';
import { ChevronDown, MessageSquareQuote, Minus, Pencil, Plus } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { SCORE_CATEGORIES } from '@/lib/score';
import { type PublicReview } from '@/lib/types';
import { cn } from '@/lib/utils/cn';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { TimeAgo } from '@/components/ui/TimeAgo';
import { ScoreMark } from '@/components/score/ScoreMark';
import { Stars } from '@/components/score/Stars';
import { HelpfulButton } from './HelpfulButton';
import { ReportButton } from './ReportButton';

interface ReviewCardProps {
  review: PublicReview & { viewerHasReported?: boolean };
  hackathonSlug: string;
  className?: string;
}

/**
 * A full review (PRD 7.3).
 *
 * The per-category breakdown uses a native `<details>` so it expands without
 * JavaScript and is keyboard-operable for free — only the vote and report
 * controls need to be client components.
 *
 * Anonymity note: for an anonymous review the author name and avatar are
 * already null by the time they leave the database. This component renders the
 * localized label; it is not the thing hiding the identity.
 */
export function ReviewCard({ review, hackathonSlug, className }: ReviewCardProps) {
  const t = useTranslations('review');
  const tScore = useTranslations('score');
  const tParticipation = useTranslations('participation');
  const tHackathon = useTranslations('hackathon');

  const authorName = review.isAnonymous ? t('anonymous') : review.displayName;

  return (
    <article
      id={`review-${review.id}`}
      data-testid="review-card"
      className={cn('panel notch-br', className)}
    >
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3 p-4 pb-3 sm:p-5 sm:pb-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar name={authorName} src={review.avatarUrl} size={40} />
          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span
                className={cn(
                  'truncate font-display font-semibold text-ink',
                  review.isAnonymous && 'italic text-ink-2',
                )}
              >
                {authorName}
              </span>
              <Badge tone="outline">{tParticipation(review.participatedAs)}</Badge>
              {review.viewerIsAuthor && <Badge tone="accent">{t('yourReview')}</Badge>}
            </p>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-meta text-ink-3">
              <TimeAgo date={review.createdAt} />
              {review.editedAt && (
                <>
                  <span aria-hidden>·</span>
                  <span>{t('edited')}</span>
                </>
              )}
            </p>
          </div>
        </div>

        <ScoreMark score={review.overall} size="md" showCount={false} className="shrink-0" />
      </div>

      <div className="px-4 pb-4 sm:px-5 sm:pb-5">
        <h3 className="text-h2 text-ink">{review.title}</h3>
        <p className="mt-2 whitespace-pre-line text-body leading-relaxed text-ink-2">
          {review.body}
        </p>

        {(review.pros || review.cons) && (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {review.pros && (
              <div className="rounded-md border border-good/25 bg-good-soft/60 p-3">
                <p className="eyebrow flex items-center gap-1.5 text-good">
                  <Plus size={12} strokeWidth={2.5} aria-hidden />
                  {t('pros')}
                </p>
                <p className="mt-1.5 text-meta leading-relaxed text-ink-2">{review.pros}</p>
              </div>
            )}
            {review.cons && (
              <div className="rounded-md border border-bad/25 bg-bad-soft/60 p-3">
                <p className="eyebrow flex items-center gap-1.5 text-bad">
                  <Minus size={12} strokeWidth={2.5} aria-hidden />
                  {t('cons')}
                </p>
                <p className="mt-1.5 text-meta leading-relaxed text-ink-2">{review.cons}</p>
              </div>
            )}
          </div>
        )}

        <details className="group mt-4">
          <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 rounded-md text-meta font-medium text-accent hover:underline [&::-webkit-details-marker]:hidden">
            {t('showCategories')}
            <ChevronDown
              size={14}
              strokeWidth={2}
              aria-hidden
              className="transition-transform group-open:rotate-180"
            />
          </summary>
          <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 rounded-md border border-line bg-paper-2/50 p-3 sm:grid-cols-2">
            {SCORE_CATEGORIES.map((category) => (
              <div key={category} className="flex items-center justify-between gap-3">
                <dt className="min-w-0 truncate text-meta text-ink-2">
                  {tScore(`category.${category}`)}
                </dt>
                <dd className="flex shrink-0 items-center gap-2">
                  <Stars value={review.ratings[category]} size={12} decorative />
                  <span className="w-3 text-right font-display text-meta font-bold tabular-nums text-ink">
                    {review.ratings[category]}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </details>

        {review.officialResponse && (
          <div className="mt-4 rounded-md border-l-[3px] border-y border-r border-accent/30 border-l-accent bg-accent-soft/50 p-3.5">
            <p className="eyebrow flex items-center gap-1.5 text-accent-ink">
              <MessageSquareQuote size={13} strokeWidth={2} aria-hidden />
              {t('officialResponse')}
            </p>
            <p className="mt-1 font-display text-meta font-semibold text-ink">
              {review.officialResponse.authorLabel}
            </p>
            <p className="mt-1.5 whitespace-pre-line text-meta leading-relaxed text-ink-2">
              {review.officialResponse.body}
            </p>
          </div>
        )}
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-4 py-2.5 sm:px-5">
        <HelpfulButton
          reviewId={review.id}
          initialCount={review.helpfulCount}
          initialVoted={review.viewerHasVoted}
          isOwnReview={review.viewerIsAuthor}
        />

        <div className="flex items-center gap-1">
          {review.viewerIsAuthor ? (
            <Link
              href={`/hackathons/${hackathonSlug}/review`}
              className="inline-flex h-9 items-center gap-1.5 rounded-md px-2.5 text-meta text-ink-3 transition-colors hover:bg-paper-2 hover:text-ink"
            >
              <Pencil size={14} strokeWidth={1.75} aria-hidden />
              {tHackathon('editReview')}
            </Link>
          ) : (
            <ReportButton
              reviewId={review.id}
              alreadyReported={review.viewerHasReported ?? false}
            />
          )}
        </div>
      </footer>
    </article>
  );
}
