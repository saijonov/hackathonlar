import { type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface EmptyStateProps {
  title: string;
  body?: string;
  action?: ReactNode;
  className?: string;
  /** Compact variant for inline slots (a rail, a card body). */
  compact?: boolean;
}

/**
 * PRD 7.2: "Empty states designed, not blank."
 *
 * The illustration is a dashed scoreboard grid drawn in CSS — it belongs to the
 * same visual family as the generated covers, so an empty catalog still looks
 * like part of the product rather than a missing section.
 */
export function EmptyState({ title, body, action, className, compact = false }: EmptyStateProps) {
  return (
    <div
      data-testid="empty-state"
      className={cn(
        'relative overflow-hidden rounded-lg border border-dashed border-line-2 bg-paper-2/60 text-center',
        compact ? 'px-5 py-8' : 'px-6 py-14',
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'linear-gradient(var(--color-line-2) 1px, transparent 1px), linear-gradient(90deg, var(--color-line-2) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          maskImage: 'radial-gradient(ellipse at center, black 10%, transparent 72%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 10%, transparent 72%)',
        }}
      />
      <div className="relative mx-auto max-w-md">
        <p className={cn('font-display font-bold text-ink', compact ? 'text-h3' : 'text-h2')}>
          {title}
        </p>
        {body && <p className="mt-2 text-body text-ink-3">{body}</p>}
        {action && <div className="mt-5 flex justify-center">{action}</div>}
      </div>
    </div>
  );
}
