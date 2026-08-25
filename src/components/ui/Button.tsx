import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * lobstr.io's button system, measured from the live site:
 *   primary   solid red fill, white text, 8px radius, weight 700
 *   secondary white fill inside a 2px red outline (their "Create one")
 *   ghost     bare navy text
 *
 * No shadows at rest — this design language separates surfaces with hard
 * outlines, not blur. The only motion is a 1px lift on hover.
 */
const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-white border-2 border-accent hover:bg-accent-ink hover:border-accent-ink active:translate-y-px',
  secondary:
    'bg-surface text-accent border-2 border-accent hover:bg-accent hover:text-white active:translate-y-px',
  ghost:
    'bg-transparent text-ink border-2 border-transparent hover:text-accent hover:bg-accent-soft',
  danger: 'bg-surface text-bad border-2 border-bad hover:bg-bad hover:text-white',
};

/** Every size clears the 44px tap-target floor except `sm`, which is for
 *  dense desktop toolbars and admin tables only. */
const SIZES: Record<ButtonSize, string> = {
  sm: 'h-9 px-3.5 text-meta gap-1.5',
  md: 'h-11 px-5 text-meta gap-2',
  lg: 'h-13 px-7 text-body gap-2.5',
};

export function buttonClasses(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  className?: string,
) {
  return cn(
    'inline-flex shrink-0 items-center justify-center rounded-md font-display font-bold',
    'transition-[background-color,border-color,color,transform] duration-150 ease-out',
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
