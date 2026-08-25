import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { type OrganizerCard as OrganizerCardModel } from '@/lib/types';
import { cn } from '@/lib/utils/cn';
import { Monogram } from '@/components/brand/Monogram';
import { ScoreMark } from '@/components/score/ScoreMark';

interface OrganizerCardProps {
  organizer: OrganizerCardModel;
  className?: string;
}

/** One row of the organizer scoreboard (PRD 7.6). */
export function OrganizerCard({ organizer, className }: OrganizerCardProps) {
  const t = useTranslations('organizer');

  return (
    <article className={cn('h-full', className)}>
      <Link
        href={`/organizers/${organizer.slug}`}
        className="card-lift group block h-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <div className="panel notch-br flex h-full flex-col gap-4 p-4">
        <div className="flex min-w-0 items-center gap-3">
          <Monogram name={organizer.name} slug={organizer.slug} size={44} />
          <div className="min-w-0">
            <h2 className="line-clamp-2 text-h3 text-ink transition-colors group-hover:text-accent">
              {organizer.name}
            </h2>
            <p className="mt-0.5 text-meta text-ink-3">
              {t('hackathons', { count: organizer.hackathonCount })}
            </p>
          </div>
        </div>

        <div className="mt-auto border-t border-line pt-3">
          <ScoreMark
            score={organizer.overall}
            reviewCount={organizer.reviewCount}
            size="sm"
          />
        </div>
        </div>
      </Link>
    </article>
  );
}
