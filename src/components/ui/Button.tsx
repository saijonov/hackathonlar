import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'print';
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Flat fills and 1px borders, never blurry shadows (docs/design-system.md §4.2).
 * `print` is the signature offset-shadow treatment and is allowed on at most
 * one element per screen — the hero CTA.
 */
const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-white border border-accent hover:bg-accent-ink hover:border-accent-ink active:translate-y-px',
  secondary:
    'bg-surface text-ink border border-line-2 hover:border-ink hover:bg-paper-2 active:translate-y-px',
  ghost: 'bg-transparent text-ink-2 border border-transparent hover:bg-paper-2 hover:text-ink',
  danger: 'bg-surface text-bad border border-bad/40 hover:bg-bad-soft hover:border-bad',
  print:
    'bg-accent text-white border border-ink shadow-print hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_var(--color-ink)] active:translate-y-0 active:shadow-[1px_1px_0_0_var(--color-ink)]',
};

/** Every size clears the 44px tap-target floor except `sm`, which is for
 *  dense desktop toolbars and admin tables only. */
const SIZES: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-meta gap-1.5',
  md: 'h-11 px-5 text-body gap-2',
  lg: 'h-13 px-7 text-body-lg gap-2.5',
};

export function buttonClasses(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  className?: string,
) {
  return cn(
    'inline-flex shrink-0 items-center justify-center rounded-md font-display font-semibold',
    'transition-[background-color,border-color,transform,box-shadow] duration-150 ease-out',
    'disabled:pointer-events-none disabled:opacity-45',
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading = false, disabled, className, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={props.type ?? 'button'}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClasses(variant, size, className)}
      {...props}
    >
      {loading && (
        <span
          aria-hidden
          className="size-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {children}
    </button>
  );
});
