'use client';

import { useTranslations } from 'next-intl';
import { LogIn } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { Button } from '@/components/ui/Button';

/**
 * Shown in place of an auth-only page's content. Deliberately not a redirect:
 * the user keeps their URL, so signing in leaves them exactly where they meant
 * to be rather than on the homepage (PRD 6).
 */
export function SignInPrompt({ reason }: { reason?: string }) {
  const t = useTranslations('auth');
  const { openAuth } = useAuth();

  return (
    <div className="rounded-lg border border-line bg-surface p-8 text-center">
      <span className="mx-auto grid size-12 place-items-center rounded-full bg-accent-soft text-accent">
        <LogIn size={22} strokeWidth={1.75} aria-hidden />
      </span>
      <h1 className="mt-4 text-h1 text-ink">{t('modalTitle')}</h1>
      <p className="mx-auto mt-2 max-w-sm text-body text-ink-3">{reason ?? t('modalSubtitle')}</p>
      <Button className="mt-6" onClick={() => openAuth({ reason })} data-testid="prompt-signin">
        {t('signIn')}
      </Button>
    </div>
  );
}
