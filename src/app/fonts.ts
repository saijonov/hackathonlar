import { Onest, Unbounded } from 'next/font/google';

/**
 * Two families, unlike the single-family system this replaced.
 *
 * The reference poster's display type is far wider and heavier than any text
 * face can reach — that width *is* the identity — while its body copy is a
 * plain, narrow grotesque. One family cannot do both ends: forcing it produces
 * either a limp headline or unreadable body copy.
 *
 * Both were checked against the Google Fonts CSS2 API before being chosen, for
 * the subsets this project actually needs. Space Grotesk, the obvious candidate
 * for the technical look, still ships **no Cyrillic at all** and would break
 * the entire Russian locale.
 *
 *   Unbounded   cyrillic-ext · cyrillic · latin-ext · latin · vietnamese
 *   Onest       cyrillic-ext · cyrillic · latin-ext · latin
 *
 * `preload: false` on both: preloading emits a link per subset, so an Uzbek
 * page would fetch Cyrillic it cannot use. Without it the browser resolves
 * subsets on demand from their unicode-range.
 */

/**
 * Display — wide geometric grotesque, used at 600–800 and usually uppercase.
 *
 * Kept on the variable axis. Requesting the three static cuts instead was
 * measured and served byte-for-byte the same 128KB, so the axis stays for the
 * flexibility. The two-family system does cost roughly 4 Lighthouse perf
 * points against the single-family one it replaced (95–99 → 91–96); that is
 * the price of the wide display face, which is the identity here.
 */
export const unbounded = Unbounded({
  subsets: ['latin', 'latin-ext', 'cyrillic'],
  variable: '--font-unbounded',
  display: 'swap',
  weight: 'variable',
  preload: false,
  fallback: ['system-ui', 'sans-serif'],
  adjustFontFallback: true,
});

/** Body / UI — neutral grotesque with first-class Cyrillic. */
export const onest = Onest({
  subsets: ['latin', 'latin-ext', 'cyrillic'],
  variable: '--font-onest',
  display: 'swap',
  weight: 'variable',
  preload: false,
  fallback: ['system-ui', 'sans-serif'],
  adjustFontFallback: true,
});

export const fontVariables = `${unbounded.variable} ${onest.variable}`;
