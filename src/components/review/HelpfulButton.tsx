'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { ThumbsUp } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { toggleHelpful } from '@/lib/actions/reviews';
import { cn } from '@/lib/utils/cn';

interface HelpfulButtonProps {
  reviewId: string;
  initialCount: number;
  initialVoted: boolean;
  /** You cannot mark your own review helpful; the button explains why. */
  isOwnReview: boolean;
}

/**
 * "Foydali" vote. One per user per review, enforced by a unique constraint and
 * by RLS — this optimistic UI is a nicety layered on top, not the rule.
 */
export function HelpfulButton({
  reviewId,
  initialCount,
  initialVoted,
  isOwnReview,
}: HelpfulButtonProps) {
  const t = useTranslations('review');
  const tActionError = useTranslations('actionError');
  const { isAuthenticated, openAuth } = useAuth();
  const [isPending, startTransition] = useTransition();

  const [count, setCount] = useState(initialCount);
  const [voted, setVoted] = useState(initialVoted);
  const [error, setError] = useState<string | null>(null);

  const run = () => {
    setError(null);

    // Optimistic: flip immediately, reconcile with the server's count after.
    const previous = { count, voted };
    setVoted(!voted);
    setCount(count + (voted ? -1 : 1));

    startTransition(async () => {
      const result = await toggleHelpful(reviewId);

      if (result.ok) {
        setVoted(result.data.voted);
        setCount(result.data.count);
        return;
      }

      setVoted(previous.voted);
      setCount(previous.count);

      if (result.error === 'unauthenticated') {
        openAuth({ onSuccess: run });
        return;
      }
      setError(tActionError(result.error));
    });
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => (isAuthenticated ? run() : openAuth({ onSuccess: run }))}
        disabled={isPending || isOwnReview}
        title={isOwnReview ? t('errors.ownVote') : undefined}
        aria-pressed={voted}
        data-testid="helpful-button"
        className={cn(
          'inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-meta font-medium transition-colors',
          'disabled:cursor-not-allowed disabled:opacity-60',
          voted
            ? 'border-accent bg-accent-soft text-accent-ink'
            : 'border-line bg-surface text-ink-2 hover:border-line-2 hover:text-ink',
        )}
      >
        <ThumbsUp size={15} strokeWidth={1.75} aria-hidden className={cn(voted && 'fill-current')} />
        {t('helpful')}
        {count > 0 && <span className="tabular-nums">{count}</span>}
      </button>

      {error && (
        <span role="alert" className="text-meta text-bad">
          {error}
        </span>
      )}
    </div>
  );
}
