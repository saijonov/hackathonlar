'use client';

import { useEffect, useState } from 'react';
import { PenLine } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { ScoreMark } from '@/components/score/ScoreMark';
import { buttonClasses } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';

interface StickyReviewCtaProps {
  href: string;
  label: string;
  score: number | null;
  reviewCount: number;
}

/**
 * Mobile-only sticky action bar (PRD 9.4: "sticky mobile CTA on hackathon
 * detail"). It appears once the reader has scrolled past the header, so it
 * never covers the title on first paint, and it carries the score alongside the
 * button so the verdict stays visible while reading reviews.
 */
export function StickyReviewCta({ href, label, score, reviewCount }: StickyReviewCtaProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 320);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      data-print-hide
      className={cn(
        'fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 backdrop-blur-[2px] transition-transform duration-200 md:hidden',
        visible ? 'translate-y-0' : 'translate-y-full',
      )}
    >
      <div className="container-page flex items-center justify-between gap-3 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))]">
        <ScoreMark
          score={score}
          reviewCount={reviewCount}
          size="sm"
          showStars={false}
          className="min-w-0"
        />
        <Link href={href} className={buttonClasses('primary', 'md', 'shrink-0')}>
          <PenLine size={16} strokeWidth={2} aria-hidden />
          {label}
        </Link>
      </div>
    </div>
  );
}
