import Image from 'next/image';
import { cn } from '@/lib/utils/cn';
import { hashSlug } from '@/lib/generated-cover';

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: number;
  className?: string;
}

/** Initials from a display name: "Demo foydalanuvchi 1" -> "DF". */
export function initialsOf(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter((part) => /\p{L}|\p{N}/u.test(part));
  if (parts.length === 0) return '?';
  if (parts.length === 1) return (parts[0] ?? '').slice(0, 2).toUpperCase();
  return `${(parts[0] ?? '').charAt(0)}${(parts[1] ?? '').charAt(0)}`.toUpperCase();
}

/** Deterministic tint so the same person always gets the same avatar colour. */
const TINTS = [
  'bg-accent-soft text-accent-ink',
  'bg-paper-2 text-ink-2',
  'bg-good-soft text-good',
  'bg-mid-soft text-mid',
  'bg-none-soft text-ink-2',
];

export function Avatar({ name, src, size = 36, className }: AvatarProps) {
  const tint = TINTS[hashSlug(name) % TINTS.length]!;

  if (src) {
    return (
      <Image
        src={src}
        alt=""
        width={size}
        height={size}
        className={cn('shrink-0 rounded-full border border-line object-cover', className)}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full border border-line font-display font-bold',
        tint,
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
    >
      {initialsOf(name)}
    </span>
  );
}
