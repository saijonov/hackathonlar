import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Every button on this site is a **pill with a 2px border**, taken from the
 * reference poster. Two things follow from that, and neither is cosmetic:
 *
 * 1. The lime primary fill has only 1.03:1 against a light panel. On its own it
 *    would be an invisible button on half the pages. The border is what carries
 *    the boundary contrast (WCAG 1.4.11), so `primary` must never lose it.
 * 2. Pills, not notched corners. A `clip-path` notch crops the focus ring of
 *    whatever it clips, so the shape language stops at the panel edge and
 *    interactive elements stay unclipped.
 *
 * `border-ink` / `text-ink` resolve against whichever context the button sits
 * in, so an outline button is legible on the dark canvas and inside a light
 * panel without a variant for each.
 */
const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-lime text-lime-ink border-2 border-ink hover:bg-transparent hover:text-ink active:translate-y-px',
  secondary:
    'bg-transparent text-ink border-2 border-ink hover:bg-ink hover:text-paper active:translate-y-px',
  ghost:
    'bg-transparent text-ink-2 border-2 border-transparent hover:text-ink hover:border-line-2',
  danger: 'bg-transparent text-bad border-2 border-bad hover:bg-bad hover:text-paper',
};

/** Every size clears the 44px tap-target floor except `sm`, which is for
 *  dense desktop toolbars and admin tables only. */
const SIZES: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-micro gap-1.5',
  md: 'h-11 px-6 text-meta gap-2',
  // px-8 at 320px overflows a long Russian label ('Добавить хакатон')
  // against `shrink-0`, so the roomy padding only starts at sm.
  lg: 'h-13 px-5 sm:px-8 text-body gap-2.5',
};

export function buttonClasses(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  className?: string,
) {
  return cn(
    // Body face, not the display face. The reference sets its pill labels in a
    // plain grotesque, and Unbounded is wide enough that a display-face
    // 'Добавить хакатон' measured 221px — the header cluster overflowed 1024px.
    'inline-flex shrink-0 items-center justify-center rounded-full font-sans font-bold',
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
