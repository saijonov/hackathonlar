import { type Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Send } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { type AppLocale } from '@/i18n/routing';
import { buildMetadata } from '@/lib/seo';
import { getPlatformStats } from '@/lib/queries/stats';
import { buttonClasses } from '@/components/ui/Button';
import { StatsStrip } from '@/components/home/StatsStrip';

export const revalidate = 60;

type PageProps = { params: Promise<{ locale: string }> };

const PRINCIPLES = ['one', 'two', 'three'] as const;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta.about' });

  return buildMetadata({
    locale: locale as AppLocale,
    path: '/about',
    title: t('title'),
    description: t('description'),
  });
}

/** PRD 7.9 — mission, why this exists, contact. Short, confident copy. */
export default async function AboutPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('about');
  const tHome = await getTranslations('home');
  const stats = await getPlatformStats();

  return (
    <div className="container-page max-w-4xl py-10 md:py-16">
      <header className="max-w-2xl">
        <p className="eyebrow flex items-center gap-2 text-accent">
          <span aria-hidden className="h-px w-6 bg-accent/40" />
          {t('eyebrow')}
        </p>
        <h1 className="mt-3 text-display-2 text-ink">{t('title')}</h1>
        <p className="mt-4 text-body-lg leading-relaxed text-ink-2">{t('lead')}</p>
      </header>

      <StatsStrip stats={stats} className="mt-8" />

      <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
        <section>
          <h2 className="text-h1 text-bad">{t('problem.title')}</h2>
          <p className="mt-3 text-body leading-relaxed text-ink-2">{t('problem.body')}</p>
        </section>
        <section>
          <h2 className="text-h1 text-good">{t('solution.title')}</h2>
          <p className="mt-3 text-body leading-relaxed text-ink-2">{t('solution.body')}</p>
        </section>
      </div>

      <section className="mt-12">
        <h2 className="border-b border-line pb-3 text-h1">{t('principles.title')}</h2>
        <ol className="mt-5 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-line bg-line md:grid-cols-3">
          {PRINCIPLES.map((principle, index) => (
            <li key={principle} className="bg-surface p-5">
              <span
                aria-hidden
                className="font-display text-h1 font-extrabold leading-none tabular-nums text-numeral"
              >
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-2 text-h2">{t(`principles.${principle}.title`)}</h3>
              <p className="mt-1.5 text-meta leading-relaxed text-ink-2">
                {t(`principles.${principle}.body`)}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-12 flex flex-wrap items-center justify-between gap-5 rounded-lg border border-line bg-surface p-6">
        <div className="max-w-md">
          <h2 className="text-h1">{t('contactTitle')}</h2>
          <p className="mt-2 text-body text-ink-2">{t('contactBody')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href="https://t.me/hackathonlar_uz"
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClasses('primary', 'md')}
          >
            <Send size={16} strokeWidth={1.75} aria-hidden />
            {t('telegram')}
          </a>
          <Link href="/hackathons" className={buttonClasses('secondary', 'md')}>
            {tHome('hero.ctaPrimary')}
          </Link>
        </div>
      </section>
    </div>
  );
}
