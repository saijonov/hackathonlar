'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { usePathname, useRouter } from '@/i18n/navigation';
import { CATALOG_SORTS, RATING_STEPS, type CatalogSort, type CatalogTab } from '@/lib/catalog';
import { HACKATHON_FORMATS, type HackathonFormat } from '@/lib/types';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';

export interface CatalogFilterState {
  tab: CatalogTab;
  sort: CatalogSort;
  city?: string;
  format?: HackathonFormat;
  organizer?: string;
  minRating?: number;
  search?: string;
}

interface CatalogFiltersProps {
  state: CatalogFilterState;
  cities: Array<{ city: string; count: number }>;
  organizers: Array<{ slug: string; name: string }>;
  resultCount: number;
}

const TABS: readonly CatalogTab[] = ['upcoming', 'past', 'all'];
const SEARCH_DEBOUNCE_MS = 350;

/**
 * URL-driven catalog filters (PRD 7.2: "shareable").
 *
 * Every control writes to the query string and the server component re-renders
 * from it, so a filtered view can be pasted into a Telegram chat and it will
 * open exactly the same way for the next person. Below `md` the whole control
 * set collapses into a bottom sheet (PRD 9.4).
 */
export function CatalogFilters({ state, cities, organizers, resultCount }: CatalogFiltersProps) {
  const t = useTranslations('catalog');
  const tCommon = useTranslations('common');
  const tFormat = useTranslations('format');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(state.search ?? '');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep the input in sync when the URL changes from outside (back button).
  useEffect(() => {
    setSearchValue(state.search ?? '');
  }, [state.search]);

  const pushParams = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      mutate(params);
      // Any filter change resets pagination — page 3 of the old result set is
      // meaningless against the new one.
      params.delete('page');
      const query = params.toString();
      startTransition(() => {
        router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
      });
    },
    [pathname, router, searchParams],
  );

  const setParam = useCallback(
    (key: string, value: string | undefined) => {
      pushParams((params) => {
        if (!value) params.delete(key);
        else params.set(key, value);
      });
    },
    [pushParams],
  );

  const onSearchChange = (value: string) => {
    setSearchValue(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setParam('q', value.trim() || undefined), SEARCH_DEBOUNCE_MS);
  };

  useEffect(() => () => (debounceRef.current ? clearTimeout(debounceRef.current) : undefined), []);

  const activeCount = useMemo(
    () =>
      [state.city, state.format, state.organizer, state.minRating ? String(state.minRating) : undefined].filter(
        Boolean,
      ).length,
    [state.city, state.format, state.organizer, state.minRating],
  );

  const clearAll = () => {
    setSearchValue('');
    startTransition(() => {
      router.replace(state.tab === 'all' ? pathname : `${pathname}?tab=${state.tab}`, {
        scroll: false,
      });
    });
    setSheetOpen(false);
  };

  const tabHref = (tab: CatalogTab) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('page');
    if (tab === 'all') params.delete('tab');
    else params.set('tab', tab);
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  };

  /** The four dropdowns, reused verbatim in the desktop bar and the sheet. */
  const controls = (
    <>
      <label className="grid grid-cols-1 gap-1.5">
        <span className="eyebrow text-ink-3">{t('filter.city')}</span>
        <Select
          value={state.city ?? ''}
          onChange={(event) => setParam('city', event.target.value || undefined)}
        >
          <option value="">{t('filter.anyCity')}</option>
          {cities.map((city) => (
            <option key={city.city} value={city.city}>
              {city.city} ({city.count})
            </option>
          ))}
        </Select>
      </label>

      <label className="grid grid-cols-1 gap-1.5">
        <span className="eyebrow text-ink-3">{t('filter.format')}</span>
        <Select
          value={state.format ?? ''}
          onChange={(event) => setParam('format', event.target.value || undefined)}
        >
          <option value="">{t('filter.anyFormat')}</option>
          {HACKATHON_FORMATS.map((format) => (
            <option key={format} value={format}>
              {tFormat(format)}
            </option>
          ))}
        </Select>
      </label>

      <label className="grid grid-cols-1 gap-1.5">
        <span className="eyebrow text-ink-3">{t('filter.organizer')}</span>
        <Select
          value={state.organizer ?? ''}
          onChange={(event) => setParam('organizer', event.target.value || undefined)}
        >
          <option value="">{t('filter.anyOrganizer')}</option>
          {organizers.map((organizer) => (
            <option key={organizer.slug} value={organizer.slug}>
              {organizer.name}
            </option>
          ))}
        </Select>
      </label>

      <label className="grid grid-cols-1 gap-1.5">
        <span className="eyebrow text-ink-3">{t('filter.minRating')}</span>
        <Select
          value={state.minRating ? String(state.minRating) : ''}
          onChange={(event) => setParam('min', event.target.value || undefined)}
        >
          <option value="">{t('filter.anyRating')}</option>
          {RATING_STEPS.map((step) => (
            <option key={step} value={step}>
              {t('filter.ratingFrom', { score: step })}
            </option>
          ))}
        </Select>
      </label>
    </>
  );

  return (
    <div className="grid grid-cols-1 gap-4" data-pending={isPending || undefined}>
      {/* Tabs — real links so the state is shareable and works without JS. */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav
          aria-label={t('title')}
          className="flex items-center rounded-md border border-line bg-surface p-0.5"
        >
          {TABS.map((tab) => (
            <a
              key={tab}
              href={tabHref(tab)}
              aria-current={state.tab === tab ? 'page' : undefined}
              onClick={(event) => {
                event.preventDefault();
                setParam('tab', tab === 'all' ? undefined : tab);
              }}
              className={cn(
                'grid grid-cols-1 h-9 min-w-[84px] place-items-center rounded-sm px-3 text-meta font-semibold transition-colors',
                state.tab === tab ? 'bg-ink text-paper' : 'text-ink-3 hover:bg-paper-2 hover:text-ink',
              )}
            >
              {t(`tabs.${tab}`)}
            </a>
          ))}
        </nav>

        <label className="flex items-center gap-2">
          <span className="eyebrow shrink-0 text-ink-3">{t('sort.label')}</span>
          <Select
            value={state.sort}
            onChange={(event) => setParam('sort', event.target.value)}
            className="h-9 min-w-[150px] text-meta"
            aria-label={t('sort.label')}
          >
            {CATALOG_SORTS.map((sort) => (
              <option key={sort} value={sort}>
                {t(`sort.${sort}`)}
              </option>
            ))}
          </Select>
        </label>
      </div>

      {/* Search + (mobile) filter trigger */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search
            size={17}
            strokeWidth={1.75}
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3"
          />
          <input
            type="search"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={t('searchPlaceholder')}
            aria-label={t('searchLabel')}
            className="h-11 w-full rounded-md border border-line-2 bg-surface pl-10 pr-3 text-body text-ink placeholder:text-ink-3/70 hover:border-ink-3 focus:border-accent"
          />
        </div>

        <Button
          variant="secondary"
          onClick={() => setSheetOpen(true)}
          className="md:hidden"
          aria-label={t('filter.openFilters')}
        >
          <SlidersHorizontal size={17} strokeWidth={1.75} aria-hidden />
          {activeCount > 0 && (
            <span className="grid grid-cols-1 size-5 place-items-center rounded-full bg-accent text-[11px] font-bold text-white tabular-nums">
              {activeCount}
            </span>
          )}
        </Button>
      </div>

      {/* Desktop filter row */}
      <div className="hidden gap-3 md:grid md:grid-cols-4">{controls}</div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
        <p aria-live="polite" className="text-meta text-ink-3">
          {t('resultCount', { count: resultCount })}
        </p>
        {(activeCount > 0 || searchValue) && (
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex items-center gap-1 text-meta font-medium text-accent underline underline-offset-4 hover:text-accent-ink"
          >
            <X size={13} strokeWidth={2} aria-hidden />
            {t('empty.clear')}
          </button>
        )}
      </div>

      {/* Mobile bottom sheet */}
      <Modal
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={tCommon('filters')}
        placement="bottom"
        footer={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={clearAll} className="flex-1">
              {t('empty.clear')}
            </Button>
            <Button onClick={() => setSheetOpen(false)} className="flex-1">
              {t('resultCount', { count: resultCount })}
            </Button>
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-4">{controls}</div>
      </Modal>
    </div>
  );
}
