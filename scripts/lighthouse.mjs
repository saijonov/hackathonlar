#!/usr/bin/env node
/**
 * Mobile Lighthouse run against the production server (PRD 11).
 *
 * Uses Playwright's bundled Chromium so the run does not depend on whatever
 * Chrome happens to be installed, and writes both the JSON report and a short
 * summary that goes into TEST-REPORT.md.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { chromium } from '@playwright/test';
import lighthouse from 'lighthouse';

const BASE = process.env.LH_BASE_URL ?? 'http://localhost:3100';
const ROUTES = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ['/uz', '/uz/hackathons/urban-tech-uzbekistan-2024-hackathon'];

const THRESHOLDS = { performance: 90, accessibility: 95, seo: 95 };

mkdirSync('.qa/lighthouse', { recursive: true });

const browser = await chromium.launch({ args: ['--remote-debugging-port=9222'] });
const port = 9222;

const results = [];
let failed = false;

for (const route of ROUTES) {
  const runnerResult = await lighthouse(
    `${BASE}${route}`,
    {
      port,
      output: 'json',
      logLevel: 'error',
      // Lighthouse's own mobile defaults: Moto G Power class device + slow 4G.
      formFactor: 'mobile',
      screenEmulation: { mobile: true, width: 412, height: 823, deviceScaleFactor: 1.75, disabled: false },
      throttlingMethod: 'simulate',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    },
  );

  const { categories, audits } = runnerResult.lhr;
  const scores = Object.fromEntries(
    Object.entries(categories).map(([key, value]) => [key, Math.round((value.score ?? 0) * 100)]),
  );

  const name = route.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '') || 'root';
  writeFileSync(`.qa/lighthouse/${name}.json`, runnerResult.report);

  const failures = Object.entries(THRESHOLDS)
    .filter(([category, minimum]) => (scores[category] ?? 0) < minimum)
    .map(([category, minimum]) => `${category} ${scores[category]} < ${minimum}`);

  if (failures.length) failed = true;

  results.push({ route, scores, failures, audits });

  console.log(
    `${route.padEnd(52)} perf ${String(scores.performance).padStart(3)}  ` +
      `a11y ${String(scores.accessibility).padStart(3)}  ` +
      `bp ${String(scores['best-practices']).padStart(3)}  ` +
      `seo ${String(scores.seo).padStart(3)}` +
      (failures.length ? `   FAIL: ${failures.join(', ')}` : '   ok'),
  );

  // Surface the specific a11y/SEO problems, which are the actionable ones.
  for (const category of ['accessibility', 'seo']) {
    const refs = categories[category].auditRefs ?? [];
    const broken = refs
      .map((ref) => audits[ref.id])
      .filter((audit) => audit && audit.score !== null && audit.score < 1);
    for (const audit of broken) {
      console.log(`    ${category}: ${audit.id} — ${audit.title}`);
    }
  }
}

await browser.close();

writeFileSync(
  '.qa/lighthouse/summary.json',
  JSON.stringify(
    results.map(({ route, scores, failures }) => ({ route, scores, failures })),
    null,
    2,
  ),
);

process.exit(failed ? 1 : 0);
