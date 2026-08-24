#!/usr/bin/env node
/**
 * Design QA helper: screenshots a list of routes at the four breakpoints from
 * PRD 9.4 and reports any page that scrolls horizontally.
 *
 * Usage: node scripts/shoot.mjs <outDir> <width[,width...]> <path> [path...]
 */
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const [outDir = '.qa', widthArg = '375,768,1280,1536', ...paths] = process.argv.slice(2);
const widths = widthArg.split(',').map(Number);
const routes = paths.length ? paths : ['/uz'];
const base = process.env.BASE_URL ?? 'http://localhost:3000';

mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const problems = [];

for (const width of widths) {
  const context = await browser.newContext({
    viewport: { width, height: width < 700 ? 812 : 900 },
    deviceScaleFactor: 2,
    reducedMotion: 'no-preference',
  });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => consoleErrors.push(`pageerror: ${err.message}`));

  for (const route of routes) {
    const url = `${base}${route}`;
    // `networkidle` is unreliable here: the analytics beacon and RSC prefetches
    // keep the connection pool warm indefinitely on the production server.
    const response = await page.goto(url, { waitUntil: 'load', timeout: 60_000 });
    await page.waitForLoadState('domcontentloaded');
    const status = response?.status() ?? 0;
    // Let bar/counter animations settle before capturing.
    await page.waitForTimeout(1200);

    const overflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      offenders: Array.from(document.querySelectorAll('body *'))
        .filter((el) => el.getBoundingClientRect().right > document.documentElement.clientWidth + 1)
        .slice(0, 5)
        .map((el) => `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 60)}`),
    }));

    const name = route.replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '') || 'root';
    await page.screenshot({ path: `${outDir}/${name}__${width}.png`, fullPage: true });

    if (status !== 200) problems.push(`${route} @${width}: HTTP ${status}`);
    if (overflow.scrollWidth > overflow.clientWidth + 1) {
      problems.push(
        `${route} @${width}: horizontal overflow ${overflow.scrollWidth}>${overflow.clientWidth} — ${overflow.offenders.join(' | ')}`,
      );
    }
    if (consoleErrors.length) {
      problems.push(`${route} @${width}: console — ${consoleErrors.slice(0, 3).join(' ;; ')}`);
      consoleErrors.length = 0;
    }
  }
  await context.close();
}

await browser.close();

console.log(problems.length ? `PROBLEMS:\n- ${problems.join('\n- ')}` : 'No overflow, no console errors, all 200.');
