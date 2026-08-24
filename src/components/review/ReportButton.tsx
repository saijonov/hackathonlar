'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Flag } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Field } from '@/components/ui/Field';
import { Alert } from '@/components/ui/Alert';
import { reportReview } from '@/lib/actions/reviews';

interface ReportButtonProps {
  reviewId: string;
  alreadyReported: boolean;
}

/** Report flow -> admin queue (PRD 8). */
export function ReportButton({ reviewId, alreadyReported }: ReportButtonProps) {
  const t = useTranslations('review');
  const tCommon = useTranslations('common');
  const tActionError = useTranslations('actionError');
  const { isAuthenticated, openAuth } = useAuth();

  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [done, setDone] = useState(alreadyReported);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const submit = () => {
    setError(null);
    startTransition(async () => {
      const result = await reportReview({ reviewId, reason });

      if (result.ok) {
        setDone(true);
        setOpen(false);
        return;
      }
      if (result.error === 'unauthenticated') {
        setOpen(false);
        openAuth({ onSuccess: () => setOpen(true) });
        return;
      }
      if (result.error === 'alreadyReported') {
        setDone(true);
        setOpen(false);
        return;
      }
      setError(tActionError(result.error));
    });
  };

  if (done) {
    return (
      <span className="inline-flex items-center gap-1.5 text-meta text-ink-3">
        <Flag size={14} strokeWidth={1.75} aria-hidden />
        {t('reported')}
      </span>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => (isAuthenticated ? setOpen(true) : openAuth({ onSuccess: () => setOpen(true) }))}
        data-testid="report-button"
        className="inline-flex h-9 items-center gap-1.5 rounded-md px-2.5 text-meta text-ink-3 transition-colors hover:bg-paper-2 hover:text-ink"
      >
        <Flag size={14} strokeWidth={1.75} aria-hidden />
        {t('report')}
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={t('reportDialog.title')}
        description={t('reportDialog.body')}
        placement="auto"
        size="sm"
        footer={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)} className="flex-1">
              {tCommon('cancel')}
            </Button>
            <Button
              onClick={submit}
              loading={isPending}
              disabled={reason.trim().length < 3}
              className="flex-1"
              data-testid="report-submit"
            >
              {t('reportDialog.submit')}
            </Button>
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-3">
          {error && <Alert tone="danger">{error}</Alert>}
          <Field id={`report-${reviewId}`} label={t('reportDialog.reasonLabel')}>
            <Textarea
              id={`report-${reviewId}`}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder={t('reportDialog.reasonPlaceholder')}
              maxLength={500}
              rows={4}
            />
          </Field>
        </div>
      </Modal>
    </>
  );
}
