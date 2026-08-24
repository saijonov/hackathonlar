import { type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface SectionHeaderProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
  /** `h2` by default; pass `h1` for page titles. */
  as?: 'h1' | 'h2';
  size?: 'md' | 'lg';
}

/**
 * The recurring editorial device (docs/design-system.md §3.2): a rule, an
 * uppercase micro eyebrow, then a big tight display heading. Used on every
 * section of the site so the page rhythm is consistent.
 */
export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  className,
  as: Heading = 'h2',
  size = 'md',
}: SectionHeaderProps) {
  return (
    <div className={cn('flex flex-wrap items-end justify-between gap-x-6 gap-y-3', className)}>
      <div className="min-w-0 max-w-2xl">
        {eyebrow && (
          <p className="eyebrow mb-2 flex items-center gap-2 text-accent">
            <span aria-hidden className="h-px w-6 bg-accent/40" />
            {eyebrow}
          </p>
        )}
        <Heading className={size === 'lg' ? 'text-display-2' : 'text-h1'}>{title}</Heading>
        {description && <p className="mt-2 text-body text-ink-3">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
