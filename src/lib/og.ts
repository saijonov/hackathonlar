import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { scoreBand, type ScoreBand } from './score';

/**
 * Shared bits for the dynamically generated OpenGraph images (PRD 7.3).
 *
 * `next/font` self-hosts woff2, which Satori cannot read, so the display face
 * is vendored here as two small WOFF subsets (29KB total, server-side only —
 * they are never sent to a browser). Reading them from disk rather than
 * fetching Google at render time means OG generation has no network dependency
 * at all: the build cannot fail because fonts.googleapis.com was slow, and a
 * cold serverless instance does not pay a round trip.
 *
 * Both subsets are passed to Satori because a card mixes scripts: hackathon
 * names are Latin, but a Russian organizer name is Cyrillic. Verified glyph
 * coverage: the latin subset carries U+2018/U+2019 (the Uzbek tutuq belgisi),
 * the cyrillic subset carries the Cyrillic block.
 */

const FONT_DIR = join(process.cwd(), 'src/assets/fonts');

export interface OgFont {
  name: string;
  data: ArrayBuffer;
  weight: 800;
  style: 'normal';
}

let fontsPromise: Promise<OgFont[]> | undefined;

async function readFonts(): Promise<OgFont[]> {
  const files = ['Geologica-800-latin.woff', 'Geologica-800-cyrillic.woff'];
  const buffers = await Promise.all(files.map((file) => readFile(join(FONT_DIR, file))));

  return buffers.map((buffer) => ({
    name: 'Geologica',
    // Copy out of the Node Buffer's pooled memory into a standalone ArrayBuffer.
    data: buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength,
    ) as ArrayBuffer,
    weight: 800 as const,
    style: 'normal' as const,
  }));
}

/** Memoised per server instance; the files never change. */
export async function loadOgFonts(): Promise<OgFont[]> {
  fontsPromise ??= readFonts();
  return fontsPromise;
}

/** Palette mirrored from globals.css — Satori has no access to CSS variables. */
export const OG = {
  paper: '#F5F1E8',
  paper2: '#EFEADD',
  surface: '#FFFFFF',
  ink: '#16130F',
  ink2: '#4A443B',
  ink3: '#7C7466',
  line: '#E2DACD',
  accent: '#046D82',
  band: {
    good: { text: '#14683F', tint: '#DFEDE4' },
    mid: { text: '#8A5A05', tint: '#F6E8CC' },
    bad: { text: '#A82219', tint: '#F7E0DD' },
    none: { text: '#7C7466', tint: '#EBE5D7' },
  } satisfies Record<ScoreBand, { text: string; tint: string }>,
} as const;

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = 'image/png';

export function bandColors(score: number | null) {
  return OG.band[scoreBand(score)];
}
