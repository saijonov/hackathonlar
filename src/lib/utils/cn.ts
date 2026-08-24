import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * tailwind-merge, taught about this project's custom theme.
 *
 * WHY THIS IS NOT JUST `twMerge`
 * ------------------------------
 * Out of the box tailwind-merge only knows Tailwind's *default* scales. Our
 * `@theme` defines custom font sizes (`text-h3`, `text-display-1`, …) and
 * custom colours (`text-ink`, `text-good`, …) that share the `text-` prefix.
 * Without the extension below, tailwind-merge puts them in the same conflict
 * group and silently drops one:
 *
 *     cn('text-h3', 'text-good')   ->  'text-good'      (size lost!)
 *     buttonClasses('primary','lg')->  size 'text-body-lg' ate 'text-white',
 *                                      rendering dark ink on the accent fill.
 *
 * That produced real, visible bugs: unreadable primary buttons and score
 * numbers rendering at body size. Registering the custom scales fixes the
 * whole class of problem at the source rather than per call site.
 */

/** Font sizes declared as `--text-*` in globals.css. */
const FONT_SIZES = [
  'display-1',
  'display-2',
  'h1',
  'h2',
  'h3',
  'body-lg',
  'body',
  'meta',
  'micro',
] as const;

/** Colours declared as `--color-*` in globals.css. */
const COLORS = [
  'paper',
  'paper-2',
  'surface',
  'ink',
  'ink-2',
  'ink-3',
  'line',
  'line-2',
  'numeral',
  'accent',
  'accent-ink',
  'accent-soft',
  'good',
  'good-soft',
  'mid',
  'mid-soft',
  'bad',
  'bad-soft',
  'none',
  'none-soft',
  'success',
  'warning',
  'danger',
] as const;

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: [...FONT_SIZES] }],
      'text-color': [{ text: [...COLORS] }],
      'bg-color': [{ bg: [...COLORS] }],
      'border-color': [{ border: [...COLORS] }],
      'ring-color': [{ ring: [...COLORS] }],
      'divide-color': [{ divide: [...COLORS] }],
      'outline-color': [{ outline: [...COLORS] }],
      shadow: [{ shadow: ['lift', 'pop', 'print'] }],
      rounded: [{ rounded: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] }],
    },
  },
});

/** Conditional class names with Tailwind conflict resolution. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
