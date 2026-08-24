import { type Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Send } from 'lucide-react';
import { type AppLocale } from '@/i18n/routing';
import { buildMetadata } from '@/lib/seo';

type PageProps = { params: Promise<{ locale: string }> };

const SECTIONS = [
  'honest',
  'specific',
  'noInsults',
  'noFabrication',
  'anonymity',
  'moderation',
  'legal',
] as const;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta.rules' });

  return buildMetadata({
    locale: locale as AppLocale,
    path: '/rules',
    title: t('title'),
    description: t('description'),
  });
}

/** PRD 7.9 — review guidelines, in all three locales. */
export default async function RulesPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('rules');

  return (
    <div className="container-page max-w-3xl py-10 md:py-16">
      <header>
        <p className="eyebrow flex items-center gap-2 text-accent">
          <span aria-hidden className="h-px w-6 bg-accent/40" />
          {t('eyebrow')}
        </p>
        <h1 className="mt-3 text-display-2 text-ink">{t('title')}</h1>
        <p className="mt-4 text-body-lg leading-relaxed text-ink-2">{t('intro')}</p>
      </header>

      <ol className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-line bg-line">
        {SECTIONS.map((section, index) => (
          <li key={section} className="bg-surface p-5 sm:p-6">
            <div className="flex gap-4">
              <span
                aria-hidden
                className="font-display text-h1 font-extrabold leading-none tabular-nums text-line-2"
              >
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0">
                <h2 className="text-h2">{t(`sections.${section}.title`)}</h2>
                <p className="mt-2 text-body leading-relaxed text-ink-2">
                  {t(`sections.${section}.body`)}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ol>

      <section className="mt-10 rounded-lg border border-accent/25 bg-accent-soft p-5">
        <h2 className="text-h2 text-accent-ink">{t('contactTitle')}</h2>
        <p className="mt-1.5 text-body text-ink-2">{t('contactBody')}</p>
        <a
          href="https://t.me/hackathonlar_uz"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-body font-semibold text-accent underline underline-offset-4"
        >
          <Send size={16} strokeWidth={1.75} aria-hidden />
          Telegram
        </a>
      </section>
    </div>
  );
}
