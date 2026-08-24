import { type Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Plus } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { type AppLocale } from '@/i18n/routing';
import { todayInTashkent } from '@/lib/format';
import { buildMetadata } from '@/lib/seo';
import { HACKATHON_FORMATS, type HackathonFormat } from '@/lib/types';
import {
  CATALOG_SORTS,
  CATALOG_TABS,
  type CatalogSort,
  type CatalogTab,
} from '@/lib/catalog';
import { getCatalog, getCityFacets, getOrganizerFacets } from '@/lib/queries/hackathons';
import { buttonClasses } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pagination } from '@/components/ui/Pagination';
import { CatalogFilters, type CatalogFilterState } from '@/components/hackathon/CatalogFilters';
import { HackathonCard } from '@/components/hackathon/HackathonCard';

export const revalidate = 60;

type SearchParams = Record<string, string | string[] | undefined>;

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
};

function single(value: string | string[] | undefined): string | undefined {
  const first = Array.isArray(value) ? value[0] : value;
  const trimmed = first?.trim();
  return trimmed ? trimmed : undefined;
}

/**
 * Parses the query string into a validated filter state.
 *
 * Unknown values fall back to the default rather than reaching the database —
 * `?sort=drop%20table` simply sorts by newest.
 */
function parseFilters(searchParams: SearchParams): CatalogFilterState & { page: number } {
  const tab = single(searchParams.tab);
  const sort = single(searchParams.sort);
  const format = single(searchParams.format);
  const min = Number(single(searchParams.min));
  const page = Number(single(searchParams.page));

  return {
    tab: CATALOG_TABS.includes(tab as CatalogTab) ? (tab as CatalogTab) : 'all',
    sort: CATALOG_SORTS.includes(sort as CatalogSort) ? (sort as CatalogSort) : 'newest',
    city: single(searchParams.city),
    format: HACKATHON_FORMATS.includes(format as HackathonFormat)
      ? (format as HackathonFormat)
      : undefined,
    organizer: single(searchParams.organizer),
    minRating: Number.isFinite(min) && min >= 1 && min <= 5 ? min : undefined,
    search: single(searchParams.q),
    page: Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1,
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta.catalog' });

  return buildMetadata({
    locale: locale as AppLocale,
    path: '/hackathons',
    title: t('title'),
    description: t('description'),
  });
}

export default async function HackathonsPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('catalog');
  const filters = parseFilters(await searchParams);
  const today = todayInTashkent();

  const [result, cities, organizers] = await Promise.all([
    getCatalog(filters),
    getCityFacets(),
    getOrganizerFacets(),
  ]);

  return (
    <div className="container-page py-10 md:py-14">
      <header className="max-w-3xl">
        <p className="eyebrow flex items-center gap-2 text-accent">
          <span aria-hidden className="h-px w-6 bg-accent/40" />
          {t('eyebrow')}
        </p>
        <h1 className="mt-3 text-display-2 text-ink">{t('title')}</h1>
        <p className="mt-3 text-body-lg text-ink-2">{t('subtitle')}</p>
      </header>

      <div className="mt-8">
        <CatalogFilters
          state={filters}
          cities={cities}
          organizers={organizers}
          resultCount={result.total}
        />
      </div>

      <div className="mt-8">
        {result.items.length > 0 ? (
          <>
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {result.items.map((hackathon, index) => (
                <li key={hackathon.id}>
                  <HackathonCard hackathon={hackathon} today={today} priority={index < 3} />
                </li>
              ))}
            </ul>

            <Pagination page={result.page} pageCount={result.pageCount} className="mt-10" />
          </>
        ) : (
          <EmptyState
            title={t('empty.title')}
            body={t('empty.body')}
            action={
              <Link href="/submit" className={buttonClasses('primary', 'md')}>
                <Plus size={17} strokeWidth={2} aria-hidden />
                {t('empty.cta')}
              </Link>
            }
          />
        )}
      </div>
    </div>
  );
}
