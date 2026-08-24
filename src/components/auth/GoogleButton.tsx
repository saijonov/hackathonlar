'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';

interface GoogleButtonProps {
  onError: (message: string) => void;
}

/** Google's brand mark. Not a Lucide icon and not an emoji — it must be the
 *  real logo to be recognisable, so it is inlined as SVG. */
function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden className="shrink-0">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.46 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  );
}

/**
 * Google OAuth. Credentials are supplied by a human (README "Manual steps");
 * the flow itself is complete either way. If the provider is not configured,
 * Supabase answers "provider is not enabled" and we surface that as localized
 * copy rather than a dead button.
 */
export function GoogleButton({ onError }: GoogleButtonProps) {
  const t = useTranslations('auth');
  const pathname = usePathname();
  const [pending, setPending] = useState(false);

  const handleClick = async () => {
    setPending(true);
    try {
      const supabase = createClient();
      const next = encodeURIComponent(pathname || '/');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${next}`,
          queryParams: { prompt: 'select_account' },
        },
      });
      if (error) {
        onError(
          error.message.toLowerCase().includes('not enabled')
            ? t('googleUnavailable')
            : t('errors.generic'),
        );
        setPending(false);
      }
      // On success the browser is navigating away; keep the spinner.
    } catch {
      onError(t('errors.generic'));
      setPending(false);
    }
  };

  return (
    <Button
      type="button"
      variant="secondary"
      loading={pending}
      onClick={() => void handleClick()}
      className="w-full"
      data-testid="google-signin"
    >
      {!pending && <GoogleMark />}
      {t('google')}
    </Button>
  );
}
