/**
 * Deterministic fallback covers (PRD 9.6).
 *
 * Most hackathons in the catalog will never have an uploaded cover, so the
 * fallback has to look *intentional* rather than like a missing image. Every
 * cover is derived purely from the slug, which means:
 *   - the same hackathon always renders the same artwork, forever;
 *   - the catalog is visually varied without a single stock photo;
 *   - it is trivially unit-testable (same input -> same output).
 *
 * The four motifs are all "scoreboard" ideas — a stadium light board, a bar
 * chart, concentric range rings, a column of rules — so the fallbacks reinforce
 * the brand concept instead of being generic decoration.
 */

export const COVER_WIDTH = 1200;
export const COVER_HEIGHT = 630;

export type CoverVariant = 'board' | 'bars' | 'rings' | 'rules';

export const COVER_VARIANTS: readonly CoverVariant[] = ['board', 'bars', 'rings', 'rules'];

export type CoverShape =
  | { kind: 'rect'; x: number; y: number; width: number; height: number; rx: number; opacity: number }
  | { kind: 'disc'; cx: number; cy: number; r: number; opacity: number }
  | { kind: 'ring'; cx: number; cy: number; r: number; strokeWidth: number; opacity: number };

export interface CoverPalette {
  background: string;
  foreground: string;
  ink: string;
}

export interface GeneratedCover {
  variant: CoverVariant;
  palette: CoverPalette;
  shapes: CoverShape[];
}

/**
 * Palettes use only the brand pair — navy and the accent red — on the three
 * ground tones. The *score* colours are deliberately excluded: on this site
 * those mean "good / mediocre / bad", and a cover must never imply a rating the
 * hackathon has not earned. Note the accent red and the score red are different
 * values for exactly this reason (see DECISIONS.md).
 */
const PALETTES: readonly CoverPalette[] = [
  { background: '#0A2540', foreground: '#DB0000', ink: '#FFFFFF' },
  { background: '#F7F8FC', foreground: '#0A2540', ink: '#0A2540' },
  { background: '#DB0000', foreground: '#FFFFFF', ink: '#FFFFFF' },
  { background: '#FFFFFF', foreground: '#DB0000', ink: '#0A2540' },
  { background: '#0A2540', foreground: '#FFFFFF', ink: '#FFFFFF' },
  { background: '#EEEFF5', foreground: '#DB0000', ink: '#0A2540' },
];

/** FNV-1a, 32-bit. Small, fast, stable across runtimes — no crypto needed. */
export function hashSlug(slug: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < slug.length; index += 1) {
    hash ^= slug.charCodeAt(index);
    // hash * 16777619, kept in 32-bit space.
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

/**
 * mulberry32 — a tiny deterministic PRNG so a single hash can drive dozens of
 * shape parameters without them all correlating.
 */
function createRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildBoard(random: () => number): CoverShape[] {
  const shapes: CoverShape[] = [];
  const columns = 12;
  const rows = 7;
  const cell = COVER_WIDTH / columns;
  const size = cell * 0.52;

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const roll = random();
      if (roll < 0.42) continue;
      shapes.push({
        kind: 'rect',
        x: column * cell + (cell - size) / 2,
        y: row * (COVER_HEIGHT / rows) + (COVER_HEIGHT / rows - size) / 2,
        width: size,
        height: size,
        rx: 3,
        opacity: roll > 0.86 ? 0.9 : 0.16 + roll * 0.28,
      });
    }
  }
  return shapes;
}

function buildBars(random: () => number): CoverShape[] {
  const shapes: CoverShape[] = [];
  const bars = 16;
  const gap = 10;
  const width = (COVER_WIDTH - gap * (bars - 1)) / bars;

  for (let index = 0; index < bars; index += 1) {
    const height = COVER_HEIGHT * (0.14 + random() * 0.72);
    shapes.push({
      kind: 'rect',
      x: index * (width + gap),
      y: COVER_HEIGHT - height,
      width,
      height,
      rx: 4,
      opacity: 0.14 + random() * 0.5,
    });
  }
  return shapes;
}

function buildRings(random: () => number): CoverShape[] {
  const shapes: CoverShape[] = [];
  const cx = COVER_WIDTH * (0.62 + random() * 0.26);
  const cy = COVER_HEIGHT * (0.18 + random() * 0.3);
  const count = 7 + Math.floor(random() * 4);

  for (let index = count; index >= 1; index -= 1) {
    shapes.push({
      kind: 'ring',
      cx,
      cy,
      r: index * (46 + random() * 10),
      strokeWidth: index % 3 === 0 ? 14 : 5,
      opacity: 0.1 + (index / count) * 0.42,
    });
  }
  shapes.push({ kind: 'disc', cx, cy, r: 30, opacity: 0.85 });
  return shapes;
}

function buildRules(random: () => number): CoverShape[] {
  const shapes: CoverShape[] = [];
  const lines = 13;
  const spacing = COVER_HEIGHT / (lines + 1);

  for (let index = 0; index < lines; index += 1) {
    const width = COVER_WIDTH * (0.24 + random() * 0.72);
    const thick = random() > 0.78;
    shapes.push({
      kind: 'rect',
      x: COVER_WIDTH * 0.06,
      y: spacing * (index + 1) - (thick ? 9 : 3),
      width,
      height: thick ? 18 : 6,
      rx: 2,
      opacity: thick ? 0.75 : 0.2 + random() * 0.3,
    });
  }
  return shapes;
}

/**
 * The whole cover, derived from `slug` alone.
 * Pure and total: any string produces a valid cover.
 */
export function generateCover(slug: string): GeneratedCover {
  const seed = hashSlug(slug || 'hackathonlar');
  const variant = COVER_VARIANTS[seed % COVER_VARIANTS.length]!;
  const palette = PALETTES[(seed >>> 8) % PALETTES.length]!;
  const random = createRandom(seed);

  const shapes =
    variant === 'board'
      ? buildBoard(random)
      : variant === 'bars'
        ? buildBars(random)
        : variant === 'rings'
          ? buildRings(random)
          : buildRules(random);

  return { variant, palette, shapes };
}

/**
 * Server-renderable SVG string. Used by the OG image route and anywhere an
 * `<img src>` / data-URI is needed; React components render the shapes inline
 * instead so the page's own webfont applies to the title.
 */
export function generateCoverSvg(slug: string, name: string): string {
  const { palette, shapes } = generateCover(slug);

  const body = shapes
    .map((shape) => {
      if (shape.kind === 'rect') {
        return `<rect x="${shape.x.toFixed(2)}" y="${shape.y.toFixed(2)}" width="${shape.width.toFixed(2)}" height="${shape.height.toFixed(2)}" rx="${shape.rx}" fill="${palette.foreground}" opacity="${shape.opacity.toFixed(3)}"/>`;
      }
      if (shape.kind === 'disc') {
        return `<circle cx="${shape.cx.toFixed(2)}" cy="${shape.cy.toFixed(2)}" r="${shape.r.toFixed(2)}" fill="${palette.foreground}" opacity="${shape.opacity.toFixed(3)}"/>`;
      }
      return `<circle cx="${shape.cx.toFixed(2)}" cy="${shape.cy.toFixed(2)}" r="${shape.r.toFixed(2)}" fill="none" stroke="${palette.foreground}" stroke-width="${shape.strokeWidth}" opacity="${shape.opacity.toFixed(3)}"/>`;
    })
    .join('');

  const title = escapeXml(truncate(name, 42));

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${COVER_WIDTH} ${COVER_HEIGHT}" width="${COVER_WIDTH}" height="${COVER_HEIGHT}" role="img" aria-label="${title}">`,
    `<rect width="${COVER_WIDTH}" height="${COVER_HEIGHT}" fill="${palette.background}"/>`,
    body,
    `<text x="64" y="${COVER_HEIGHT - 72}" font-family="Geologica, system-ui, sans-serif" font-size="64" font-weight="800" letter-spacing="-2" fill="${palette.ink}">${title}</text>`,
    `</svg>`,
  ].join('');
}

export function truncate(value: string, max: number): string {
  const trimmed = value.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
}

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
