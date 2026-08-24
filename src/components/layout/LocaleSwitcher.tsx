'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Link, usePathname } from '@/i18n/navigation';
import { LOCALE_LABELS, LOCALE_SHORT, routing, type AppLocale } from '@/i18n/routing';
import { cn } from '@/lib/utils/cn';

interface LocaleSwitcherProps {
  className?: string;
  /** Stacked, full-width variant for the mobile menu and footer. */
  variant?: 'inline' | 'stacked';
}

/**
 * Three plain links — UZ · RU · EN — rather than a JS dropdown.
 *
 * They are real `<a href>`s to the same page in another locale, so they work
 * without JavaScript, they are crawlable, and the middleware persists the
 * choice into the NEXT_LOCALE cookie on navigation (PRD 7). Current search
 * params ride along so a filtered catalog view survives a language switch.
 */
export function LocaleSwitcher({ className, variant = 'inline' }: LocaleSwitcherProps) {
  const t = useTranslations('nav');
  const activeLocale = useLocale() as AppLocale;
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const query = Object.fromEntries(searchParams.entries());
  const href = { pathname, query } as const;

  if (variant === 'stacked') {
    return (
      <nav aria-label={t('changeLanguage')} className={cn('grid grid-cols-1 gap-1', className)}>
        {routing.locales.map((locale) => {
          const isActive = locale === activeLocale;
          return (
            <Link
              key={locale}
              href={href}
              locale={locale}
              hrefLang={locale}
              aria-current={isActive ? 'true' : undefined}
              className={cn(
                'flex h-11 items-center justify-between rounded-md px-3 text-body transition-colors',
                isActive ? 'bg-accent-soft font-semibold text-accent-ink' : 'text-ink-2 hover:bg-paper-2',
              )}
            >
              {LOCALE_LABELS[locale]}
              <span className="eyebrow text-ink-3">{LOCALE_SHORT[locale]}</span>
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav
      aria-label={t('changeLanguage')}
      className={cn(
        'flex items-center rounded-md border border-line bg-surface p-0.5',
        className,
      )}
    >
      {routing.locales.map((locale) => {
        const isActive = locale === activeLocale;
        return (
          <Link
            key={locale}
            href={href}
            locale={locale}
            hrefLang={locale}
            title={LOCALE_LABELS[locale]}
            aria-current={isActive ? 'true' : undefined}
            className={cn(
              'eyebrow grid grid-cols-1 h-7 min-w-9 place-items-center rounded-sm px-1.5 transition-colors',
              isActive
                ? 'bg-ink text-paper'
                : 'text-ink-3 hover:bg-paper-2 hover:text-ink',
            )}
          >
            {LOCALE_SHORT[locale]}
          </Link>
        );
      })}
    </nav>
  );
}
