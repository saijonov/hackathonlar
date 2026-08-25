import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { scoreBand, type ScoreBand } from './score';

/**
 * Shared bits for the dynamically generated OpenGraph images (PRD 7.3).
 *
 * `next/font` self-hosts woff2, which Satori cannot read, so the display face
 * is vendored here as a WOFF (server-side only — it is never sent to a
 * browser). Reading it from disk rather than fetching Google at render time
 * means OG generation has no network dependency at all: the build cannot fail
 * because fonts.googleapis.com was slow, and a cold serverless instance does
 * not pay a round trip.
 *
 * Unlike the previous face, Google serves Unbounded as a single unsubsetted
 * WOFF (159KB) rather than per-script files, so there is one buffer instead of
 * two. Verified with fontkit before vendoring: it carries Latin, the basic
 * Cyrillic block U+0410–U+045F, and U+2018/U+2019 for the Uzbek tutuq belgisi.
 * It does **not** carry the Cyrillic-ext letters (ғ, ө); a sweep of every
 * message file and the seed data confirmed no display string needs them.
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
  const files = ['Unbounded-800.woff'];
  const buffers = await Promise.all(files.map((file) => readFile(join(FONT_DIR, file))));

  return buffers.map((buffer) => ({
    name: 'Unbounded',
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
/**
 * An OG card is always the **dark canvas**, never a panel, so these are the
 * canvas variants of the tokens — including the canvas score bands, which are
 * the light ones. Using the panel values here would put dark green on near
 * black.
 */
export const OG = {
  paper: '#1F1F1F',
  paper2: '#171717',
  surface: '#E1E1E1',
  ink: '#F4F3EF',
  ink2: '#B5B4AE',
  ink3: '#93928C',
  line: '#343433',
  accent: '#CCEC43',
  violet: '#8A51FC',
  band: {
    good: { text: '#0EAB5F', tint: '#12291E' },
    mid: { text: '#E08A00', tint: '#2E2209' },
    bad: { text: '#FF6132', tint: '#33120C' },
    none: { text: '#959595', tint: '#282828' },
  } satisfies Record<ScoreBand, { text: string; tint: string }>,
} as const;

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = 'image/png';

export function bandColors(score: number | null) {
  return OG.band[scoreBand(score)];
}
