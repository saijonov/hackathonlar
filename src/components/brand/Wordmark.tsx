import { cn } from '@/lib/utils/cn';

interface WordmarkProps {
  className?: string;
  /** Hide the text and render only the score-chip mark (mobile, favicon-ish). */
  markOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const SIZES = {
  sm: { mark: 'size-6 rounded-[6px]', text: 'text-[15px]', star: 12 },
  md: { mark: 'size-7 rounded-[7px]', text: 'text-[17px]', star: 14 },
  lg: { mark: 'size-10 rounded-[10px]', text: 'text-[26px]', star: 20 },
} as const;

/**
 * The wordmark (docs/design-system.md §8): the score-chip mark — an accent
 * square holding the same star that scores the whole site — followed by
 * "hackathonlar" in ink with ".uz" in the accent.
 *
 * Drawn as markup rather than an <img> so it inherits the page's webfont and
 * stays crisp at any size. public/brand/wordmark.svg is the standalone copy
 * used for the OG image and external embeds.
 */
export function Wordmark({ className, markOnly = false, size = 'md' }: WordmarkProps) {
  const styles = SIZES[size];

  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span
        aria-hidden
        className={cn('grid grid-cols-1 shrink-0 place-items-center bg-accent', styles.mark)}
      >
        <svg
          viewBox="0 0 24 24"
          width={styles.star}
          height={styles.star}
          fill="#fff"
          aria-hidden
          className="shrink-0"
        >
          <path d="M12 2.6l2.83 5.73 6.32.92-4.57 4.46 1.08 6.3L12 17.03l-5.66 2.98 1.08-6.3L2.85 9.25l6.32-.92z" />
        </svg>
      </span>
      {!markOnly && (
        <span
          className={cn(
            'font-display font-bold leading-none tracking-[-0.04em] text-ink',
            styles.text,
          )}
        >
          hackathonlar<span className="text-accent">.uz</span>
        </span>
      )}
    </span>
  );
}
