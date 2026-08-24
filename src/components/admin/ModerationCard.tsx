'use client';

import { useState, useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Check, Pencil, X } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';
import { type AppLocale } from '@/i18n/routing';
import { formatDateRange } from '@/lib/format';
import { resolveLocalizedText } from '@/lib/localized-text';
import { type AdminHackathon } from '@/lib/types';
import { moderateHackathon } from '@/lib/actions/admin';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { HackathonEditor } from './HackathonEditor';

interface ModerationCardProps {
  hackathon: AdminHackathon;
  organizers: Array<{ id: string; name: string }>;
}

/** One pending submission in the moderation queue (PRD 7.8). */
export function ModerationCard({ hackathon, organizers }: ModerationCardProps) {
  const t = useTranslations('admin.queue');
  const tCommon = useTranslations('common');
  const tActionError = useTranslations('actionError');
  const locale = useLocale() as AppLocale;
  const router = useRouter();

  const [editing, setEditing] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const description = resolveLocalizedText(hackathon.descriptions, locale);
  const dates = formatDateRange(hackathon.startDate, hackathon.endDate, locale);

  const moderate = (action: 'approve' | 'reject') => {
    setError(null);
    startTransition(async () => {
      const result = await moderateHackathon({
        hackathonId: hackathon.id,
        action,
        rejectionReason: action === 'reject' ? reason : '',
      });
      if (result.ok) router.refresh();
      else setError(tActionError(result.error));
    });
  };

  return (
    <article className="rounded-lg border border-line bg-surface p-4">
      {error && <Alert tone="danger" className="mb-3">{error}</Alert>}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-h2 text-ink">{hackathon.name}</h3>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-meta text-ink-3">
            {hackathon.organizerName && <span>{hackathon.organizerName}</span>}
            {dates && <span>{dates}</span>}
            {hackathon.city && <span>{hackathon.city}</span>}
            <span>{hackathon.format}</span>
          </p>
          <p className="mt-1 text-meta text-ink-3">
            {t('submittedBy')}: {hackathon.submittedByName ?? '—'}
            {hackathon.submittedByEmail ? ` <${hackathon.submittedByEmail}>` : ''}
          </p>
        </div>
        <Badge tone="mid">{hackathon.status}</Badge>
      </div>

      {description && (
        <p className="mt-3 whitespace-pre-line rounded-md border border-line bg-paper-2/50 p-3 text-meta leading-relaxed text-ink-2">
          {description.value}
        </p>
      )}

      {hackathon.tracks.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {hackathon.tracks.map((track) => (
            <li key={track}>
              <Badge tone="neutral">{track}</Badge>
            </li>
          ))}
        </ul>
      )}

      {editing ? (
        <div className="mt-4">
          <HackathonEditor
            hackathon={hackathon}
            organizers={organizers}
            approveOnSave
            onDone={() => setEditing(false)}
          />
        </div>
      ) : rejecting ? (
        <div className="mt-4 grid grid-cols-1 gap-2 rounded-md border border-bad/30 bg-bad-soft/50 p-3">
          <label htmlFor={`reject-${hackathon.id}`} className="text-meta font-semibold text-ink">
            {t('rejectReason')}
          </label>
          <Input
            id={`reject-${hackathon.id}`}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder={t('rejectReasonPlaceholder')}
            maxLength={500}
          />
          <div className="flex gap-2">
            <Button variant="danger" onClick={() => moderate('reject')} loading={isPending}>
              {t('reject')}
            </Button>
            <Button variant="ghost" onClick={() => setRejecting(false)}>
              {tCommon('cancel')}
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={() => moderate('approve')} loading={isPending} data-testid="admin-approve">
            <Check size={16} strokeWidth={2} aria-hidden />
            {t('approve')}
          </Button>
          <Button variant="secondary" onClick={() => setEditing(true)}>
            <Pencil size={15} strokeWidth={1.75} aria-hidden />
            {t('approveAndEdit')}
          </Button>
          <Button variant="danger" onClick={() => setRejecting(true)}>
            <X size={16} strokeWidth={2} aria-hidden />
            {t('reject')}
          </Button>
        </div>
      )}
    </article>
  );
}
