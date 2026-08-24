import { type TextareaHTMLAttributes, forwardRef } from 'react';
import { controlClasses } from './Field';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { invalid, className, rows = 6, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      aria-invalid={invalid || undefined}
      className={controlClasses(invalid, `resize-y py-2.5 leading-relaxed ${className ?? ''}`)}
      {...props}
    />
  );
});
