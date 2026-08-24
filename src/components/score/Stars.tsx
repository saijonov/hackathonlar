import { Star } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { BAND_CLASSES, MAX_RATING, scoreBand, starFractions, toScore } from '@/lib/score';

interface StarsProps {
  /** 0–5. `null` renders an empty, muted row. */
  value: number | string | null | undefined;
  size?: number;
  className?: string;
  /**
   * Accessible label, e.g. "4.2 / 5". Required unless the surrounding element
   * already announces the score (then pass `decorative`).
   */
  label?: string;
  decorative?: boolean;
  /** Force a colour instead of deriving it from the score band. */
  tone?: 'band' | 'ink';
}

/**
 * Five stars with fractional fill — part of the signature `<ScoreMark>` but
 * usable on its own.
 *
 * PRD 9.5: stars always carry a text alternative; colour is never the only
 * carrier of meaning, which is why a `<ScoreMark>` shows the number too.
 */
export function Stars({
  value,
  size = 14,
  className,
  label,
  decorative = false,
  tone = 'band',
}: StarsProps) {
  const fractions = starFractions(value);
  const hasValue = toScore(value) !== null;
  const fillClass =
    tone === 'ink' ? 'text-ink' : BAND_CLASSES[hasValue ? scoreBand(value) : 'none'].text;

  return (
    <span
      className={cn('inline-flex shrink-0 items-center gap-[2px] align-middle', className)}
      {...(decorative
        ? { 'aria-hidden': true }
        : { role: 'img', 'aria-label': label ?? `${toScore(value) ?? 0} / ${MAX_RATING}` })}
    >
      {fractions.map((fraction, index) => (
        <span
          key={index}
          className="relative inline-block shrink-0"
          style={{ width: size, height: size }}
        >
          <Star
            size={size}
            strokeWidth={1.5}
            className="absolute inset-0 text-line-2"
            fill="none"
            aria-hidden
          />
          {fraction > 0 && (
            <span
              className="absolute inset-y-0 left-0 overflow-hidden"
              style={{ width: `${fraction * 100}%` }}
            >
              <Star
                size={size}
                strokeWidth={1.5}
                className={cn('absolute inset-y-0 left-0 max-w-none', fillClass)}
                fill="currentColor"
                aria-hidden
              />
            </span>
          )}
        </span>
      ))}
    </span>
  );
}
