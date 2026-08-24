'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Link, useRouter } from '@/i18n/navigation';
import { type AdminHackathon } from '@/lib/types';
import { deleteHackathon } from '@/lib/actions/admin';
import { Badge, type BadgeTone } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScoreMark } from '@/components/score/ScoreMark';
import { HackathonEditor } from './HackathonEditor';

const STATUS_TONE: Record<string, BadgeTone> = {
  pending: 'mid',
  approved: 'good',
  rejected: 'bad',
};

export function AdminHackathonsManager({
  hackathons,
  organizers,
}: {
  hackathons: AdminHackathon[];
  organizers: Array<{ id: string; name: string }>;
}) {
  const t = useTranslations('admin.hackathons');
  const tActionError = useTranslations('actionError');
  const router = useRouter();

  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const remove = (hackathon: AdminHackathon) => {
    if (!window.confirm(t('deleteConfirm'))) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteHackathon(hackathon.id);
      if (result.ok) router.refresh();
      else setError(tActionError(result.error));
    });
  };

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-h1">{t('title')}</h2>
          <p className="mt-1 text-meta text-ink-3">{t('createHint')}</p>
        </div>
        {!creating && (
          <Button onClick={() => setCreating(true)} data-testid="admin-new-hackathon">
            <Plus size={16} strokeWidth={2} aria-hidden />
            {t('create')}
          </Button>
        )}
      </div>

      {error && <Alert tone="danger" className="mt-4">{error}</Alert>}

      {creating && (
        <div className="mt-4">
          <HackathonEditor
            hackathon={null}
            organizers={organizers}
            onDone={() => setCreating(false)}
          />
        </div>
      )}

      {hackathons.length === 0 ? (
        <EmptyState className="mt-5" compact title={t('empty')} />
      ) : (
        <ul className="mt-5 grid grid-cols-1 gap-2">
          {hackathons.map((hackathon) => (
            <li key={hackathon.id} className="rounded-lg border border-line bg-surface">
              <div className="flex flex-wrap items-center justify-between gap-3 p-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={STATUS_TONE[hackathon.status] ?? 'neutral'}>{hackathon.status}</Badge>
                    <Link
                      href={`/hackathons/${hackathon.slug}`}
                      className="min-w-0 truncate text-h3 text-ink hover:text-accent hover:underline"
                    >
                      {hackathon.name}
                    </Link>
                  </div>
                  <p className="mt-0.5 truncate text-meta text-ink-3">
                    {hackathon.organizerName ?? '—'} · {hackathon.slug}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <ScoreMark
                    score={hackathon.avgOverall}
                    reviewCount={hackathon.reviewCount}
                    size="xs"
                    showStars={false}
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setEditingId(editingId === hackathon.id ? null : hackathon.id)}
                  >
                    <Pencil size={14} strokeWidth={1.75} aria-hidden />
                    {t('edit')}
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => remove(hackathon)}
                    disabled={isPending}
                    aria-label={t('delete')}
                  >
                    <Trash2 size={14} strokeWidth={1.75} aria-hidden />
                  </Button>
                </div>
              </div>

              {editingId === hackathon.id && (
                <div className="border-t border-line p-3">
                  <HackathonEditor
                    hackathon={hackathon}
                    organizers={organizers}
                    onDone={() => setEditingId(null)}
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
