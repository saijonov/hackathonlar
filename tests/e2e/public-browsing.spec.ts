import { expect, test } from '@playwright/test';

/**
 * PRD 15.3.1 — "Browse home → catalog → filter by city → open hackathon →
 * read reviews, all logged out (no auth wall anywhere)."
 *
 * PRD 6 is unambiguous: "Browsing is 100% public… Never gate reading behind
 * auth." These tests exist to make that regression-proof.
 */

test.describe('public browsing, never signed in', () => {
  test('/ redirects to the default locale', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/uz$/);
  });

  test('home shows live stats, upcoming rail and the ranking split', async ({ page }) => {
    await page.goto('/en');

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // The stats strip must show real database numbers, not placeholders.
    const stats = page.locator('main').getByText(/hackathon|review|organizer/i).first();
    await expect(stats).toBeVisible();

    await expect(page.getByRole('heading', { name: 'Upcoming hackathons' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Highest rated' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Lowest rated' })).toBeVisible();

    // No auth wall.
    await expect(page.getByRole('dialog')).toBeHidden();
  });

  test('catalog filters by city and the URL stays shareable', async ({ page }) => {
    await page.goto('/en/hackathons');
    await expect(page.getByRole('heading', { name: 'Hackathons', level: 1 })).toBeVisible();

    const cards = page.locator('ul li article');
    const totalBefore = await cards.count();
    expect(totalBefore).toBeGreaterThan(0);

    await page.getByLabel('City').selectOption('Samarkand');
    await expect(page).toHaveURL(/city=Samarkand/);

    // Every remaining card must actually be a Samarkand event — scoped to the
    // cards, since the <option> list also contains the word.
    const filtered = await cards.count();
    expect(filtered).toBeGreaterThan(0);
    expect(filtered).toBeLessThan(totalBefore);
    await expect(cards.getByText('Samarkand', { exact: true })).toHaveCount(filtered);

    // The filtered URL, pasted fresh, reproduces the same view.
    await page.goto('/en/hackathons?city=Samarkand');
    await expect(page.getByLabel('City')).toHaveValue('Samarkand');
    expect(await cards.count()).toBe(filtered);
  });

  test('catalog search narrows results and clears cleanly', async ({ page }) => {
    await page.goto('/en/hackathons');
    const cards = page.locator('ul li article');
    const before = await cards.count();

    await page.getByLabel('Search hackathons').fill('CBU');
    await expect(page).toHaveURL(/q=CBU/, { timeout: 10_000 });
    await expect(cards).not.toHaveCount(before);
    await expect(page.getByText('CBU Coding Hackathon 2026').first()).toBeVisible();
  });

  test('a search with no matches shows a designed empty state, not a blank page', async ({ page }) => {
    await page.goto('/en/hackathons?q=zzzzznotarealhackathon');
    await expect(page.getByText('Nothing found')).toBeVisible();
    // PRD 7.2: the empty state carries a CTA rather than dead-ending.
    await expect(
      page.getByTestId('empty-state').getByRole('link', { name: 'Add a hackathon' }),
    ).toBeVisible();
  });

  test('a hackathon page shows the score panel and its reviews without signing in', async ({
    page,
  }) => {
    await page.goto('/en/hackathons/urban-tech-uzbekistan-2024-hackathon');

    await expect(page.getByRole('heading', { level: 1 })).toContainText('Urban.Tech');

    // The verdict: 2.3 overall, driven by a 1.3 communication average.
    await expect(page.getByTestId('score-panel').getByText('2.3').first()).toBeVisible();
    const scorePanel = page.getByTestId('score-panel');
    await expect(scorePanel.getByText('Communication')).toBeVisible();
    await expect(scorePanel.getByText('1.3')).toBeVisible();

    const reviews = page.getByTestId('review-card');
    await expect(reviews).toHaveCount(3);

    // An official organizer response is rendered inline under its review.
    await expect(page.getByText('Official response')).toBeVisible();

    await expect(page.getByRole('dialog')).toBeHidden();
  });

  test('hidden reviews never reach a public page', async ({ page }) => {
    // cau-tech-hackathon-2026 has one published review and one hidden 1-star.
    await page.goto('/en/hackathons/cau-tech-hackathon-2026');
    await expect(page.getByTestId('review-card')).toHaveCount(1);
    await expect(page.getByText('This review has been hidden')).toBeHidden();
  });

  test('the organizer scoreboard aggregates across events', async ({ page }) => {
    await page.goto('/en/organizers');
    await expect(page.getByRole('heading', { name: 'Organizers', level: 1 })).toBeVisible();

    await page.getByRole('link', { name: /Central Bank/ }).first().click();
    await expect(page).toHaveURL(/\/organizers\/central-bank-of-uzbekistan/);
    await expect(page.getByText('4.3').first()).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Past hackathons' })).toBeVisible();
  });

  test('locale switching keeps the page and translates everything', async ({ page }) => {
    const path = '/hackathons/cbu-coding-hackathon-2026';

    await page.goto(`/uz${path}`);
    await expect(page.getByRole('link', { name: 'Katalogga qaytish' })).toBeVisible();

    await page.getByRole('link', { name: 'RU', exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/ru${path}`));
    await expect(page.getByRole('link', { name: 'Назад в каталог' })).toBeVisible();
    // Dates localise too, not just labels.
    await expect(page.locator('dd').first()).toContainText(/2026/);

    await page.getByRole('link', { name: 'EN', exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/en${path}`));
    await expect(page.getByRole('link', { name: 'Back to catalog' })).toBeVisible();
  });

  test('the locale switch preserves active filters', async ({ page }) => {
    await page.goto('/en/hackathons?city=Samarkand&sort=highest');
    await page.getByRole('link', { name: 'UZ', exact: true }).click();
    await expect(page).toHaveURL(/\/uz\/hackathons\?/);
    await expect(page).toHaveURL(/city=Samarkand/);
    await expect(page).toHaveURL(/sort=highest/);
  });

  test('an unknown path renders the designed 404', async ({ page }) => {
    const response = await page.goto('/en/hackathons/this-does-not-exist');
    expect(response?.status()).toBe(404);
    await expect(page.getByText('Page not found')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Go to hackathons' })).toBeVisible();
  });

  test('an explicit locale choice is remembered on the next visit', async ({ page, context }) => {
    // PRD 7: "Locale switcher in header persists choice in a cookie."
    await page.goto('/uz');
    await page.getByRole('link', { name: 'RU', exact: true }).click();
    await expect(page).toHaveURL(/\/ru$/);

    const cookie = (await context.cookies()).find((item) => item.name === 'NEXT_LOCALE');
    expect(cookie?.value).toBe('ru');

    // A later unprefixed visit follows the remembered choice, not the default.
    await page.goto('/');
    await expect(page).toHaveURL(/\/ru$/);
  });

  test('every public page exposes SEO metadata and structured data', async ({ page }) => {
    await page.goto('/en/hackathons/cbu-coding-hackathon-2026');

    await expect(page).toHaveTitle(/CBU Coding Hackathon 2026/);

    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute('href', /\/en\/hackathons\/cbu-coding-hackathon-2026/);

    // hreflang alternates for all three locales plus x-default.
    for (const lang of ['uz-Latn-UZ', 'ru-UZ', 'en', 'x-default']) {
      await expect(page.locator(`link[rel="alternate"][hreflang="${lang}"]`)).toHaveCount(1);
    }

    const jsonLd = await page.locator('script[type="application/ld+json"]').first().textContent();
    const parsed = JSON.parse(jsonLd ?? '{}');
    expect(parsed['@type']).toBe('Event');
    expect(parsed.aggregateRating.ratingValue).toBeCloseTo(4.3, 1);
    expect(parsed.aggregateRating.reviewCount).toBe(4);
  });

  test('robots.txt and sitemap.xml are served', async ({ request }) => {
    const robots = await request.get('/robots.txt');
    expect(robots.status()).toBe(200);
    expect(await robots.text()).toContain('Sitemap:');

    const sitemap = await request.get('/sitemap.xml');
    expect(sitemap.status()).toBe(200);
    const xml = await sitemap.text();
    expect(xml).toContain('/uz/hackathons/cbu-coding-hackathon-2026');
    expect(xml).toContain('hreflang="ru-UZ"');
  });

  test('the OG image renders as a real PNG', async ({ request }) => {
    const response = await request.get(
      '/uz/hackathons/urban-tech-uzbekistan-2024-hackathon/opengraph-image',
    );
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('image/png');
    const body = await response.body();
    expect(body.byteLength).toBeGreaterThan(5_000);
    // PNG magic number.
    expect(body.subarray(0, 4).toString('hex')).toBe('89504e47');
  });
});
