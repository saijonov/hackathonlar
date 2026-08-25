'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Pencil, Plus } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Monogram } from '@/components/brand/Monogram';
import { OrganizerEditor, type OrganizerRecord } from './OrganizerEditor';

export function AdminOrganizersManager({ organizers }: { organizers: OrganizerRecord[] }) {
  const t = useTranslations('admin.organizers');
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-h1">{t('title')}</h2>
        {!creating && (
          <Button onClick={() => setCreating(true)} data-testid="admin-new-organizer">
            <Plus size={16} strokeWidth={2} aria-hidden />
            {t('create')}
          </Button>
        )}
      </div>

      {creating && (
        <div className="mt-4">
          <OrganizerEditor organizer={null} onDone={() => setCreating(false)} />
        </div>
      )}

      {organizers.length === 0 ? (
        <EmptyState className="mt-5" compact title={t('empty')} />
      ) : (
        <ul className="mt-5 grid grid-cols-1 gap-2">
          {organizers.map((organizer) => (
            <li key={organizer.id} className="rounded-lg border-2 border-ink bg-surface">
              <div className="flex flex-wrap items-center justify-between gap-3 p-3">
                <div className="flex min-w-0 flex-1 items-center gap-2.5">
                  <Monogram name={organizer.name} slug={organizer.slug} size={32} />
                  <div className="min-w-0">
                    <Link
                      href={`/organizers/${organizer.slug}`}
                      className="block truncate text-h3 text-ink hover:text-accent hover:underline"
                    >
                      {organizer.name}
                    </Link>
                    <p className="truncate text-meta text-ink-3">{organizer.slug}</p>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setEditingId(editingId === organizer.id ? null : organizer.id)}
                >
                  <Pencil size={14} strokeWidth={1.75} aria-hidden />
                  {t('edit')}
                </Button>
              </div>

              {editingId === organizer.id && (
                <div className="border-t border-line p-3">
                  <OrganizerEditor organizer={organizer} onDone={() => setEditingId(null)} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
