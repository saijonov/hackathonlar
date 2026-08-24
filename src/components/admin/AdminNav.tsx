'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils/cn';

const TABS = [
  { href: '/admin', key: 'queue' },
  { href: '/admin/reviews', key: 'reviews' },
  { href: '/admin/hackathons', key: 'hackathons' },
  { href: '/admin/organizers', key: 'organizers' },
  { href: '/admin/reports', key: 'reports' },
] as const;

export function AdminNav({
  pendingCount,
  reportCount,
}: {
  pendingCount: number;
  reportCount: number;
}) {
  const t = useTranslations('admin.nav');
  const pathname = usePathname();

  const badgeFor = (key: string) =>
    key === 'queue' ? pendingCount : key === 'reports' ? reportCount : 0;

  return (
    <nav
      aria-label={t('queue')}
      className="mt-5 flex gap-1 overflow-x-auto border-b border-line pb-px"
    >
      {TABS.map((tab) => {
        const active = tab.href === '/admin' ? pathname === '/admin' : pathname.startsWith(tab.href);
        const count = badgeFor(tab.key);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'relative flex shrink-0 items-center gap-1.5 whitespace-nowrap px-3 py-2.5 text-meta font-semibold transition-colors',
              active ? 'text-ink' : 'text-ink-3 hover:text-ink',
            )}
          >
            {t(tab.key)}
            {count > 0 && (
              <span className="grid min-w-5 place-items-center rounded-full bg-bad px-1.5 text-[11px] font-bold tabular-nums text-white">
                {count}
              </span>
            )}
            {active && <span aria-hidden className="absolute inset-x-2 -bottom-px h-0.5 bg-accent" />}
          </Link>
        );
      })}
    </nav>
  );
}
