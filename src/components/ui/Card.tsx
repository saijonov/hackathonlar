import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Adds the hover lift. Only for cards that are themselves a link. */
  interactive?: boolean;
}

/** The one card treatment: white fill, 1px hairline, radius-lg. */
export function Card({ interactive = false, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-line bg-surface',
        interactive && 'card-lift',
        className,
      )}
      {...props}
    />
  );
}
