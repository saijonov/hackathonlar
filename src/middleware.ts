import createIntlMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { isAppLocale, routing } from '@/i18n/routing';
import { updateSession } from '@/lib/supabase/middleware';

const handleI18nRouting = createIntlMiddleware(routing);

const LOCALE_COOKIE = 'NEXT_LOCALE';

function hasLocalePrefix(pathname: string): boolean {
  return routing.locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Locale detection is off in the routing config so that "/" always resolves
  // to Uzbek rather than to whatever Accept-Language says. The one thing we do
  // still honour is an *explicit* choice the visitor made with the switcher,
  // which next-intl persisted in NEXT_LOCALE.
  if (!hasLocalePrefix(pathname)) {
    const preferred = request.cookies.get(LOCALE_COOKIE)?.value;
    if (preferred && isAppLocale(preferred) && preferred !== routing.defaultLocale) {
      const url = request.nextUrl.clone();
      url.pathname = `/${preferred}${pathname === '/' ? '' : pathname}`;
      return NextResponse.redirect(url);
    }
  }

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
