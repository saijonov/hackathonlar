'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Check, X } from 'lucide-react';
import { Link, useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { TimeAgo } from '@/components/ui/TimeAgo';
import { resolveReport } from '@/lib/actions/admin';
import { type AdminReport } from '@/lib/queries/admin';

export function ReportRow({ report }: { report: AdminReport }) {
  const t = useTranslations('admin.reports');
  const tActionError = useTranslations('actionError');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const act = (status: 'resolved' | 'dismissed') => {
    setError(null);
    startTransition(async () => {
      const result = await resolveReport(report.id, status);
      if (result.ok) router.refresh();
      else setError(tActionError(result.error));
    });
  };

  return (
    <article className="rounded-lg border-2 border-ink bg-surface p-4">
      {error && <Alert tone="danger" className="mb-3">{error}</Alert>}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-meta text-ink-3">
            {t('reporter')}: {report.reporterName ?? '—'} · <TimeAgo date={report.createdAt} />
          </p>
          <p className="mt-1.5 text-h3 text-ink">{report.reviewTitle ?? '—'}</p>
          <p className="mt-2 rounded-md border border-bad/25 bg-bad-soft/50 p-3 text-meta text-bad">
            {report.reason}
          </p>
          {report.hackathonSlug && (
            <Link
              href={`/hackathons/${report.hackathonSlug}#review-${report.reviewId}`}
              className="mt-2 inline-block text-meta font-medium text-accent hover:underline"
            >
              {t('viewReview')}
            </Link>
          )}
        </div>

        <div className="flex shrink-0 gap-2">
          <Button size="sm" onClick={() => act('resolved')} loading={isPending}>
            <Check size={15} strokeWidth={2} aria-hidden />
            {t('resolve')}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => act('dismissed')} disabled={isPending}>
            <X size={15} strokeWidth={2} aria-hidden />
            {t('dismiss')}
          </Button>
        </div>
      </div>
    </article>
  );
}
