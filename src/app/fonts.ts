import { Geologica, IBM_Plex_Sans } from 'next/font/google';

/**
 * Self-hosted via `next/font` (PRD 4): Next downloads these at build time and
 * serves them from our own origin — the browser never talks to Google.
 *
 * Both faces were verified against the Google Fonts CSS2 API for `cyrillic`,
 * `cyrillic-ext`, `latin-ext` AND `U+02BB` (the Uzbek tutuq belgisi in oʻ/gʻ).
 * Space Grotesk, Sora and Archivo — the PRD's other suggestions — ship no
 * Cyrillic subset at all and would have broken the Russian locale outright.
 * See docs/design-system.md §3.
 */

/**
 * `preload: false` is deliberate and measured.
 *
 * With preloading on, Next emits a <link rel="preload"> for EVERY requested
 * subset, so an Uzbek page downloaded all 12 files (~190KB) including the
 * Cyrillic subsets it cannot possibly use — and Lighthouse mobile LCP sat at
 * 4.1s against a 1.1s FCP. With preloading off the browser fetches subsets on
 * demand from their `unicode-range`, so /uz pulls Latin only and /ru pulls
 * Cyrillic only. `cyrillic-ext` (historic and minority Slavic glyphs) is not
 * requested at all: modern Russian and Uzbek are fully covered by `cyrillic`.
 */

/** Display: technical grotesque. Headings, scores, the wordmark. */
export const geologica = Geologica({
  subsets: ['latin', 'latin-ext', 'cyrillic'],
  variable: '--font-geologica',
  display: 'swap',
  // Variable `wght` axis — one file per subset covers 100–900.
  weight: 'variable',
  preload: false,
  fallback: ['system-ui', 'sans-serif'],
  adjustFontFallback: true,
});

/**
 * Text: humanist sans with excellent Cyrillic. Body copy and UI only.
 *
 * Two weights, not four. Plex is a static family, so every extra weight is
 * another file per subset; headings use the variable display face, and body
 * copy only ever needs regular and semibold.
 */
export const plexSans = IBM_Plex_Sans({
  subsets: ['latin', 'latin-ext', 'cyrillic'],
  variable: '--font-plex-sans',
  display: 'swap',
  weight: ['400', '600'],
  // Italics are never used in the design system, so they are not downloaded.
  style: ['normal'],
  preload: false,
  fallback: ['system-ui', 'sans-serif'],
  adjustFontFallback: true,
});

export const fontVariables = `${geologica.variable} ${plexSans.variable}`;
