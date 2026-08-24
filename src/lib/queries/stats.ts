import 'server-only';

import { unstable_cache } from 'next/cache';
import { type PlatformStats } from '@/lib/types';
import { mapPlatformStats } from './mappers';
import { CACHE_TAGS, DEFAULT_REVALIDATE, createPublicClient } from './public-client';

/** Live numbers for the home hero strip (PRD 7.1) — real, never hardcoded. */
export const getPlatformStats = unstable_cache(
  async (): Promise<PlatformStats> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase.from('platform_stats').select('*').maybeSingle();

    if (error) throw new Error(`Platform stats query failed: ${error.message}`);
    return mapPlatformStats(data);
  },
  ['platform-stats'],
  { revalidate: DEFAULT_REVALIDATE, tags: [CACHE_TAGS.stats, CACHE_TAGS.reviews, CACHE_TAGS.hackathons] },
);
