import createIntlMiddleware from 'next-intl/middleware';
import { type NextRequest } from 'next/server';
import { routing } from '@/i18n/routing';
import { updateSession } from '@/lib/supabase/middleware';

const handleI18nRouting = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
  // next-intl first: it owns redirects (`/` -> `/uz`), locale detection and the
  // NEXT_LOCALE cookie. Whatever response it produces (rewrite or redirect) is
  // then handed to Supabase so refreshed auth cookies ride along with it.
  const response = handleI18nRouting(request);

  // Skip the auth round-trip entirely for visitors who have never signed in —
  // that is most of our traffic, and it saves a network call per request.
  const hasAuthCookie = request.cookies
    .getAll()
    .some((cookie) => cookie.name.startsWith('sb-') && cookie.name.includes('auth-token'));

  if (!hasAuthCookie) return response;

  return updateSession(request, response);
}

export const config = {
  matcher: [
    /*
     * Everything except:
     *   - /api and /auth      (route handlers; must not be locale-prefixed)
     *   - /opengraph-image     (the site-wide OG card; a locale prefix would
     *                           break the URL crawlers already have)
     *   - /_next, /_vercel    (framework internals)
     *   - anything with a dot (static files: /favicon.ico, /brand/logo.svg…)
     */
    '/((?!api|auth|opengraph-image|_next|_vercel|.*\\..*).*)',
  ],
};
