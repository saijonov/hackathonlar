import 'server-only';

import { unstable_cache } from 'next/cache';
import { todayInTashkent } from '@/lib/format';
import { MIN_REVIEWS_FOR_RANKING } from '@/lib/score';
import { CATALOG_PAGE_SIZE, type CatalogQuery } from '@/lib/catalog';
import { type HackathonCard } from '@/lib/types';
import { mapHackathonCard } from './mappers';
import {
  CACHE_TAGS,
  DEFAULT_REVALIDATE,
  createPublicClient,
  sanitizeSearchTerm,
} from './public-client';

export interface CatalogResult {
  items: HackathonCard[];
  total: number;
  page: number;
  pageCount: number;
}

const CARD_COLUMNS = '*';

/**
 * The catalog query (PRD 7.2). Filters, sort and pagination all happen in
 * Postgres — we never over-fetch and slice in JS.
 */
async function queryCatalog(query: CatalogQuery, today: string): Promise<CatalogResult> {
  const supabase = createPublicClient();
  let request = supabase.from('hackathon_cards').select(CARD_COLUMNS, { count: 'exact' });

  if (query.tab === 'upcoming') {
    request = request.gte('effective_end_date', today);
  } else if (query.tab === 'past') {
    request = request.lt('effective_end_date', today);
  }

  if (query.city) request = request.eq('city', query.city);
  if (query.format) request = request.eq('format', query.format);
  if (query.organizer) request = request.eq('organizer_slug', query.organizer);
  if (query.minRating) request = request.gte('avg_overall', query.minRating);

  const term = query.search ? sanitizeSearchTerm(query.search) : '';
  if (term) {
    request = request.or(`name.ilike.*${term}*,organizer_name.ilike.*${term}*`);
  }

  switch (query.sort) {
    case 'highest':
      // Unrated hackathons have nothing to rank, so they are excluded rather
      // than silently sorted to one end.
      request = request
        .gt('review_count', 0)
        .order('avg_overall', { ascending: false })
        .order('review_count', { ascending: false });
      break;
    case 'lowest':
      request = request
        .gt('review_count', 0)
        .order('avg_overall', { ascending: true })
        .order('review_count', { ascending: false });
      break;
    case 'mostReviewed':
      request = request
        .order('review_count', { ascending: false })
        .order('sort_date', { ascending: false, nullsFirst: false });
      break;
    default:
      request = request.order('sort_date', { ascending: false, nullsFirst: false });
  }

  // Stable tiebreaker so pagination never repeats or drops a row.
  request = request.order('id', { ascending: true });

  const page = Math.max(1, query.page);
  const from = (page - 1) * CATALOG_PAGE_SIZE;
  request = request.range(from, from + CATALOG_PAGE_SIZE - 1);

  const { data, error, count } = await request;
  if (error) throw new Error(`Catalog query failed: ${error.message}`);

  const total = count ?? 0;

  return {
    items: (data ?? []).map(mapHackathonCard),
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / CATALOG_PAGE_SIZE)),
  };
}

export async function getCatalog(query: CatalogQuery): Promise<CatalogResult> {
  const today = todayInTashkent();
  const cached = unstable_cache(
    () => queryCatalog(query, today),
    ['catalog', today, JSON.stringify(query)],
    { revalidate: DEFAULT_REVALIDATE, tags: [CACHE_TAGS.hackathons, CACHE_TAGS.reviews] },
  );
  return cached();
}

export const getHackathonBySlug = unstable_cache(
  async (slug: string): Promise<HackathonCard | null> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from('hackathon_cards')
      .select(CARD_COLUMNS)
      .eq('slug', slug)
      .maybeSingle();

    if (error) throw new Error(`Hackathon query failed: ${error.message}`);
    return data ? mapHackathonCard(data) : null;
  },
  ['hackathon-by-slug'],
  { revalidate: DEFAULT_REVALIDATE, tags: [CACHE_TAGS.hackathons, CACHE_TAGS.reviews] },
);

/** Upcoming rail on the home page, soonest first. */
export async function getUpcomingHackathons(limit = 6): Promise<HackathonCard[]> {
  const today = todayInTashkent();
  const cached = unstable_cache(
    async () => {
      const supabase = createPublicClient();
      const { data, error } = await supabase
        .from('hackathon_cards')
        .select(CARD_COLUMNS)
        .gte('effective_end_date', today)
        .order('effective_start_date', { ascending: true, nullsFirst: false })
        .limit(limit);

      if (error) throw new Error(`Upcoming query failed: ${error.message}`);
      return (data ?? []).map(mapHackathonCard);
    },
    ['upcoming', today, String(limit)],
    { revalidate: DEFAULT_REVALIDATE, tags: [CACHE_TAGS.hackathons, CACHE_TAGS.reviews] },
  );
  return cached();
}

/**
 * Top / bottom rails on the home page. Only hackathons with at least
 * `MIN_REVIEWS_FOR_RANKING` reviews qualify (PRD 7.1), so one angry review
 * cannot put an event at the bottom of the league table.
 */
export const getRankedHackathons = unstable_cache(
  async (direction: 'top' | 'bottom', limit = 3): Promise<HackathonCard[]> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from('hackathon_cards')
      .select(CARD_COLUMNS)
      .gte('review_count', MIN_REVIEWS_FOR_RANKING)
      .order('avg_overall', { ascending: direction === 'bottom' })
      .order('review_count', { ascending: false })
      .limit(limit);

    if (error) throw new Error(`Ranking query failed: ${error.message}`);
    return (data ?? []).map(mapHackathonCard);
  },
  ['ranked-hackathons'],
  { revalidate: DEFAULT_REVALIDATE, tags: [CACHE_TAGS.hackathons, CACHE_TAGS.reviews] },
);

export const getHackathonsByOrganizer = unstable_cache(
  async (organizerSlug: string): Promise<HackathonCard[]> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from('hackathon_cards')
      .select(CARD_COLUMNS)
      .eq('organizer_slug', organizerSlug)
      .order('sort_date', { ascending: false, nullsFirst: false });

    if (error) throw new Error(`Organizer hackathons query failed: ${error.message}`);
    return (data ?? []).map(mapHackathonCard);
  },
  ['organizer-hackathons'],
  { revalidate: DEFAULT_REVALIDATE, tags: [CACHE_TAGS.hackathons, CACHE_TAGS.reviews] },
);

/** Cities that actually have approved hackathons — powers the city filter. */
export const getCityFacets = unstable_cache(
  async (): Promise<Array<{ city: string; count: number }>> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from('hackathon_cities')
      .select('city, hackathon_count');

    if (error) throw new Error(`City facet query failed: ${error.message}`);

    return (data ?? [])
      .filter((row): row is { city: string; hackathon_count: number } => Boolean(row.city))
      .map((row) => ({ city: row.city, count: row.hackathon_count ?? 0 }));
  },
  ['city-facets'],
  { revalidate: DEFAULT_REVALIDATE, tags: [CACHE_TAGS.hackathons] },
);

export const getOrganizerFacets = unstable_cache(
  async (): Promise<Array<{ slug: string; name: string }>> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from('organizer_cards')
      .select('slug, name, hackathon_count')
      .gt('hackathon_count', 0)
      .order('name', { ascending: true });

    if (error) throw new Error(`Organizer facet query failed: ${error.message}`);

    return (data ?? [])
      .filter((row): row is { slug: string; name: string; hackathon_count: number } =>
        Boolean(row.slug && row.name),
      )
      .map((row) => ({ slug: row.slug, name: row.name }));
  },
  ['organizer-facets'],
  { revalidate: DEFAULT_REVALIDATE, tags: [CACHE_TAGS.hackathons, CACHE_TAGS.organizers] },
);

/** Every approved slug — used by sitemap.xml and generateStaticParams. */
export const getAllHackathonSlugs = unstable_cache(
  async (): Promise<Array<{ slug: string; updatedAt: string }>> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from('hackathon_cards')
      .select('slug, created_at')
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Slug query failed: ${error.message}`);

    return (data ?? [])
      .filter((row): row is { slug: string; created_at: string } => Boolean(row.slug))
      .map((row) => ({ slug: row.slug, updatedAt: row.created_at }));
  },
  ['hackathon-slugs'],
  { revalidate: 300, tags: [CACHE_TAGS.hackathons] },
);
