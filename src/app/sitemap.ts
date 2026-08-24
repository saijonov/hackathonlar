import { type MetadataRoute } from 'next';
import { LOCALE_HTML_LANG, routing } from '@/i18n/routing';
import { absoluteUrl, localizedPath } from '@/lib/seo';
import { getAllHackathonSlugs } from '@/lib/queries/hackathons';
import { getAllOrganizerSlugs } from '@/lib/queries/organizers';

export const revalidate = 3600;

/**
 * sitemap.xml covering every approved hackathon and organizer in all three
 * locales, with hreflang alternates so Google understands they are the same
 * page (PRD 10 / 11).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [hackathons, organizerSlugs] = await Promise.all([
    getAllHackathonSlugs(),
    getAllOrganizerSlugs(),
  ]);

  const alternatesFor = (path: string) => ({
    languages: Object.fromEntries(
      routing.locales.map((locale) => [
        LOCALE_HTML_LANG[locale],
        absoluteUrl(localizedPath(locale, path)),
      ]),
    ),
  });

  const entry = (
    path: string,
    options: { priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']; lastModified?: string },
  ): MetadataRoute.Sitemap =>
    routing.locales.map((locale) => ({
      url: absoluteUrl(localizedPath(locale, path)),
      lastModified: options.lastModified ? new Date(options.lastModified) : new Date(),
      changeFrequency: options.changeFrequency,
      priority: options.priority,
      alternates: alternatesFor(path),
    }));

  return [
    ...entry('', { priority: 1, changeFrequency: 'daily' }),
    ...entry('/hackathons', { priority: 0.9, changeFrequency: 'daily' }),
    ...entry('/organizers', { priority: 0.8, changeFrequency: 'weekly' }),
    ...entry('/rules', { priority: 0.4, changeFrequency: 'monthly' }),
    ...entry('/about', { priority: 0.4, changeFrequency: 'monthly' }),
    ...entry('/submit', { priority: 0.5, changeFrequency: 'monthly' }),
    ...hackathons.flatMap(({ slug, updatedAt }) =>
      entry(`/hackathons/${slug}`, {
        priority: 0.8,
        changeFrequency: 'weekly',
        lastModified: updatedAt,
      }),
    ),
    ...organizerSlugs.flatMap((slug) =>
      entry(`/organizers/${slug}`, { priority: 0.7, changeFrequency: 'weekly' }),
    ),
  ];
}
