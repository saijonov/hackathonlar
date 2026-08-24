import { type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

export type BadgeTone = 'neutral' | 'accent' | 'good' | 'mid' | 'bad' | 'outline';

const TONES: Record<BadgeTone, string> = {
  neutral: 'bg-paper-2 text-ink-2 border-line-2',
  accent: 'bg-accent-soft text-accent-ink border-accent/25',
  good: 'bg-good-soft text-good border-good/25',
  mid: 'bg-mid-soft text-mid border-mid/25',
  bad: 'bg-bad-soft text-bad border-bad/25',
  outline: 'bg-transparent text-ink-3 border-line-2',
};

interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  icon?: ReactNode;
  className?: string;
  /** Uppercase micro-label styling — used for eyebrow-like status chips. */
  micro?: boolean;
  /** Native tooltip — chips are often abbreviated on narrow screens. */
  title?: string;
}

/** Small square-ish chip. Press, not app: radius-sm, 1px border, flat fill. */
export function Badge({
  children,
  tone = 'neutral',
  icon,
  className,
  micro = false,
  title,
}: BadgeProps) {
  return (
    <span
      title={title}
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded-sm border px-2 py-0.5 leading-none',
        micro ? 'eyebrow py-1' : 'text-meta font-medium',
        TONES[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
