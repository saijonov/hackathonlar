'use client';

import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils/cn';

interface PaginationProps {
  page: number;
  pageCount: number;
  className?: string;
}

/**
 * Real `<a href>` pagination rather than a "load more" button, so every page of
 * the catalog has its own crawlable, shareable URL (PRD 7.2 / 11).
 */
export function Pagination({ page, pageCount, className }: PaginationProps) {
  const t = useTranslations('catalog');
  const tCommon = useTranslations('common');
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (pageCount <= 1) return null;

  const hrefFor = (target: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (target <= 1) params.delete('page');
    else params.set('page', String(target));
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  };

  // Window of page numbers around the current one, always at most 5 wide.
  const start = Math.max(1, Math.min(page - 2, pageCount - 4));
  const end = Math.min(pageCount, Math.max(page + 2, 5));
  const pages: number[] = [];
  for (let index = start; index <= end; index += 1) pages.push(index);

  const linkClass =
    'grid grid-cols-1 h-11 min-w-11 place-items-center rounded-md border border-line bg-surface px-3 text-meta font-semibold text-ink-2 transition-colors hover:border-ink hover:text-ink';

  return (
    <nav
      aria-label={t('title')}
      data-testid="pagination"
      className={cn('flex flex-wrap items-center gap-2', className)}
    >
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} rel="prev" className={linkClass} aria-label={tCommon('back')}>
          <ChevronLeft size={17} strokeWidth={2} aria-hidden />
        </Link>
      ) : (
        <span className={cn(linkClass, 'pointer-events-none opacity-40')} aria-hidden>
          <ChevronLeft size={17} strokeWidth={2} />
        </span>
      )}

      <ul className="flex items-center gap-1.5">
        {pages.map((value) => (
          <li key={value}>
            <Link
              href={hrefFor(value)}
              aria-current={value === page ? 'page' : undefined}
              className={cn(
                linkClass,
                'tabular-nums',
                value === page && 'border-ink bg-ink text-paper hover:text-paper',
              )}
            >
              {value}
            </Link>
          </li>
        ))}
      </ul>

      {page < pageCount ? (
        <Link
          href={hrefFor(page + 1)}
          rel="next"
          className={linkClass}
          aria-label={t('loadMore')}
        >
          <ChevronRight size={17} strokeWidth={2} aria-hidden />
        </Link>
      ) : (
        <span className={cn(linkClass, 'pointer-events-none opacity-40')} aria-hidden>
          <ChevronRight size={17} strokeWidth={2} />
        </span>
      )}

      <p className="ml-auto text-meta text-ink-3">{t('page', { current: page, total: pageCount })}</p>
    </nav>
  );
}
