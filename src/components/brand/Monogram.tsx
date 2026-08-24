import { cn } from '@/lib/utils/cn';
import { hashSlug } from '@/lib/generated-cover';

interface MonogramProps {
  name: string;
  slug?: string;
  size?: number;
  className?: string;
}

/**
 * Organizer logo fallback (PRD 9.3): initials on a palette tint, picked
 * deterministically from the slug. Used instead of guessing at a logo URL or
 * hotlinking a low-res image from search results.
 */
const TINTS = [
  'bg-accent-soft text-accent-ink border-accent/20',
  'bg-paper-2 text-ink border-line-2',
  'bg-none-soft text-ink-2 border-line-2',
  'bg-accent text-white border-accent',
];

export function initialsFor(name: string): string {
  const words = name
    .replace(/[()"'“”«»]/g, ' ')
    .split(/\s+/)
    .filter((word) => /^\p{L}/u.test(word))
    // Drop connective words so "Central Bank of the Republic of Uzbekistan" -> "CB".
    .filter((word) => !/^(of|the|va|и|в|and|de|la|uz|republic)$/i.test(word));

  if (words.length === 0) return name.slice(0, 2).toUpperCase();
  if (words.length === 1) return (words[0] ?? '').slice(0, 2).toUpperCase();
  return `${(words[0] ?? '').charAt(0)}${(words[1] ?? '').charAt(0)}`.toUpperCase();
}

export function Monogram({ name, slug, size = 40, className }: MonogramProps) {
  const tint = TINTS[hashSlug(slug ?? name) % TINTS.length]!;

  return (
    <span
      aria-hidden
      className={cn(
        'inline-grid shrink-0 place-items-center rounded-md border font-display font-bold leading-none',
        tint,
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
    >
      {initialsFor(name)}
    </span>
  );
}
