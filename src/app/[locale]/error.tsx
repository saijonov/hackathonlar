'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

/** Designed error boundary for everything under a locale. */
export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('errors.generic');

  useEffect(() => {
    // Surfaces in the platform logs; the digest is what ties a user report to
    // a specific server-side failure.
    console.error(error);
  }, [error]);

  return (
    <div className="container-page flex min-h-[60vh] max-w-2xl flex-col items-center justify-center py-16 text-center">
      <p aria-hidden className="eyebrow text-bad">
        {t('code')}
      </p>
      <h1 className="mt-3 text-display-2 text-ink">{t('title')}</h1>
      <p className="mt-3 max-w-md text-body-lg text-ink-2">{t('body')}</p>
      {error.digest && <p className="mt-2 font-mono text-meta text-ink-3">{error.digest}</p>}
      <Button className="mt-7" onClick={reset}>
        <RotateCw size={16} strokeWidth={2} aria-hidden />
        {t('cta')}
      </Button>
    </div>
  );
}
