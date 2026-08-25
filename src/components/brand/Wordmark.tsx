import { cn } from '@/lib/utils/cn';

interface WordmarkProps {
  className?: string;
  /** Kept for call sites that want the compact form; both render the text. */
  markOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const SIZES = {
  sm: 'text-[17px]',
  md: 'text-[20px]',
  lg: 'text-[28px]',
} as const;

/**
 * The wordmark, in lobstr.io's treatment: text only, no icon, set entirely in
 * the accent red at the heaviest weight with tight negative tracking — exactly
 * how "lobstr.io" sits in their own header.
 *
 * The star mark still exists as public/brand/mark.svg and drives the favicon
 * and OG cards, where a square glyph is required.
 */
export function Wordmark({ className, size = 'md' }: WordmarkProps) {
  return (
    <span
      className={cn(
        'font-display font-black leading-none tracking-[-0.04em] text-accent',
        SIZES[size],
        className,
      )}
    >
      hackathonlar.uz
    </span>
  );
}
