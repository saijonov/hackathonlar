interface StarburstProps {
  /** Rendered size in px. */
  size?: number;
  /** Text drawn inside the seal. Kept to 1–3 characters. */
  label?: string;
  className?: string;
}

/**
 * The reference poster's signature mark: a spiky violet seal.
 *
 * Generated rather than hand-drawn so the spike count and relief stay
 * consistent everywhere it appears — 16 spikes at a shallow 0.79 inner/outer
 * ratio, which is what reads as "seal" rather than "sun" or "explosion".
 *
 * Purely decorative: `aria-hidden`, and any label inside is repeated in real
 * text by the caller. Never the sole carrier of information.
 */
const SPIKES = 16;
const OUTER = 50;
const INNER = 39.5;

function path() {
  const points: string[] = [];
  for (let i = 0; i < SPIKES * 2; i += 1) {
    const angle = -Math.PI / 2 + (i * Math.PI) / SPIKES;
    const r = i % 2 === 0 ? OUTER : INNER;
    points.push(`${(50 + r * Math.cos(angle)).toFixed(2)} ${(50 + r * Math.sin(angle)).toFixed(2)}`);
  }
  return `M${points.join('L')}Z`;
}

const D = path();

export function Starburst({ size = 72, label, className }: StarburstProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      aria-hidden
      focusable="false"
      className={className}
    >
      <path d={D} fill="var(--color-violet-fill)" />
      {label && (
        <text
          x="50"
          y="50"
          textAnchor="middle"
          dominantBaseline="central"
          fill="var(--color-violet-ink)"
          fontFamily="var(--font-display)"
          fontSize="30"
          fontWeight="800"
          letterSpacing="-1"
        >
          {label}
        </text>
      )}
    </svg>
  );
}
