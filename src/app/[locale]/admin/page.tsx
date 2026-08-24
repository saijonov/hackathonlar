import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getAdminOrganizers, getModerationQueue } from '@/lib/queries/admin';
import { EmptyState } from '@/components/ui/EmptyState';
import { ModerationCard } from '@/components/admin/ModerationCard';

type PageProps = { params: Promise<{ locale: string }> };

/** PRD 7.8 — the moderation queue is the admin panel's front door. */
export default async function AdminQueuePage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('admin.queue');
  const [queue, organizers] = await Promise.all([getModerationQueue(), getAdminOrganizers()]);
  const organizerOptions = organizers.map((organizer) => ({
    id: organizer.id,
    name: organizer.name,
  }));

  return (
    <section>
      <h2 className="text-h1">{t('title')}</h2>

      {queue.length > 0 ? (
        <ul className="mt-5 grid grid-cols-1 gap-4">
          {queue.map((hackathon) => (
            <li key={hackathon.id}>
              <ModerationCard hackathon={hackathon} organizers={organizerOptions} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState className="mt-5" compact title={t('empty')} />
      )}
    </section>
  );
}
