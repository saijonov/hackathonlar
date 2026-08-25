import { Source_Sans_3 } from 'next/font/google';

/**
 * One family, four weights — the way lobstr.io does it.
 *
 * lobstr.io ships a proprietary face called `lobstr` and declares
 * `Source Sans 3` as its fallback; the browser loads both. Source Sans 3 is
 * therefore not an approximation of their type, it is literally the second
 * entry in their own font stack, and it is on Google Fonts.
 *
 * Verified for this project's needs before committing: Latin, Latin Extended
 * and Cyrillic subsets (the Russian locale depends on the last one), a 900
 * weight for the heavy display headings lobstr uses, and U+2018/U+2019 for the
 * Uzbek tutuq belgisi in o‘ / g‘.
 *
 * `preload: false` for the same reason as before: preloading emits a link for
 * every subset, so an Uzbek page would fetch Cyrillic it cannot use. Without
 * it the browser resolves subsets on demand from their unicode-range.
 */
export const sourceSans = Source_Sans_3({
  subsets: ['latin', 'latin-ext', 'cyrillic'],
  variable: '--font-source-sans',
  display: 'swap',
  weight: 'variable',
  preload: false,
  fallback: ['system-ui', 'sans-serif'],
  adjustFontFallback: true,
});

export const fontVariables = sourceSans.variable;
