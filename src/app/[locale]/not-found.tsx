import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { buttonClasses } from '@/components/ui/Button';

/** Designed 404 (PRD 11: "Graceful errors: designed 404 and error pages"). */
export default function LocaleNotFound() {
  const t = useTranslations('errors.notFound');

  return (
    <div className="container-page flex min-h-[60vh] max-w-2xl flex-col items-center justify-center py-16 text-center">
      <p
        aria-hidden
        className="font-display text-[clamp(5rem,18vw,10rem)] font-extrabold leading-none tracking-[-0.05em] text-line-2"
      >
        {t('code')}
      </p>
      <h1 className="mt-2 text-display-2 text-ink">{t('title')}</h1>
      <p className="mt-3 max-w-md text-body-lg text-ink-2">{t('body')}</p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link href="/hackathons" className={buttonClasses('primary', 'md')}>
          {t('cta')}
        </Link>
        <Link href="/" className={buttonClasses('secondary', 'md')}>
          {t('home')}
        </Link>
      </div>
    </div>
  );
}
