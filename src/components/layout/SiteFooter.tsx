import { useTranslations } from 'next-intl';
import { Send } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { Wordmark } from '@/components/brand/Wordmark';
import { LocaleSwitcher } from './LocaleSwitcher';

const TELEGRAM_URL = 'https://t.me/hackathonlar_uz';

export function SiteFooter() {
  const t = useTranslations('footer');
  const tNav = useTranslations('nav');
  const year = 2026;

  return (
    <footer className="mt-auto border-t border-line bg-paper-2/50">
      <div className="container-page grid grid-cols-1 gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:gap-8">
        <div className="max-w-xs">
          <Wordmark size="md" />
          <p className="mt-3 text-meta leading-relaxed text-ink-3">{t('tagline')}</p>
        </div>

        <nav aria-labelledby="footer-explore">
          <p id="footer-explore" className="eyebrow mb-3 text-ink-3">
            {t('sections.explore')}
          </p>
          <ul className="grid grid-cols-1 gap-2 text-meta">
            <li>
              <Link href="/hackathons" className="text-ink-2 hover:text-accent hover:underline">
                {tNav('hackathons')}
              </Link>
            </li>
            <li>
              <Link href="/organizers" className="text-ink-2 hover:text-accent hover:underline">
                {tNav('organizers')}
              </Link>
            </li>
            <li>
              <Link href="/submit" className="text-ink-2 hover:text-accent hover:underline">
                {tNav('submit')}
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-labelledby="footer-project">
          <p id="footer-project" className="eyebrow mb-3 text-ink-3">
            {t('sections.project')}
          </p>
          <ul className="grid grid-cols-1 gap-2 text-meta">
            <li>
              <Link href="/about" className="text-ink-2 hover:text-accent hover:underline">
                {tNav('about')}
              </Link>
            </li>
            <li>
              <Link href="/rules" className="text-ink-2 hover:text-accent hover:underline">
                {tNav('rules')}
              </Link>
            </li>
            <li>
              <a
                href={TELEGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-ink-2 hover:text-accent hover:underline"
              >
                <Send size={14} strokeWidth={1.75} aria-hidden />
                {t('contact')}
              </a>
            </li>
          </ul>
        </nav>

        <div>
          <p className="eyebrow mb-3 text-ink-3">{t('sections.language')}</p>
          <LocaleSwitcher variant="stacked" />
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-page flex flex-wrap items-center justify-between gap-3 py-5 text-meta text-ink-3">
          <p>
            © {year} hackathonlar.uz · {t('rights')}
          </p>
          <p className="font-display font-semibold text-ink-2">{t('madeIn')}</p>
        </div>
      </div>
    </footer>
  );
}
