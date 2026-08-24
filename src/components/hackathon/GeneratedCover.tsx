import { COVER_HEIGHT, COVER_WIDTH, generateCover, truncate } from '@/lib/generated-cover';
import { cn } from '@/lib/utils/cn';

interface GeneratedCoverProps {
  slug: string;
  name: string;
  className?: string;
  /** Hide the title — for tiny thumbnails where it would be illegible. */
  titleless?: boolean;
}

/**
 * Deterministic fallback cover (PRD 9.6). Rendered as inline SVG rather than an
 * <img> so the title picks up the page's Geologica webfont and stays crisp at
 * any size. Pure function of the slug — see src/lib/generated-cover.ts.
 */
export function GeneratedCover({ slug, name, className, titleless = false }: GeneratedCoverProps) {
  const { palette, shapes } = generateCover(slug);

  return (
    <svg
      viewBox={`0 0 ${COVER_WIDTH} ${COVER_HEIGHT}`}
      preserveAspectRatio="xMidYMid slice"
      className={cn('block size-full', className)}
      role="img"
      aria-label={name}
    >
      <rect width={COVER_WIDTH} height={COVER_HEIGHT} fill={palette.background} />
      {shapes.map((shape, index) => {
        if (shape.kind === 'rect') {
          return (
            <rect
              key={index}
              x={shape.x}
              y={shape.y}
              width={shape.width}
              height={shape.height}
              rx={shape.rx}
              fill={palette.foreground}
              opacity={shape.opacity}
            />
          );
        }
        if (shape.kind === 'disc') {
          return (
            <circle
              key={index}
              cx={shape.cx}
              cy={shape.cy}
              r={shape.r}
              fill={palette.foreground}
              opacity={shape.opacity}
            />
          );
        }
        return (
          <circle
            key={index}
            cx={shape.cx}
            cy={shape.cy}
            r={shape.r}
            fill="none"
            stroke={palette.foreground}
            strokeWidth={shape.strokeWidth}
            opacity={shape.opacity}
          />
        );
      })}
      {!titleless && (
        <text
          x={64}
          y={COVER_HEIGHT - 68}
          className="font-display"
          fontSize={64}
          fontWeight={800}
          letterSpacing={-2}
          fill={palette.ink}
        >
          {truncate(name, 40)}
        </text>
      )}
    </svg>
  );
}
