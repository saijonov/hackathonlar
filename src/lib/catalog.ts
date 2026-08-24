import { type HackathonFormat } from './types';

/**
 * Catalog vocabulary shared by the server query layer and the client filter
 * UI. It lives outside `lib/queries/` on purpose: that directory is
 * `server-only`, and importing it from a client component would fail the build.
 */

export type CatalogTab = 'upcoming' | 'past' | 'all';
export type CatalogSort = 'newest' | 'highest' | 'lowest' | 'mostReviewed';

export const CATALOG_TABS: readonly CatalogTab[] = ['upcoming', 'past', 'all'];
export const CATALOG_SORTS: readonly CatalogSort[] = ['newest', 'highest', 'lowest', 'mostReviewed'];
export const CATALOG_PAGE_SIZE = 12;

/** Minimum-rating steps offered in the filter dropdown. */
export const RATING_STEPS = [3, 3.5, 4, 4.5] as const;

export interface CatalogQuery {
  tab: CatalogTab;
  sort: CatalogSort;
  city?: string;
  format?: HackathonFormat;
  organizer?: string;
  minRating?: number;
  search?: string;
  page: number;
}
