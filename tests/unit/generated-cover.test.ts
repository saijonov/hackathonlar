import { describe, expect, it } from 'vitest';
import {
  COVER_HEIGHT,
  COVER_VARIANTS,
  COVER_WIDTH,
  escapeXml,
  generateCover,
  generateCoverSvg,
  hashSlug,
  truncate,
} from '@/lib/generated-cover';

/**
 * PRD 15.2: "fallback cover determinism".
 *
 * These covers are the difference between a catalog that looks intentional and
 * one that looks broken, and they must never change for a given slug — a cover
 * that shifted between renders would flicker on every deploy.
 */
describe('generateCover', () => {
  it('is deterministic: the same slug always yields byte-identical output', () => {
    for (const slug of ['cbu-coding-hackathon-2026', 'urban-tech-uzbekistan-2024-hackathon', 'x']) {
      const first = generateCover(slug);
      const second = generateCover(slug);
      expect(JSON.stringify(first)).toBe(JSON.stringify(second));
    }
  });

  it('produces different artwork for different slugs', () => {
    const slugs = [
      'cbu-coding-hackathon-2026',
      'open-data-challenge-2025',
      'navruz-hackathon-2025',
      'ai-hackathon-samarkand-2025',
      'national-transport-hackathon-2026',
      'urban-tech-uzbekistan-2024-hackathon',
    ];
    const signatures = new Set(slugs.map((slug) => JSON.stringify(generateCover(slug))));
    expect(signatures.size).toBe(slugs.length);
  });

  it('exercises every variant across a realistic slug set', () => {
    // A generator that only ever produced one motif would make the catalog
    // look repetitive, which is exactly what the fallback exists to avoid.
    const seen = new Set(
      Array.from({ length: 200 }, (_, index) => generateCover(`hakaton-${index}`).variant),
    );
    expect(seen.size).toBe(COVER_VARIANTS.length);
  });

  it('always produces shapes inside the canvas and valid opacities', () => {
    for (let index = 0; index < 60; index += 1) {
      const { shapes } = generateCover(`slug-${index}`);
      expect(shapes.length).toBeGreaterThan(0);

      for (const shape of shapes) {
        expect(shape.opacity).toBeGreaterThanOrEqual(0);
        expect(shape.opacity).toBeLessThanOrEqual(1);

        if (shape.kind === 'rect') {
          expect(shape.width).toBeGreaterThan(0);
          expect(shape.height).toBeGreaterThan(0);
          expect(shape.x).toBeGreaterThanOrEqual(0);
          expect(shape.y).toBeGreaterThanOrEqual(-COVER_HEIGHT);
        } else {
          expect(shape.r).toBeGreaterThan(0);
        }
      }
    }
  });

  it('handles an empty slug without throwing', () => {
    expect(() => generateCover('')).not.toThrow();
    expect(generateCover('')).toEqual(generateCover(''));
  });

  it('uses only palette colours, never a score colour', () => {
    // Green/amber/red mean "good/mediocre/bad" on this site; a cover must never
    // imply a rating the hackathon has not earned.
    const scoreColours = [
      // canvas variants
      '#0EAB5F', '#E08A00', '#FF6132',
      // panel variants
      '#136A4F', '#974600', '#B3242A',
    ];
    for (let index = 0; index < 100; index += 1) {
      const { palette } = generateCover(`slug-${index}`);
      for (const colour of [palette.background, palette.foreground, palette.ink]) {
        expect(scoreColours).not.toContain(colour.toUpperCase());
      }
    }
  });
});

describe('hashSlug', () => {
  it('is stable and stays inside 32 bits', () => {
    expect(hashSlug('cbu-coding-hackathon-2026')).toBe(hashSlug('cbu-coding-hackathon-2026'));
    for (const slug of ['', 'a', 'a'.repeat(500), 'Хакатон']) {
      const hash = hashSlug(slug);
      expect(Number.isInteger(hash)).toBe(true);
      expect(hash).toBeGreaterThanOrEqual(0);
      expect(hash).toBeLessThanOrEqual(0xffffffff);
    }
  });

  it('separates similar slugs', () => {
    expect(hashSlug('hakaton-1')).not.toBe(hashSlug('hakaton-2'));
  });
});

describe('generateCoverSvg', () => {
  it('renders a well-formed SVG of the right size', () => {
    const svg = generateCoverSvg('cbu-coding-hackathon-2026', 'CBU Coding Hackathon 2026');
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg.endsWith('</svg>')).toBe(true);
    expect(svg).toContain(`viewBox="0 0 ${COVER_WIDTH} ${COVER_HEIGHT}"`);
    expect(svg).toContain('CBU Coding Hackathon 2026');
  });

  it('escapes names that would otherwise break the markup', () => {
    const svg = generateCoverSvg('x', 'Ecology & <script>alert(1)</script>');
    expect(svg).not.toContain('<script>');
    expect(svg).toContain('&amp;');
  });
});

describe('escapeXml / truncate', () => {
  it('escapes the five XML entities', () => {
    expect(escapeXml(`&<>"'`)).toBe('&amp;&lt;&gt;&quot;&apos;');
  });

  it('truncates with an ellipsis only when needed', () => {
    expect(truncate('short', 20)).toBe('short');
    expect(truncate('a'.repeat(30), 10)).toHaveLength(10);
    expect(truncate('a'.repeat(30), 10).endsWith('…')).toBe(true);
    expect(truncate('  padded  ', 20)).toBe('padded');
  });
});
