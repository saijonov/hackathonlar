import { useTranslations } from 'next-intl';
import { relativeTimeParts } from '@/lib/format';

interface TimeAgoProps {
  date: string;
  className?: string;
}

/**
 * "3 kun oldin" / "3 дня назад" / "3 days ago".
 *
 * Renders from our own message catalogue rather than `Intl.RelativeTimeFormat`,
 * because Chromium has no Uzbek data and would render "-3 d" (see lib/format.ts).
 * `suppressHydrationWarning` covers the case where the server render and a
 * later client render straddle a minute boundary — the machine-readable value
 * in `dateTime` is always exact.
 */
export function TimeAgo({ date, className }: TimeAgoProps) {
  const t = useTranslations('time');
  const parts = relativeTimeParts(date);
  if (!parts) return null;

  const label = parts.key === 'justNow' ? t('justNow') : t(parts.key, { count: parts.count });

  return (
    <time dateTime={date} className={className} suppressHydrationWarning>
      {label}
    </time>
  );
}
