import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { routing } from '@/i18n/routing';

/**
 * OAuth / PKCE landing point.
 *
 * Deliberately NOT locale-prefixed (the middleware matcher excludes `/auth`)
 * because the redirect URI registered in Google Cloud Console must be a single
 * stable URL. The locale is carried in `next` and restored on the way out.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next');
  const errorDescription = searchParams.get('error_description');

  const safeNext = sanitizeNext(next);

  if (errorDescription) {
    return NextResponse.redirect(`${origin}${safeNext}?auth_error=oauth`);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}${safeNext}?auth_error=missing_code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}${safeNext}?auth_error=exchange`);
  }

  return NextResponse.redirect(`${origin}${safeNext}`);
}

/**
 * Open-redirect guard: only same-origin absolute paths are accepted, and the
 * result is always locale-prefixed so the user lands on a real route.
 */
function sanitizeNext(value: string | null): string {
  const fallback = `/${routing.defaultLocale}`;
  if (!value) return fallback;
  // Reject protocol-relative ("//evil.com") and absolute URLs outright.
  if (!value.startsWith('/') || value.startsWith('//')) return fallback;

  const [firstSegment] = value.slice(1).split('/');
  if (firstSegment && (routing.locales as readonly string[]).includes(firstSegment)) {
    return value;
  }
  return `${fallback}${value === '/' ? '' : value}`;
}
