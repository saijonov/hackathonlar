import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * The design system is a set of hex values in globals.css, and nothing in the
 * type system stops someone nudging one of them. These tests read that file and
 * re-derive the properties the palette is actually chosen for.
 *
 * This theme has **two contexts**: a dark page canvas (`:root`) and the light
 * panels that sit on it (`@utility panel`, which redeclares the contextual
 * tokens). A colour that is legible in one can be invisible in the other, so
 * every check below runs against both token sets independently. Checking only
 * `:root` would have missed the real bug this design shipped with: form
 * controls were `bg-surface text-ink`, and because `--color-surface` is the
 * *light panel* colour while canvas `--color-ink` is near-white, that painted
 * white text on a white fill.
 *
 * Lighthouse checks contrast on rendered pages, but only the pairs a given page
 * happens to produce. This checks the whole matrix in both contexts.
 */

const css = readFileSync(join(process.cwd(), 'src/app/globals.css'), 'utf8');

/** Pull `--color-*` declarations out of one CSS block. */
function colorsIn(block: string): Record<string, string> {
  const found: Record<string, string> = {};
  for (const [, name, value] of block.matchAll(/--color-([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)) {
    found[name!] = value!.toLowerCase();
  }
  return found;
}

function blockAfter(marker: string): string {
  const start = css.indexOf(marker);
  expect(start, `globals.css must contain ${marker}`).toBeGreaterThan(-1);
  const open = css.indexOf('{', start);
  const end = css.indexOf('\n}', open);
  return css.slice(open, end);
}

const ROOT = colorsIn(blockAfter('@theme {'));
const PANEL_OVERRIDES = colorsIn(blockAfter('@utility panel {'));

/** A panel inherits every root token it does not override. */
const PANEL = { ...ROOT, ...PANEL_OVERRIDES };

const CONTEXTS = [
  { name: 'canvas', tokens: ROOT, grounds: ['paper', 'paper-2', 'paper-3'] },
  { name: 'panel', tokens: PANEL, grounds: ['paper', 'paper-2', 'surface'] },
] as const;

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

/** Euclidean distance in RGB — a crude but honest "can these be confused?". */
function distance(a: string, b: string): number {
  const [x, y] = [channels(a), channels(b)];
  return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]);
}

const BANDS = ['good', 'mid', 'bad', 'none'] as const;

describe.each(CONTEXTS)('$name context', ({ tokens, grounds }) => {
  const get = (name: string) => {
    const value = tokens[name];
    expect(value, `--color-${name} is missing`).toBeDefined();
    return value!;
  };

  it.each(['ink', 'ink-2', 'ink-3'])('%s clears AA on every ground', (ink) => {
    for (const ground of grounds) {
      expect(contrast(get(ink), get(ground)), `${ink} on ${ground}`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it.each(BANDS)('score colour %s clears AA on every ground and on its own tint', (band) => {
    for (const ground of grounds) {
      expect(contrast(get(band), get(ground)), `${band} on ${ground}`).toBeGreaterThanOrEqual(4.5);
    }
    expect(
      contrast(get(band), get(`${band}-soft`)),
      `${band} on ${band}-soft`,
    ).toBeGreaterThanOrEqual(4.5);
  });

  it('the accent is legible as text on every ground and on its own tint', () => {
    for (const ground of grounds) {
      expect(contrast(get('accent'), get(ground)), `accent on ${ground}`).toBeGreaterThanOrEqual(
        4.5,
      );
    }
    expect(contrast(get('accent'), get('accent-soft'))).toBeGreaterThanOrEqual(4.5);
    expect(contrast(get('accent-ink'), get('accent-soft'))).toBeGreaterThanOrEqual(4.5);
    expect(contrast(get('accent-ink'), get('paper'))).toBeGreaterThanOrEqual(4.5);
  });

  it('a filled danger button can carry `text-paper`', () => {
    // Button's `danger` variant is `hover:bg-bad hover:text-paper`. This is the
    // pair that check protects; `text-white` here measured 3.00:1 on the canvas.
    expect(contrast(get('paper'), get('bad'))).toBeGreaterThanOrEqual(4.5);
  });

  it('every ink tone stays legible on every tint, not just on the grounds', () => {
    // The gap this closes: the checks above prove ink works on the three page
    // grounds, but chips and callouts put the *same* ink tones on the accent
    // and score tints. Lighthouse caught `text-ink-3` on `bg-accent-soft` at
    // 4.24:1 — a pair no ground-only matrix would ever have tested.
    const tints = ['accent-soft', 'good-soft', 'mid-soft', 'bad-soft', 'none-soft'];
    for (const ink of ['ink', 'ink-2', 'ink-3']) {
      for (const tint of tints) {
        expect(contrast(get(ink), get(tint)), `${ink} on ${tint}`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it('the numeral tone clears AA-large, the only size it is used at', () => {
    for (const ground of grounds) {
      expect(contrast(get('numeral'), get(ground)), `numeral on ${ground}`).toBeGreaterThanOrEqual(
        3,
      );
    }
  });

  it('borders are visible against the surfaces they divide', () => {
    expect(contrast(get('line-2'), get('paper'))).toBeGreaterThanOrEqual(1.4);
    expect(contrast(get('ink'), get('paper'))).toBeGreaterThanOrEqual(3);
  });

  it('gives the four score bands distinguishable hues', () => {
    for (let i = 0; i < BANDS.length; i += 1) {
      for (let j = i + 1; j < BANDS.length; j += 1) {
        expect(
          distance(get(BANDS[i]!), get(BANDS[j]!)),
          `${BANDS[i]} vs ${BANDS[j]}`,
        ).toBeGreaterThan(55);
      }
    }
  });

  it('keeps every score band clear of the lime brand fill', () => {
    // Lime is a yellow-green, one hue-step from both "good" and "mid". Without
    // this a score chip could read as a brand fill, or vice versa.
    for (const band of BANDS) {
      expect(distance(get(band), get('lime')), `${band} vs lime`).toBeGreaterThan(90);
    }
  });
});

describe('the two contexts are genuinely inverted', () => {
  it('flips the ink and the ground between canvas and panel', () => {
    expect(luminance(ROOT['ink']!)).toBeGreaterThan(luminance(ROOT['paper']!));
    expect(luminance(PANEL['ink']!)).toBeLessThan(luminance(PANEL['paper']!));
  });

  it('redeclares every token whose meaning depends on the context', () => {
    // If a contextual token is ever added to @theme without a panel override,
    // it will silently carry a dark-canvas value into a light panel.
    const contextual = [
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
    ];
    for (const name of contextual) {
      expect(PANEL_OVERRIDES[name], `@utility panel must override --color-${name}`).toBeDefined();
    }
  });

  it('leaves the absolute fills alone in both contexts', () => {
    // These are what let a primary button be one colour site-wide.
    for (const name of ['lime', 'lime-ink', 'violet-fill', 'violet-ink']) {
      expect(ROOT[name], `--color-${name}`).toMatch(/^#[0-9a-f]{6}$/);
      expect(PANEL_OVERRIDES[name], `--color-${name} must NOT be overridden`).toBeUndefined();
    }
  });
});

describe('absolute fills', () => {
  it('pairs each fill with an ink that clears AA on it', () => {
    expect(contrast(ROOT['lime-ink']!, ROOT['lime']!)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(ROOT['violet-ink']!, ROOT['violet-fill']!)).toBeGreaterThanOrEqual(4.5);
  });

  it('proves the lime fill needs a border to be a visible button', () => {
    // Button's `primary` variant is `bg-lime … border-2 border-ink`. The border
    // is not decoration: without it a lime button on a light panel has no
    // discernible boundary (WCAG 1.4.11 wants 3:1). If this ever rises above
    // 3:1 the border requirement can be revisited — until then it is load
    // bearing, and this test is what says so.
    expect(contrast(ROOT['lime']!, PANEL['paper']!)).toBeLessThan(3);
    expect(contrast(PANEL['ink']!, PANEL['paper']!)).toBeGreaterThanOrEqual(3);
  });

  it('keeps lime legible on the canvas, where it is used as text', () => {
    expect(contrast(ROOT['lime']!, ROOT['paper']!)).toBeGreaterThanOrEqual(4.5);
  });
});

describe('type scale', () => {
  it('keeps --text-h1 large enough for the numeral tone exemption to hold', () => {
    // --color-numeral is only allowed 3:1 because it never renders below 24px.
    const h1 = /--text-h1:\s*clamp\(([^,]+),/.exec(css);
    expect(h1, '--text-h1 must be a clamp()').not.toBeNull();
    expect(Number.parseFloat(h1![1]!) * 16, '--text-h1 floor in px').toBeGreaterThanOrEqual(24);
  });

  it('has no leftovers from either previous palette', () => {
    for (const stale of [
      '#f5f1e8', '#16130f', '#046d82', // the original ivory + teal
      '#0a2540', '#db0000', '#f7f8fc', // the lobstr navy + red
    ]) {
      expect(css.toLowerCase(), `stale token ${stale}`).not.toContain(stale);
    }
  });
});
