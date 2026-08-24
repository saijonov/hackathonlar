import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getAdminReviews, type AdminReviewFilter } from '@/lib/queries/admin';
import { EmptyState } from '@/components/ui/EmptyState';
import { AdminReviewRow } from '@/components/admin/AdminReviewRow';
import { cn } from '@/lib/utils/cn';

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ filter?: string }>;
};

const FILTERS: readonly AdminReviewFilter[] = ['all', 'reported', 'hidden'];

export default async function AdminReviewsPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('admin.reviews');
  const { filter: rawFilter } = await searchParams;
  const filter: AdminReviewFilter = FILTERS.includes(rawFilter as AdminReviewFilter)
    ? (rawFilter as AdminReviewFilter)
    : 'all';

  const reviews = await getAdminReviews(filter);

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-h1">{t('title')}</h2>

        <nav className="flex items-center rounded-md border border-line bg-surface p-0.5">
          {FILTERS.map((value) => (
            <Link
              key={value}
              href={value === 'all' ? '/admin/reviews' : `/admin/reviews?filter=${value}`}
              aria-current={filter === value ? 'page' : undefined}
              className={cn(
                'grid h-8 min-w-24 place-items-center rounded-sm px-3 text-meta font-semibold transition-colors',
                filter === value ? 'bg-ink text-paper' : 'text-ink-3 hover:bg-paper-2 hover:text-ink',
              )}
            >
              {t(value === 'all' ? 'filterAll' : value === 'reported' ? 'filterReported' : 'filterHidden')}
            </Link>
          ))}
        </nav>
      </div>

      {reviews.length > 0 ? (
        <ul className="mt-5 grid grid-cols-1 gap-4">
          {reviews.map((review) => (
            <li key={review.id}>
              <AdminReviewRow review={review} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState className="mt-5" compact title={t('empty')} />
      )}
    </section>
  );
}
