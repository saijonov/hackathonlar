import { type Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { type AppLocale } from '@/i18n/routing';
import { buildMetadata } from '@/lib/seo';
import { createPublicClient } from '@/lib/queries/public-client';
import { SubmitForm, type OrganizerOption } from '@/components/hackathon/SubmitForm';

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta.submit' });

  return buildMetadata({
    locale: locale as AppLocale,
    path: '/submit',
    title: t('title'),
    description: t('description'),
  });
}

/**
 * PRD 7.5. The page itself is public: a logged-out visitor can fill the whole
 * form in and only meets the auth dialog on submit, at which point the draft is
 * still on screen behind it.
 */
export default async function SubmitPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('submit');

  const supabase = createPublicClient();
  const { data } = await supabase
    .from('organizers')
    .select('id, slug, name')
    .order('name', { ascending: true });

  const organizers: OrganizerOption[] = (data ?? []).map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
  }));

  return (
    <div className="container-page max-w-3xl py-8 md:py-12">
      <header>
        <p className="eyebrow flex items-center gap-2 text-accent">
          <span aria-hidden className="h-px w-6 bg-accent/40" />
          {t('eyebrow')}
        </p>
        <h1 className="mt-3 text-display-2 text-ink">{t('title')}</h1>
        <p className="mt-3 text-body-lg text-ink-2">{t('subtitle')}</p>
      </header>

      <div className="mt-8">
        <SubmitForm organizers={organizers} />
      </div>
    </div>
  );
}
