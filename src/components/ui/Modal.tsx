'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils/cn';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  /**
   * `center` is the desktop dialog; `bottom` is the mobile bottom sheet used
   * for catalog filters (PRD 9.4). `auto` picks bottom below `md`.
   */
  placement?: 'center' | 'bottom' | 'auto';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZES = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
} as const;

/**
 * Built on the native `<dialog>` element, which gives us focus trapping,
 * Escape-to-close, `inert` background content and a real top-layer backdrop
 * for free — all things a hand-rolled div gets wrong.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  placement = 'center',
  size = 'md',
  className,
}: ModalProps) {
  const t = useTranslations('common');
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // The dialog's own backdrop does not stop the page behind it from scrolling.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const isBottom = placement === 'bottom';
  const isAuto = placement === 'auto';

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onClose={onClose}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        // Clicking the backdrop: the click target is the dialog itself only
        // when the pointer landed outside the content box.
        if (event.target === ref.current) onClose();
      }}
      className={cn(
        'max-h-[100dvh] w-full max-w-none border-0 bg-transparent p-0 backdrop:bg-ink/45 backdrop:backdrop-blur-[1px]',
        'open:animate-fade-in',
        isBottom || isAuto ? 'mb-0 mt-auto' : 'm-auto',
        isAuto && 'sm:m-auto',
      )}
    >
      <div
        className={cn(
          'mx-auto flex max-h-[100dvh] w-full flex-col overflow-hidden border-2 border-ink bg-surface shadow-pop',
          isBottom || isAuto ? 'rounded-t-xl animate-sheet-up' : 'rounded-xl animate-fade-rise',
          isAuto && 'sm:rounded-xl sm:animate-fade-rise',
          SIZES[size],
          className,
        )}
      >
        <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div className="min-w-0">
            <h2 id={titleId} className="text-h2">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="mt-1 text-meta text-ink-3">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('close')}
            className="-mr-1.5 -mt-1 grid grid-cols-1 size-11 shrink-0 place-items-center rounded-md text-ink-3 transition-colors hover:bg-paper-2 hover:text-ink"
          >
            <X size={20} strokeWidth={1.75} aria-hidden />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5">{children}</div>

        {footer && (
          <footer className="border-t border-line bg-paper-2/60 px-5 py-3.5 pb-[max(0.875rem,env(safe-area-inset-bottom))]">
            {footer}
          </footer>
        )}
      </div>
    </dialog>
  );
}
