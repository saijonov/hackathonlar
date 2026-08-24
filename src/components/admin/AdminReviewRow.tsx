'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Eye, EyeOff, Flag, MessageSquareQuote, Trash2 } from 'lucide-react';
import { Link, useRouter } from '@/i18n/navigation';
import { type AdminReview } from '@/lib/types';
import {
  deleteOfficialResponse,
  saveOfficialResponse,
  setReviewVisibility,
} from '@/lib/actions/admin';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Alert } from '@/components/ui/Alert';
import { TimeAgo } from '@/components/ui/TimeAgo';
import { ScoreMark } from '@/components/score/ScoreMark';

/**
 * A moderation row.
 *
 * PRD 7.8: "true author always visible here even for anonymous reviews". This
 * component reads `admin_reviews`, which resolves the real profile and email
 * regardless of the anonymity flag — the flag only controls what the *public*
 * view exposes.
 */
export function AdminReviewRow({ review }: { review: AdminReview }) {
  const t = useTranslations('admin.reviews');
  const tCommon = useTranslations('common');
  const tActionError = useTranslations('actionError');
  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [responding, setResponding] = useState(false);
  const [responseBody, setResponseBody] = useState(review.officialResponse?.body ?? '');
  const [responseLabel, setResponseLabel] = useState(review.officialResponse?.authorLabel ?? '');

  const run = (task: () => Promise<{ ok: boolean; error?: string }>) => {
    setError(null);
    startTransition(async () => {
      const result = await task();
      if (result.ok) {
        router.refresh();
        setResponding(false);
      } else {
        setError(tActionError((result.error ?? 'unknown') as 'unknown'));
      }
    });
  };

  return (
    <article className="rounded-lg border border-line bg-surface p-4">
      {error && <Alert tone="danger" className="mb-3">{error}</Alert>}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/hackathons/${review.hackathonSlug}`}
              className="text-meta font-medium text-accent hover:underline"
            >
              {review.hackathonName}
            </Link>
            {review.status === 'hidden' && <Badge tone="bad">{t('hidden')}</Badge>}
            {review.openReportCount > 0 && (
              <Badge tone="bad" icon={<Flag size={11} strokeWidth={2} aria-hidden />}>
                {review.openReportCount}
              </Badge>
            )}
            {review.isAnonymous && <Badge tone="accent">{t('anonymousPublic')}</Badge>}
          </div>

          <h3 className="mt-1.5 text-h3 text-ink">{review.title}</h3>

          <p className="mt-1 text-meta text-ink-3">
            <span className="font-semibold text-ink-2">{t('realAuthor')}:</span>{' '}
            {review.authorDisplayName}
            {review.authorEmail ? ` <${review.authorEmail}>` : ''} · <TimeAgo date={review.createdAt} />
          </p>
        </div>

        <ScoreMark score={review.overall} size="sm" showCount={false} className="shrink-0" />
      </div>

      <p className="mt-3 whitespace-pre-line rounded-md border border-line bg-paper-2/50 p-3 text-meta leading-relaxed text-ink-2">
        {review.body}
      </p>

      {review.reportReasons.length > 0 && (
        <ul className="mt-2 grid grid-cols-1 gap-1">
          {review.reportReasons.map((reason, index) => (
            <li key={index} className="rounded-md border border-bad/25 bg-bad-soft/50 px-3 py-1.5 text-meta text-bad">
              {reason}
            </li>
          ))}
        </ul>
      )}

      {review.officialResponse && !responding && (
        <div className="mt-3 rounded-md border-l-[3px] border-y border-r border-accent/30 border-l-accent bg-accent-soft/50 p-3">
          <p className="font-display text-meta font-semibold text-ink">
            {review.officialResponse.authorLabel}
          </p>
          <p className="mt-1 whitespace-pre-line text-meta text-ink-2">
            {review.officialResponse.body}
          </p>
        </div>
      )}

      {responding && (
        <div className="mt-3 grid grid-cols-1 gap-2 rounded-md border border-line bg-paper-2/50 p-3">
          <Field id={`resp-label-${review.id}`} label={t('response.authorLabel')}>
            <Input
              id={`resp-label-${review.id}`}
              value={responseLabel}
              onChange={(event) => setResponseLabel(event.target.value)}
              placeholder={t('response.authorLabelPlaceholder')}
              maxLength={120}
            />
          </Field>
          <Field id={`resp-body-${review.id}`} label={t('response.body')}>
            <Textarea
              id={`resp-body-${review.id}`}
              rows={4}
              value={responseBody}
              onChange={(event) => setResponseBody(event.target.value)}
              maxLength={2000}
            />
          </Field>
          <div className="flex flex-wrap gap-2">
            <Button
              loading={isPending}
              onClick={() =>
                run(() =>
                  saveOfficialResponse({
                    reviewId: review.id,
                    body: responseBody,
                    authorLabel: responseLabel,
                  }),
                )
              }
            >
              {t('response.save')}
            </Button>
            <Button variant="ghost" onClick={() => setResponding(false)}>
              {tCommon('cancel')}
            </Button>
            {review.officialResponse && (
              <Button
                variant="danger"
                onClick={() => run(() => deleteOfficialResponse(review.id))}
              >
                <Trash2 size={15} strokeWidth={1.75} aria-hidden />
                {t('response.remove')}
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={review.status === 'hidden' ? 'secondary' : 'danger'}
          loading={isPending}
          data-testid="admin-toggle-visibility"
          onClick={() =>
            run(() =>
              setReviewVisibility(review.id, review.status === 'hidden' ? 'published' : 'hidden'),
            )
          }
        >
          {review.status === 'hidden' ? (
            <>
              <Eye size={15} strokeWidth={1.75} aria-hidden />
              {t('unhide')}
            </>
          ) : (
            <>
              <EyeOff size={15} strokeWidth={1.75} aria-hidden />
              {t('hide')}
            </>
          )}
        </Button>

        {!responding && (
          <Button size="sm" variant="secondary" onClick={() => setResponding(true)}>
            <MessageSquareQuote size={15} strokeWidth={1.75} aria-hidden />
            {review.officialResponse ? t('response.edit') : t('response.add')}
          </Button>
        )}
      </div>
    </article>
  );
}
