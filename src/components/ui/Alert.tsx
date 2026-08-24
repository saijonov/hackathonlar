import { type ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export type AlertTone = 'info' | 'success' | 'warning' | 'danger';

const TONES: Record<AlertTone, { wrap: string; icon: ReactNode }> = {
  info: {
    wrap: 'border-accent/30 bg-accent-soft text-accent-ink',
    icon: <Info size={18} strokeWidth={1.75} aria-hidden />,
  },
  success: {
    wrap: 'border-good/30 bg-good-soft text-good',
    icon: <CheckCircle2 size={18} strokeWidth={1.75} aria-hidden />,
  },
  warning: {
    wrap: 'border-mid/30 bg-mid-soft text-mid',
    icon: <AlertTriangle size={18} strokeWidth={1.75} aria-hidden />,
  },
  danger: {
    wrap: 'border-bad/30 bg-bad-soft text-bad',
    icon: <XCircle size={18} strokeWidth={1.75} aria-hidden />,
  },
};

interface AlertProps {
  tone?: AlertTone;
  title?: string;
  children?: ReactNode;
  className?: string;
}

export function Alert({ tone = 'info', title, children, className }: AlertProps) {
  const { wrap, icon } = TONES[tone];
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={cn('flex gap-2.5 rounded-md border px-3.5 py-3 text-meta', wrap, className)}
    >
      <span className="mt-px shrink-0">{icon}</span>
      <div className="min-w-0">
        {title && <p className="font-display font-semibold leading-snug">{title}</p>}
        {children && <div className={cn(title && 'mt-0.5', 'leading-relaxed')}>{children}</div>}
      </div>
    </div>
  );
}
