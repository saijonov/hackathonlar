import { type Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { type AppLocale } from '@/i18n/routing';
import { buildMetadata } from '@/lib/seo';
import { getOrganizerCards } from '@/lib/queries/organizers';
import { EmptyState } from '@/components/ui/EmptyState';
import { OrganizerCard } from '@/components/organizer/OrganizerCard';

export const revalidate = 60;

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta.organizers' });

  return buildMetadata({
    locale: locale as AppLocale,
    path: '/organizers',
    title: t('title'),
    description: t('description'),
  });
}

export default async function OrganizersPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('organizer');
  const organizers = await getOrganizerCards();

  return (
    <div className="container-page py-10 md:py-14">
      <header className="max-w-3xl">
        <p className="eyebrow flex items-center gap-2 text-accent">
          <span aria-hidden className="h-px w-6 bg-accent/40" />
          {t('eyebrow')}
        </p>
        <h1 className="mt-3 text-display-2 text-ink">{t('listTitle')}</h1>
        <p className="mt-3 text-body-lg text-ink-2">{t('listSubtitle')}</p>
      </header>

      <div className="mt-8">
        {organizers.length > 0 ? (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {organizers.map((organizer) => (
              <li key={organizer.id}>
                <OrganizerCard organizer={organizer} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title={t('listEmpty')} />
        )}
      </div>
    </div>
  );
}
