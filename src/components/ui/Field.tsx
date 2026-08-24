import { type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface FieldProps {
  id: string;
  label: string;
  hint?: ReactNode;
  error?: string | null;
  optional?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Every input on the site is wrapped in this: a real `<label for>`, an
 * optional hint, and an error tied to the control via aria-describedby by the
 * caller (each input spreads `describedBy(id, hint, error)`).
 */
export function Field({ id, label, hint, error, optional, children, className }: FieldProps) {
  return (
    <div className={cn('grid grid-cols-1 gap-1.5', className)}>
      <label htmlFor={id} className="flex items-baseline gap-2 text-meta font-semibold text-ink">
        {label}
        {optional && <span className="font-normal text-ink-3">({optional})</span>}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-meta text-ink-3">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-meta font-medium text-bad">
          {error}
        </p>
      )}
    </div>
  );
}

/** aria-describedby wiring that matches the ids Field renders. */
export function describedBy(id: string, hasHint: boolean, hasError: boolean) {
  const ids = [hasError ? `${id}-error` : null, hasHint && !hasError ? `${id}-hint` : null].filter(
    Boolean,
  );
  return ids.length ? ids.join(' ') : undefined;
}

export const controlClasses = (invalid?: boolean, className?: string) =>
  cn(
    'w-full rounded-md border bg-surface px-3 text-body text-ink',
    'placeholder:text-ink-3/70',
    'transition-colors duration-150',
    'disabled:cursor-not-allowed disabled:bg-paper-2 disabled:text-ink-3',
    invalid ? 'border-bad focus:border-bad' : 'border-line-2 hover:border-ink-3 focus:border-accent',
    className,
  );
