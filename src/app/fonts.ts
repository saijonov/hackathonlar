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

/** Display: technical grotesque. Headings, scores, the wordmark. */
export const geologica = Geologica({
  subsets: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext'],
  variable: '--font-geologica',
  display: 'swap',
  // Variable `wght` axis — one file covers 100–900.
  weight: 'variable',
  fallback: ['system-ui', 'sans-serif'],
  adjustFontFallback: true,
});

/** Text: humanist sans with excellent Cyrillic. Body copy and UI only. */
export const plexSans = IBM_Plex_Sans({
  subsets: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext'],
  variable: '--font-plex-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
  // Italics are never used in the design system, so they are not downloaded.
  style: ['normal'],
  fallback: ['system-ui', 'sans-serif'],
  adjustFontFallback: true,
});

export const fontVariables = `${geologica.variable} ${plexSans.variable}`;
