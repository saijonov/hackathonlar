import { type ReactNode } from 'react';
import { type Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getSessionUser } from '@/lib/auth/session';
import { getAdminOverview } from '@/lib/queries/admin';
import { SignInPrompt } from '@/components/auth/SignInPrompt';
import { AdminNav } from '@/components/admin/AdminNav';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

type LayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

/**
 * Server-side admin gate (PRD 7.8: "role = 'admin' only; server-side
 * guarded").
 *
 * The check reads `profiles.role` from the database on every request — client
 * state is never consulted. Even if this layout were bypassed, every admin
 * action re-runs `requireAdmin()` and every admin view gates itself on
 * `has_admin_access()` in SQL.
 */
export default async function AdminLayout({ children, params }: LayoutProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('admin');
  const user = await getSessionUser();

  if (!user) {
    return (
      <div className="container-page max-w-xl py-16">
        <SignInPrompt reason={t('notAuthorized')} />
      </div>
    );
  }

  if (user.profile?.role !== 'admin') {
    return (
      <div className="container-page max-w-xl py-16">
        <div className="rounded-lg border border-bad/30 bg-bad-soft p-8 text-center">
          <h1 className="text-h1 text-bad">{t('notAuthorized')}</h1>
        </div>
      </div>
    );
  }

  const overview = await getAdminOverview();

  return (
    <div className="container-page py-6 md:py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-accent">{t('title')}</p>
          <h1 className="mt-1.5 text-h1 text-ink">{user.profile.displayName}</h1>
        </div>

        <dl className="flex flex-wrap gap-x-6 gap-y-2 text-meta">
          {(
            [
              ['pending', overview.pendingCount],
              ['reports', overview.openReportCount],
              ['reviews', overview.reviewCount],
              ['hackathons', overview.hackathonCount],
            ] as const
          ).map(([key, value]) => (
            <div key={key}>
              <dt className="text-ink-3">{t(`overview.${key}`)}</dt>
              <dd className="font-display text-h2 tabular-nums text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      </header>

      <AdminNav pendingCount={overview.pendingCount} reportCount={overview.openReportCount} />

      <div className="mt-6">{children}</div>
    </div>
  );
}
