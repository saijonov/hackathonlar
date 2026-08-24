import { type MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Auth-only and form routes carry nothing a search engine should index,
        // and /auth is a bare callback handler.
        disallow: ['/api/', '/auth/', '/*/admin', '/*/profile', '/*/hackathons/*/review'],
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: absoluteUrl(),
  };
}
