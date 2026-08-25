'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { LogOut, Menu, Plus, Shield, User as UserIcon, X } from 'lucide-react';
import { Link, usePathname } from '@/i18n/navigation';
import { Wordmark } from '@/components/brand/Wordmark';
import { Avatar } from '@/components/ui/Avatar';
import { Button, buttonClasses } from '@/components/ui/Button';
import { useAuth } from '@/components/auth/AuthProvider';
import { cn } from '@/lib/utils/cn';
import { LocaleSwitcher } from './LocaleSwitcher';

const NAV_LINKS = [
  { href: '/hackathons', key: 'hackathons' },
  { href: '/organizers', key: 'organizers' },
  { href: '/about', key: 'about' },
  { href: '/rules', key: 'rules' },
] as const;

/**
 * The masthead. A thin accent rule, the wordmark, plain nav links with an
 * underline indicator for the active section, then locale + account.
 *
 * Nothing floats, nothing blurs: it is a sheet of paper with a hairline under
 * it (docs/design-system.md §4.2).
 */
export function SiteHeader() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const { isAuthenticated, isAdmin, profile, openAuth, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  // Close both menus on navigation.
  useEffect(() => {
    setMenuOpen(false);
    setAccountOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!accountOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setAccountOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setAccountOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [accountOpen]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur-[2px]">
      <div aria-hidden className="h-[3px] w-full bg-accent" />

      <div className="container-page flex h-16 items-center gap-3">
        <Link
          href="/"
          className="inline-flex min-h-11 shrink-0 items-center rounded-sm"
          aria-label="hackathonlar.uz"
        >
          <Wordmark size="md" />
        </Link>

        <nav aria-label={t('home')} className="ml-4 hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? 'page' : undefined}
              className={cn(
                'relative rounded-sm px-3 py-2 text-body font-medium transition-colors',
                isActive(link.href) ? 'text-ink' : 'text-ink-3 hover:text-ink',
              )}
            >
              {t(link.key)}
              {isActive(link.href) && (
                <span aria-hidden className="absolute inset-x-3 -bottom-px h-0.5 bg-accent" />
              )}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <LocaleSwitcher className="hidden sm:flex" />

          <Link href="/submit" className={buttonClasses('secondary', 'sm', 'hidden lg:inline-flex')}>
            <Plus size={16} strokeWidth={2} aria-hidden />
            {t('submit')}
          </Link>

          {isAuthenticated ? (
            <div ref={accountRef} className="relative">
              <button
                type="button"
                onClick={() => setAccountOpen((value) => !value)}
                aria-expanded={accountOpen}
                aria-haspopup="menu"
                className="grid grid-cols-1 size-11 place-items-center rounded-md transition-colors hover:bg-paper-2"
              >
                <span className="sr-only">{t('profile')}</span>
                <Avatar
                  name={profile?.displayName ?? '?'}
                  src={profile?.avatarUrl}
                  size={30}
                />
              </button>

              {accountOpen && (
                <div
                  role="menu"
                  className="animate-fade-rise absolute right-0 top-full z-50 mt-1.5 w-56 overflow-hidden rounded-lg border-2 border-ink bg-surface shadow-pop"
                >
                  <p className="truncate border-b border-line px-3 py-2.5 text-meta text-ink-3">
                    {profile?.displayName}
                  </p>
                  <Link
                    href="/profile"
                    role="menuitem"
                    className="flex h-11 items-center gap-2.5 px-3 text-body text-ink-2 transition-colors hover:bg-paper-2 hover:text-ink"
                  >
                    <UserIcon size={17} strokeWidth={1.75} aria-hidden />
                    {t('profile')}
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      role="menuitem"
                      className="flex h-11 items-center gap-2.5 px-3 text-body text-ink-2 transition-colors hover:bg-paper-2 hover:text-ink"
                    >
                      <Shield size={17} strokeWidth={1.75} aria-hidden />
                      {t('admin')}
                    </Link>
                  )}
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => void signOut()}
                    className="flex h-11 w-full items-center gap-2.5 border-t border-line px-3 text-left text-body text-ink-2 transition-colors hover:bg-paper-2 hover:text-ink"
                  >
                    <LogOut size={17} strokeWidth={1.75} aria-hidden />
                    {t('signOut')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Button
              size="sm"
              variant="primary"
              onClick={() => openAuth()}
              className="hidden sm:inline-flex"
              data-testid="header-signin"
            >
              {t('signIn')}
            </Button>
          )}

          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="grid grid-cols-1 size-11 place-items-center rounded-md text-ink transition-colors hover:bg-paper-2 lg:hidden"
          >
            <span className="sr-only">{menuOpen ? t('closeMenu') : t('openMenu')}</span>
            {menuOpen ? <X size={22} aria-hidden /> : <Menu size={22} aria-hidden />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div
          id="mobile-menu"
          className="animate-fade-rise border-t border-line bg-surface lg:hidden"
        >
          <div className="container-page grid grid-cols-1 gap-1 py-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? 'page' : undefined}
                className={cn(
                  'flex h-11 items-center rounded-md px-3 text-body font-medium transition-colors',
                  isActive(link.href)
                    ? 'bg-accent-soft text-accent-ink'
                    : 'text-ink-2 hover:bg-paper-2',
                )}
              >
                {t(link.key)}
              </Link>
            ))}

            <Link href="/submit" className={buttonClasses('secondary', 'md', 'mt-2 justify-start')}>
              <Plus size={16} aria-hidden />
              {t('submit')}
            </Link>

            {!isAuthenticated && (
              <Button
                className="mt-1 justify-start"
                onClick={() => {
                  setMenuOpen(false);
                  openAuth();
                }}
              >
                {t('signIn')}
              </Button>
            )}

            <div className="mt-3 border-t border-line pt-3">
              <p className="eyebrow mb-1.5 px-3 text-ink-3">{t('language')}</p>
              <LocaleSwitcher variant="stacked" />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
