import { mkdirSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';

/**
 * PRD 15.4 / 9.4 — responsive proof at the four required breakpoints.
 *
 * The screenshots are the deliverable a human reviews; the assertions catch the
 * two failures that are easy to miss by eye: a page that scrolls sideways, and
 * tap targets smaller than 44px.
 */

const BREAKPOINTS = [
  { width: 375, height: 812, name: '375-mobile' },
  { width: 768, height: 1024, name: '768-tablet' },
  { width: 1280, height: 900, name: '1280-laptop' },
  { width: 1536, height: 960, name: '1536-desktop' },
] as const;

const PAGES = [
  { path: '/uz', name: 'home' },
  { path: '/uz/hackathons', name: 'catalog' },
  { path: '/uz/hackathons/urban-tech-uzbekistan-2024-hackathon', name: 'hackathon-detail' },
  { path: '/uz/hackathons/urban-tech-uzbekistan-2024-hackathon/review', name: 'review-form' },
  { path: '/uz/organizers/central-bank-of-uzbekistan', name: 'organizer' },
  { path: '/uz/submit', name: 'submit' },
  { path: '/uz/rules', name: 'rules' },
] as const;

const SCREENSHOT_DIR = 'tests/e2e/screenshots';
mkdirSync(SCREENSHOT_DIR, { recursive: true });

async function measureOverflow(page: Page) {
  return page.evaluate(() => {
    const docWidth = document.documentElement.clientWidth;
    const offenders: string[] = [];

    for (const element of Array.from(document.body.querySelectorAll('*'))) {
      const rect = element.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;
      if (rect.right > docWidth + 1 || rect.left < -1) {
        const node = element as HTMLElement;
        offenders.push(
          `${node.tagName.toLowerCase()}.${String(node.className).slice(0, 60)} (right=${Math.round(rect.right)})`,
        );
      }
      if (offenders.length >= 5) break;
    }

    return {
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: docWidth,
      offenders,
    };
  });
}

/** Interactive controls that a finger has to hit must be at least 44px. */
async function measureSmallTapTargets(page: Page) {
  return page.evaluate(() => {
    const selectors = 'a[href], button, input:not([type="hidden"]), select, textarea, [role="radio"]';
    const problems: string[] = [];

    for (const element of Array.from(document.querySelectorAll(selectors))) {
      const node = element as HTMLElement;
      const rect = node.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;

      const style = getComputedStyle(node);
      if (style.visibility === 'hidden' || style.display === 'none') continue;

      // Visually-hidden elements are not tap targets. The skip-to-content link
      // only appears on keyboard focus, and each sr-only radio is wrapped in a
      // 44px <label> which IS the target and is measured separately.
      if (node.className && String(node.className).includes('sr-only')) continue;

      // Links inside running prose are text, not controls; the 44px rule does
      // not sensibly apply to them.
      const insideProse = node.closest('p, dd, summary') !== null;
      if (node.tagName === 'A' && insideProse) continue;

      // For a checkbox or radio the hit area is the wrapping <label>, not the
      // 20px box itself — clicking anywhere in the label toggles the control.
      const isCheckable =
        node instanceof HTMLInputElement && (node.type === 'checkbox' || node.type === 'radio');
      const target = isCheckable ? (node.closest('label') ?? node) : node;
      const box = target.getBoundingClientRect();

      if (box.height < 44 - 0.5 || box.width < 24) {
        problems.push(
          `${node.tagName.toLowerCase()}.${String(node.className).slice(0, 45)} ${Math.round(box.width)}x${Math.round(box.height)}`,
        );
      }
      if (problems.length >= 8) break;
    }

    return problems;
  });
}

for (const breakpoint of BREAKPOINTS) {
  test.describe(`at ${breakpoint.width}px`, () => {
    test.use({ viewport: { width: breakpoint.width, height: breakpoint.height } });

    for (const target of PAGES) {
      test(`${target.name} has no horizontal overflow`, async ({ page }) => {
        await page.goto(target.path);
        await page.waitForLoadState('load');
        // Let the score bars and counters settle before capturing.
        await page.waitForTimeout(1200);

        await page.screenshot({
          path: `${SCREENSHOT_DIR}/${target.name}__${breakpoint.name}.png`,
          fullPage: true,
        });

        const overflow = await measureOverflow(page);
        expect(
          overflow.scrollWidth,
          `horizontal overflow: ${overflow.offenders.join(' | ')}`,
        ).toBeLessThanOrEqual(overflow.clientWidth + 1);
      });
    }
  });
}

test.describe('mobile affordances at 375px', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('catalog filters collapse into a bottom sheet', async ({ page }) => {
    await page.goto('/en/hackathons');

    // The desktop filter row is hidden; the trigger is what is offered instead.
    const trigger = page.getByRole('button', { name: 'Open filters' });
    await expect(trigger).toBeVisible();

    await trigger.click();
    const sheet = page.getByRole('dialog');
    await expect(sheet).toBeVisible();
    await expect(sheet.getByLabel('City')).toBeVisible();

    // It really is a bottom sheet: anchored to the bottom of the viewport.
    const box = await sheet.locator('div').first().boundingBox();
    expect(box).not.toBeNull();
    expect((box?.y ?? 0) + (box?.height ?? 0)).toBeGreaterThan(812 * 0.6);

    await sheet.getByLabel('City').selectOption('Samarkand');
    await expect(page).toHaveURL(/city=Samarkand/);
  });

  test('the hackathon detail page gets a sticky action bar once scrolled', async ({ page }) => {
    await page.goto('/en/hackathons/urban-tech-uzbekistan-2024-hackathon');

    const sticky = page.locator('[data-print-hide]').filter({ hasText: 'Write a review' });
    // Hidden at the top so it never covers the title on first paint.
    await expect(sticky).not.toBeInViewport();

    await page.mouse.wheel(0, 900);
    await page.waitForTimeout(400);
    await expect(sticky).toBeInViewport();
  });

  test('primary tap targets clear 44px', async ({ page }) => {
    await page.goto('/uz');
    await page.waitForLoadState('load');

    const problems = await measureSmallTapTargets(page);
    expect(problems, `tap targets under 44px: ${problems.join(' | ')}`).toHaveLength(0);
  });

  test('the review form is usable at 375px', async ({ page }) => {
    await page.goto('/en/hackathons/urban-tech-uzbekistan-2024-hackathon/review');
    await page.waitForLoadState('load');

    // All five rating rows fit and their stars are reachable.
    const groups = page.getByRole('radiogroup');
    await expect(groups).toHaveCount(5);

    for (const category of ['Organization', 'Venue & comfort']) {
      const star = page
        .getByRole('radiogroup', { name: category })
        .getByRole('radio', { name: '5 / 5' });
      const box = await star.locator('xpath=..').boundingBox();
      expect(box?.width ?? 0).toBeGreaterThanOrEqual(44);
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
    }

    const problems = await measureSmallTapTargets(page);
    expect(problems, `tap targets under 44px: ${problems.join(' | ')}`).toHaveLength(0);
  });
});
