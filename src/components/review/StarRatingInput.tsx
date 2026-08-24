'use client';

import { useId, useState } from 'react';
import { Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { MAX_RATING } from '@/lib/score';
import { cn } from '@/lib/utils/cn';

interface StarRatingInputProps {
  name: string;
  label: string;
  hint?: string;
  value: number | null;
  onChange: (value: number) => void;
  error?: string | null;
  disabled?: boolean;
}

/**
 * One category row of the review form (PRD 7.4): a label, a one-line explainer
 * of what the category actually measures, and five tappable stars.
 *
 * Built on real radio inputs inside a fieldset/legend rather than divs with
 * click handlers, so arrow keys, screen readers and native form semantics all
 * work for free. Each star is a 44px tap target (PRD 9.4).
 */
export function StarRatingInput({
  name,
  label,
  hint,
  value,
  onChange,
  error,
  disabled = false,
}: StarRatingInputProps) {
  const t = useTranslations('score');
  const groupId = useId();
  const [hovered, setHovered] = useState<number | null>(null);

  const shown = hovered ?? value ?? 0;

  return (
    <fieldset
      className={cn(
        'rounded-lg border bg-surface p-3.5 transition-colors sm:p-4',
        error ? 'border-bad' : 'border-line',
      )}
      disabled={disabled}
    >
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-0 flex-1">
          <legend className="float-left text-h3 text-ink">{label}</legend>
          {hint && <p className="clear-left pt-1 text-meta leading-relaxed text-ink-3">{hint}</p>}
        </div>

        <div
          className="flex shrink-0 items-center"
          onMouseLeave={() => setHovered(null)}
          role="radiogroup"
          aria-labelledby={groupId}
        >
          <span id={groupId} className="sr-only">
            {label}
          </span>

          {Array.from({ length: MAX_RATING }, (_, index) => {
            const starValue = index + 1;
            const active = starValue <= shown;

            return (
              <label
                key={starValue}
                className="grid size-11 cursor-pointer place-items-center rounded-md transition-colors hover:bg-paper-2"
                onMouseEnter={() => setHovered(starValue)}
              >
                <input
                  type="radio"
                  name={name}
                  value={starValue}
                  checked={value === starValue}
                  onChange={() => onChange(starValue)}
                  className="peer sr-only"
                  aria-label={t('outOf', { score: String(starValue) })}
                />
                <Star
                  size={26}
                  strokeWidth={1.5}
                  aria-hidden
                  className={cn(
                    'transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent',
                    active ? 'fill-mid text-mid' : 'text-line-2',
                  )}
                />
              </label>
            );
          })}

          <span
            aria-hidden
            className={cn(
              'ml-1.5 w-5 text-center font-display text-h3 font-bold tabular-nums',
              value ? 'text-ink' : 'text-line-2',
            )}
          >
            {value ?? '—'}
          </span>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-2 text-meta font-medium text-bad">
          {error}
        </p>
      )}
    </fieldset>
  );
}
