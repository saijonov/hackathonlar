import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { truncate } from '@/lib/generated-cover';
import { type PublicReview } from '@/lib/types';
import { cn } from '@/lib/utils/cn';
import { Avatar } from '@/components/ui/Avatar';
import { ScoreMark } from '@/components/score/ScoreMark';
import { TimeAgo } from '@/components/ui/TimeAgo';

interface ReviewTeaserProps {
  review: PublicReview;
  className?: string;
}

/**
 * Compact review card for the home "recently reviewed" rail (PRD 7.1):
 * hackathon name, score, title, ~120 chars of body, author, time ago.
 */
export function ReviewTeaser({ review, className }: ReviewTeaserProps) {
  const t = useTranslations('review');
  const authorName = review.isAnonymous ? t('anonymous') : review.displayName;

  return (
    <article className={cn('h-full', className)}>
      <Link
        href={`/hackathons/${review.hackathonSlug}`}
        className="card-lift group flex h-full flex-col gap-3 rounded-lg border border-line bg-surface p-4"
      >
        <div className="flex items-start justify-between gap-3">
          <p className="min-w-0 text-meta font-medium text-ink-3 transition-colors group-hover:text-accent">
            <span className="line-clamp-2">{review.hackathonName}</span>
          </p>
          <ScoreMark score={review.overall} size="xs" showStars={false} showCount={false} />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-h3 text-ink">{review.title}</h3>
          <p className="mt-1.5 text-meta leading-relaxed text-ink-2">
            {truncate(review.body, 130)}
          </p>
        </div>

        <div className="flex items-center gap-2 border-t border-line pt-3 text-meta text-ink-3">
          <Avatar name={authorName} src={review.avatarUrl} size={22} />
          <span className="min-w-0 truncate">{authorName}</span>
          <span aria-hidden>·</span>
          <TimeAgo date={review.createdAt} className="shrink-0" />
        </div>
      </Link>
    </article>
  );
}
