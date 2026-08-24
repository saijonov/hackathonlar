import { expect, test, type Page } from '@playwright/test';
import { signIn } from './helpers/auth';
import {
  anonClient,
  createConfirmedUser,
  deleteUser,
  hackathonIdBySlug,
  promoteToAdmin,
  uniqueEmail,
} from './helpers/supabase';

/**
 * PRD 15.3.3 — "Anonymous review flow → public page shows 'Anonymous
 * participant' and payload contains no author identity; admin panel shows the
 * real author."
 *
 * This is the single most important guarantee on the site. PRD 8 requires it to
 * be enforced "at the view/RLS layer, not by hiding in UI", so these tests do
 * not just look at the rendered page — they inspect the raw HTML the server
 * sent, and query the public API directly the way an attacker would.
 */

const HACKATHON = 'ecology-art-technology-hackathon-2025';
const AUTHOR_NAME = 'E2E Secret Author';
const TITLE = 'E2E: anonim sharh sinovi';
const BODY =
  'Bu sharh anonimlik oqimini tekshirish uchun yozilgan. Tashkiliy jihat oʼrtacha edi, ' +
  'muloqot esa sust boʼldi va natijalar haqida hech kim xabar bermadi.';

async function writeAnonymousReview(page: Page) {
  await page.goto(`/en/hackathons/${HACKATHON}/review`);

  const categories = ['Organization', 'Communication', 'Judging', 'Prizes', 'Venue & comfort'];
  for (const category of categories) {
    await page
      .getByRole('radiogroup', { name: category })
      .getByRole('radio', { name: '5 / 5' })
      .check({ force: true });
  }

  await page.getByLabel('Headline').fill(TITLE);
  await page.getByLabel('Review', { exact: true }).fill(BODY);
  await page.getByLabel('Post anonymously').check();

  await page.getByTestId('submit-review').click();
  await expect(page.getByText('Thanks', { exact: true })).toBeVisible({ timeout: 20_000 });
}

test.describe('anonymous reviews', () => {
  let authorId = '';
  let authorEmail = '';
  let adminId = '';
  let adminEmail = '';

  test.beforeAll(async () => {
    authorEmail = uniqueEmail('anon-author');
    authorId = await createConfirmedUser(authorEmail, AUTHOR_NAME);

    adminEmail = uniqueEmail('anon-admin');
    adminId = await createConfirmedUser(adminEmail, 'E2E Admin');
    await promoteToAdmin(adminId);
  });

  test.afterAll(async () => {
    await deleteUser(authorId);
    await deleteUser(adminId);
  });

  test('an anonymous review hides its author everywhere the public can look', async ({
    page,
    browser,
  }) => {
    await page.goto('/en');
    await signIn(page, authorEmail);
    await writeAnonymousReview(page);

    // Everything below is checked from a SEPARATE, logged-out context. Checking
    // it in the author's own session would be meaningless: their name is in the
    // header of every page they load, which is not a leak.
    const visitorContext = await browser.newContext();
    const visitor = await visitorContext.newPage();

    // --- 1. What a visitor sees on the page ---------------------------------
    await visitor.goto(`/en/hackathons/${HACKATHON}`);
    const card = visitor.getByTestId('review-card').filter({ hasText: TITLE });
    await expect(card).toHaveCount(1);
    await expect(card.getByText('Anonymous participant')).toBeVisible();
    await expect(card.getByText(AUTHOR_NAME)).toHaveCount(0);

    // --- 2. What the server actually sent -----------------------------------
    // Not "is it hidden by CSS" — the name must not be in the payload at all.
    const html = await visitor.content();
    expect(html).toContain(TITLE);
    expect(html).not.toContain(AUTHOR_NAME);
    expect(html).not.toContain(authorId);
    expect(html).not.toContain(authorEmail);

    await visitorContext.close();

    // --- 3. What the public API returns to an attacker ----------------------
    const supabase = anonClient();
    const hackathonId = await hackathonIdBySlug(HACKATHON);

    const { data: rows } = await supabase
      .from('public_reviews')
      .select('*')
      .eq('hackathon_id', hackathonId)
      .eq('title', TITLE);

    expect(rows).toHaveLength(1);
    const row = rows?.[0] as Record<string, unknown>;
    expect(row.is_anonymous).toBe(true);
    expect(row.author_id).toBeNull();
    expect(row.avatar_url).toBeNull();
    expect(row.display_name).toBe('Anonim ishtirokchi');

    // Nothing anywhere in the serialised payload leaks the author.
    const payload = JSON.stringify(rows);
    expect(payload).not.toContain(authorId);
    expect(payload).not.toContain(AUTHOR_NAME);

    // --- 4. The raw table is unreachable, so there is no second door --------
    const direct = await supabase.from('reviews').select('user_id').eq('title', TITLE);
    expect(direct.error?.code).toBe('42501');
    expect(direct.data).toBeNull();

    // --- 5. Nor can it be filtered out one row at a time --------------------
    const probe = await supabase
      .from('public_reviews')
      .select('id')
      .eq('title', TITLE)
      .eq('author_id', authorId);
    expect(probe.data ?? []).toHaveLength(0);
  });

  test('the admin panel resolves the real author of an anonymous review', async ({ page }) => {
    await page.goto('/en');
    await signIn(page, adminEmail);

    await page.goto('/en/admin/reviews');
    await expect(page.getByRole('heading', { name: 'Reviews', level: 2 })).toBeVisible();

    const row = page.locator('article').filter({ hasText: TITLE });
    await expect(row).toHaveCount(1);

    // PRD 7.8: "true author always visible here even for anonymous reviews".
    await expect(row.getByText('Real author')).toBeVisible();
    await expect(row.getByText(AUTHOR_NAME)).toBeVisible();
    await expect(row.getByText(authorEmail)).toBeVisible();

    // And it is still flagged as anonymous to the public.
    await expect(row.getByText('Anonymous on the site')).toBeVisible();
  });

  test('the author still sees and can edit their own anonymous review', async ({ page }) => {
    await page.goto('/en');
    await signIn(page, authorEmail);

    await page.goto('/en/profile');
    const mine = page.locator('li').filter({ hasText: TITLE });
    await expect(mine.first()).toBeVisible();
    await expect(mine.getByText('Anonymous').first()).toBeVisible();

    await page.goto(`/en/hackathons/${HACKATHON}/review`);
    await expect(page.getByLabel('Headline')).toHaveValue(TITLE);
    await expect(page.getByLabel('Post anonymously')).toBeChecked();
  });

  test('an admin can hide a review, which removes it from public view and aggregates', async ({
    page,
  }) => {
    const supabase = anonClient();
    const hackathonId = await hackathonIdBySlug(HACKATHON);

    const before = await supabase
      .from('hackathon_cards')
      .select('review_count, avg_overall')
      .eq('id', hackathonId)
      .single();

    await page.goto('/en');
    await signIn(page, adminEmail);
    await page.goto('/en/admin/reviews');

    const row = page.locator('article').filter({ hasText: TITLE });
    await row.getByTestId('admin-toggle-visibility').click();
    await expect(row.getByText('Hidden')).toBeVisible({ timeout: 15_000 });

    // Gone from the public page…
    await page.goto(`/en/hackathons/${HACKATHON}`);
    await expect(page.getByTestId('review-card').filter({ hasText: TITLE })).toHaveCount(0);

    // …and gone from the aggregate too (PRD 8).
    const after = await supabase
      .from('hackathon_cards')
      .select('review_count, avg_overall')
      .eq('id', hackathonId)
      .single();

    expect(after.data?.review_count).toBe((before.data?.review_count ?? 1) - 1);

    // Assert the recomputed mean exactly, rather than merely "it changed":
    // it must equal the average of the reviews that are still visible.
    const { data: remaining } = await supabase
      .from('public_reviews')
      .select('overall')
      .eq('hackathon_id', hackathonId);

    const expected =
      (remaining ?? []).reduce((sum, r) => sum + Number(r.overall), 0) / (remaining?.length || 1);
    expect(Number(after.data?.avg_overall)).toBeCloseTo(expected, 2);
    expect(Number(after.data?.avg_overall)).not.toBeCloseTo(Number(before.data?.avg_overall), 2);
  });
});
