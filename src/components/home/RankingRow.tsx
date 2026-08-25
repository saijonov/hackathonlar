import { Link } from '@/i18n/navigation';
import { type HackathonCard as HackathonCardModel } from '@/lib/types';
import { ScoreMark } from '@/components/score/ScoreMark';
import { Monogram } from '@/components/brand/Monogram';

interface RankingRowProps {
  hackathon: HackathonCardModel;
  rank: number;
}

/**
 * A league-table row for the home page's top / lowest rated split (PRD 7.1).
 * Deliberately denser than a card: this section is about the ordering, so the
 * rank number and the score are the only things that get visual weight.
 */
export function RankingRow({ hackathon, rank }: RankingRowProps) {
  return (
    <Link
      href={`/hackathons/${hackathon.slug}`}
      className="card-lift group flex items-center gap-4 rounded-lg border-2 border-ink bg-surface p-3.5"
    >
      <span
        aria-hidden
        className="w-8 shrink-0 text-center font-display text-h1 font-extrabold leading-none tabular-nums text-numeral"
      >
        {rank}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-h3 text-ink transition-colors group-hover:text-accent">
          {hackathon.name}
        </p>
        {hackathon.organizer && (
          <p className="mt-1 flex min-w-0 items-center gap-1.5 text-meta text-ink-3">
            <Monogram
              name={hackathon.organizer.name}
              slug={hackathon.organizer.slug}
              size={16}
              className="rounded-xs"
            />
            <span className="truncate">{hackathon.organizer.name}</span>
          </p>
        )}
      </div>

      <ScoreMark
        score={hackathon.score.overall}
        reviewCount={hackathon.score.reviewCount}
        size="sm"
        showStars={false}
        className="shrink-0"
      />
    </Link>
  );
}
