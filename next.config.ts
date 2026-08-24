import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const supabaseHost = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://127.0.0.1:54321').hostname;
  } catch {
    return '127.0.0.1';
  }
})();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: supabaseHost },
      { protocol: 'http', hostname: '127.0.0.1' },
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  eslint: {
    dirs: ['src', 'tests'],
  },
  /**
   * Emit metadata into <head> for every user agent, not just the ones Next
   * classifies as "HTML-limited".
   *
   * Next 15 streams metadata by default: <title>, the description, the
   * canonical link and all OpenGraph tags are flushed *after* </head> and
   * hoisted into place by React on the client. JS-capable crawlers cope, and
   * the default bot list covers the big social scrapers — but anything else
   * (and Lighthouse, which scored SEO 91 with "Document does not have a meta
   * description") sees a document whose metadata sits in <body>.
   *
   * For a site whose entire value is being findable and shareable that is the
   * wrong trade. Matching every UA makes metadata blocking again; the cost is
   * nil here because every public page is prerendered, so generateMetadata has
   * already run at build time.
   */
  htmlLimitedBots: /.*/,
  experimental: {
    /**
     * Inline the stylesheet instead of linking it.
     *
     * Lighthouse named the single render-blocking <link rel="stylesheet"> as
     * the largest remaining cost on mobile: "Est savings of 1,050 ms" on
     * simulated slow 4G. The stylesheet is ~10KB — small enough that inlining
     * it is a clear win, and it removes a round trip from the critical path
     * entirely.
     */
    inlineCss: true,
  },
  // The OG routes read these WOFF files from disk at render time; without this
  // they are not traced into the serverless bundle and the route 500s in prod.
  outputFileTracingIncludes: {
    '/opengraph-image': ['./src/assets/fonts/**'],
    '/[locale]/hackathons/[slug]/opengraph-image': ['./src/assets/fonts/**'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
