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
 * Text only, no lockup: set in the display face at 800 and coloured with the
 * contextual accent, so it is lime on the dark canvas and violet if it ever
 * lands inside a light panel.
 *
 * The starburst seal is the icon half of the identity and lives separately in
 * `<Starburst>` / public/brand/mark.svg, for the favicon and OG cards where a
 * square glyph is required.
 */
export function Wordmark({ className, size = 'md' }: WordmarkProps) {
  return (
    <span
      className={cn(
        'font-display font-extrabold leading-none tracking-[-0.03em] text-accent',
        SIZES[size],
        className,
      )}
    >
      hackathonlar.uz
    </span>
  );
}
