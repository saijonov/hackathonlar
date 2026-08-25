import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * The design system is a set of hex values in a single `@theme` block, and
 * nothing in the type system stops someone nudging one of them. These tests
 * read that block directly and re-derive the two properties the palette is
 * actually chosen for:
 *
 *   1. WCAG AA contrast for every ink/ground pair the components can produce.
 *   2. Enough separation between the brand red and the "bad score" red that a
 *      user cannot mistake one for the other.
 *
 * Lighthouse checks (1) on rendered pages, but only on the pairs a given page
 * happens to render. This checks the whole matrix, including combinations that
 * exist in the tokens but appear on pages the audit does not visit.
 */

const css = readFileSync(join(process.cwd(), 'src/app/globals.css'), 'utf8');

function tokens(): Record<string, string> {
  const theme = /@theme\s*\{([\s\S]*?)\n\}/.exec(css);
  expect(theme, 'globals.css must contain an @theme block').not.toBeNull();
  const found: Record<string, string> = {};
  for (const [, name, value] of theme![1]!.matchAll(/--color-([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)) {
    found[name!] = value!.toLowerCase();
  }
  return found;
}

const T = tokens();

function channels(hex: string): [number, number, number] {
  const n = Number.parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function luminance(hex: string): number {
  const [r, g, b] = channels(hex)
    .map((c) => c / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)) as [
    number,
    number,
    number,
  ];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

/** Euclidean distance in RGB — a crude but honest "can these be confused?" metric. */
function distance(a: string, b: string): number {
  const [x, y] = [channels(a), channels(b)];
  return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]);
}

function token(name: string): string {
  const value = T[name];
  expect(value, `--color-${name} is missing from @theme`).toBeDefined();
  return value!;
}

/** Every ground a surface can sit on. */
const GROUNDS = ['paper', 'paper-2', 'paper-3', 'surface'] as const;

describe('palette contrast', () => {
  it.each(['ink', 'ink-2', 'ink-3'])('%s clears AA normal text on every ground', (ink) => {
    for (const ground of GROUNDS) {
      expect(contrast(token(ink), token(ground)), `${ink} on ${ground}`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it.each(['good', 'mid', 'bad', 'none'])(
    'score colour %s clears AA on every ground and on its own tint',
    (band) => {
      for (const ground of GROUNDS) {
        expect(contrast(token(band), token(ground)), `${band} on ${ground}`).toBeGreaterThanOrEqual(
          4.5,
        );
      }
      expect(
        contrast(token(band), token(`${band}-soft`)),
        `${band} on ${band}-soft`,
      ).toBeGreaterThanOrEqual(4.5);
    },
  );

  it('the accent is legible as text and as a solid button', () => {
    // Secondary/ghost buttons and links: accent text on a light ground.
    for (const ground of GROUNDS) {
      expect(contrast(token('accent'), token(ground)), `accent on ${ground}`).toBeGreaterThanOrEqual(
        4.5,
      );
    }
    expect(contrast(token('accent'), token('accent-soft'))).toBeGreaterThanOrEqual(4.5);
    // Primary button: white text on the accent fill, and on its hover shade.
    expect(contrast('#ffffff', token('accent'))).toBeGreaterThanOrEqual(4.5);
    expect(contrast('#ffffff', token('accent-ink'))).toBeGreaterThanOrEqual(4.5);
  });

  it('the numeral tone clears AA-large, which is the only size it is used at', () => {
    // --color-numeral exists for the big display figures in stat strips and
    // ranking rows. Every one of those is set in --text-h1 or larger, so the
    // applicable bar is AA-large (3:1), not 4.5:1.
    for (const ground of GROUNDS) {
      expect(contrast(token('numeral'), token(ground)), `numeral on ${ground}`).toBeGreaterThanOrEqual(3);
    }
  });

  it('keeps the type scale large enough for the AA-large exemption to hold', () => {
    // The 3:1 bar above is only legal because --color-numeral never renders
    // below 24px. --text-h1 is the smallest step it is used at, so if its
    // clamp floor ever drops, the exemption evaporates and the colour becomes
    // a contrast failure on every page that shows a rank or a counter.
    const h1 = /--text-h1:\s*clamp\(([^,]+),/.exec(css);
    expect(h1, '--text-h1 must be a clamp()').not.toBeNull();
    const floorRem = Number.parseFloat(h1![1]!);
    expect(floorRem * 16, '--text-h1 floor in px').toBeGreaterThanOrEqual(24);
  });

  it('borders are visible against the surfaces they separate', () => {
    // Non-text contrast (WCAG 1.4.11) is 3:1. `line` is the hairline rule and
    // is decorative, but `line-2` and `ink` carry the card outlines.
    expect(contrast(token('ink'), token('surface'))).toBeGreaterThanOrEqual(3);
    expect(contrast(token('line-2'), token('surface'))).toBeGreaterThanOrEqual(1.5);
  });
});

describe('semantic separation', () => {
  it('keeps the brand red clearly distinct from the "bad score" red', () => {
    const accent = token('accent');
    const bad = token('bad');
    expect(accent).not.toBe(bad);
    // Below ~60 the two reds start reading as the same colour at chip size.
    expect(distance(accent, bad)).toBeGreaterThan(60);
    // The bad red must be the *darker* of the two: the brand colour is the one
    // that should come forward on the page.
    expect(luminance(bad)).toBeLessThan(luminance(accent));
  });

  it('gives the four score bands distinguishable hues', () => {
    const bands = ['good', 'mid', 'bad', 'none'].map(token);
    for (let i = 0; i < bands.length; i += 1) {
      for (let j = i + 1; j < bands.length; j += 1) {
        expect(distance(bands[i]!, bands[j]!), `${bands[i]} vs ${bands[j]}`).toBeGreaterThan(60);
      }
    }
  });

  it('keeps danger aligned with the score-bad red rather than the brand red', () => {
    // A destructive action and a bad rating share a meaning; a destructive
    // action and the "submit" button must not share a colour.
    expect(token('danger')).toBe(token('bad'));
    expect(token('danger')).not.toBe(token('accent'));
  });
});

describe('token completeness', () => {
  it('defines every colour the components reference', () => {
    for (const name of [
      'paper',
      'paper-2',
      'paper-3',
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
    ]) {
      expect(T[name], `--color-${name}`).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it('has no leftovers from the pre-lobstr palette', () => {
    // The old system was ivory + teal. If any of these survive, a file was
    // missed during the restyle.
    for (const stale of ['#f5f1e8', '#16130f', '#046d82', '#03505f', '#efeadd', '#e1eef2']) {
      expect(css.toLowerCase(), `stale token ${stale}`).not.toContain(stale);
    }
  });
});
