import { type InputHTMLAttributes, forwardRef } from 'react';
import { controlClasses } from './Field';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { invalid, className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={controlClasses(invalid, `h-12 ${className ?? ''}`)}
      {...props}
    />
  );
});
