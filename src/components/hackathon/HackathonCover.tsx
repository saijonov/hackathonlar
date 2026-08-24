import Image from 'next/image';
import { cn } from '@/lib/utils/cn';
import { GeneratedCover } from './GeneratedCover';

interface HackathonCoverProps {
  slug: string;
  name: string;
  coverUrl?: string | null;
  className?: string;
  sizes?: string;
  priority?: boolean;
  titleless?: boolean;
}

/**
 * An uploaded cover when there is one, the deterministic generated cover when
 * there is not. Never a broken image, never a grey placeholder box.
 */
export function HackathonCover({
  slug,
  name,
  coverUrl,
  className,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  priority = false,
  titleless = false,
}: HackathonCoverProps) {
  if (coverUrl) {
    return (
      <div className={cn('relative overflow-hidden bg-paper-2', className)}>
        <Image
          src={coverUrl}
          alt=""
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden bg-paper-2', className)}>
      <GeneratedCover slug={slug} name={name} titleless={titleless} />
    </div>
  );
}
