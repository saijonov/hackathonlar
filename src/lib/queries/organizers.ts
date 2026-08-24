import 'server-only';

import { unstable_cache } from 'next/cache';
import { type OrganizerCard } from '@/lib/types';
import { mapOrganizerCard } from './mappers';
import { CACHE_TAGS, DEFAULT_REVALIDATE, createPublicClient } from './public-client';

export const getOrganizerCards = unstable_cache(
  async (): Promise<OrganizerCard[]> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from('organizer_cards')
      .select('*')
      // Organizers with no approved hackathon have nothing to be accountable
      // for yet, so they stay off the scoreboard.
      .gt('hackathon_count', 0)
      .order('avg_overall', { ascending: false, nullsFirst: false })
      .order('hackathon_count', { ascending: false })
      .order('name', { ascending: true });

    if (error) throw new Error(`Organizers query failed: ${error.message}`);
    return (data ?? []).map(mapOrganizerCard);
  },
  ['organizer-cards'],
  { revalidate: DEFAULT_REVALIDATE, tags: [CACHE_TAGS.organizers, CACHE_TAGS.reviews] },
);

export const getOrganizerBySlug = unstable_cache(
  async (slug: string): Promise<OrganizerCard | null> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from('organizer_cards')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error) throw new Error(`Organizer query failed: ${error.message}`);
    return data ? mapOrganizerCard(data) : null;
  },
  ['organizer-by-slug'],
  { revalidate: DEFAULT_REVALIDATE, tags: [CACHE_TAGS.organizers, CACHE_TAGS.reviews] },
);

export const getAllOrganizerSlugs = unstable_cache(
  async (): Promise<string[]> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from('organizer_cards')
      .select('slug, hackathon_count')
      .gt('hackathon_count', 0);

    if (error) throw new Error(`Organizer slug query failed: ${error.message}`);
    return (data ?? []).map((row) => row.slug).filter((slug): slug is string => Boolean(slug));
  },
  ['organizer-slugs'],
  { revalidate: 300, tags: [CACHE_TAGS.organizers] },
);

/** Organizer picker on /submit — searchable by name. */
export async function searchOrganizers(term: string, limit = 8) {
  const supabase = createPublicClient();
  const clean = term.trim().replace(/[,.()*\\%"']/g, ' ').trim();

  let request = supabase.from('organizers').select('id, slug, name, logo_url').limit(limit);
  if (clean) request = request.ilike('name', `%${clean}%`);
  request = request.order('name', { ascending: true });

  const { data, error } = await request;
  if (error) throw new Error(`Organizer search failed: ${error.message}`);
  return data ?? [];
}
