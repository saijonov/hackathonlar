import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Adds the hover lift. Only for cards that are themselves a link. */
  interactive?: boolean;
}

/**
 * The one card treatment: a light **panel** on the dark canvas with its
 * bottom-right corner cut away.
 *
 * `panel` flips the whole contextual token set (see globals.css), so children
 * can keep using `text-ink-2`, `text-good` and friends unchanged.
 */
export function Card({ interactive = false, className, ...props }: CardProps) {
  return <div className={cn('panel notch-br', interactive && 'card-lift', className)} {...props} />;
}
