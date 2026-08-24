import { expect, test, type Page } from '@playwright/test';
import { signIn } from './helpers/auth';
import {
  anonClient,
  createConfirmedUser,
  deleteUser,
  promoteToAdmin,
  serviceClient,
  uniqueEmail,
} from './helpers/supabase';

/**
 * PRD 15.3.5 — "Submit hackathon → appears in admin queue → approve → appears
 * publicly."
 *
 * The moderation boundary is the point of the whole queue: an unapproved
 * submission must be invisible to everyone except its author and an admin, and
 * the submitter must never be able to publish it themselves.
 */

const NAME = 'E2E Test Fintech Hackathon 2026';
const REJECTED_NAME = 'E2E Declined Hackathon 2026';
const DESCRIPTION =
  'Bu sinov uchun yaratilgan hakaton yozuvi. Moderatsiya oqimini tekshirish uchun ishlatiladi ' +
  'va tasdiqlangandan soʼng katalogda koʼrinadi.';

async function fillSubmitForm(page: Page, name: string) {
  await page.goto('/en/submit');
  await page.getByTestId('submit-name').fill(name);

  // Pick an existing organizer rather than creating a duplicate.
  await page.getByLabel('Find the organizer').fill('IT Park');
  await page.getByRole('button', { name: /IT Park Uzbekistan/ }).first().click();

  await page.getByLabel('City').fill('Tashkent');
  await page.getByLabel('Start date').fill('2026-10-10');
  await page.getByLabel('End date').fill('2026-10-12');
  await page.getByTestId('submit-description').fill(DESCRIPTION);
  await page.getByTestId('submit-hackathon').click();
}

test.describe('submission and moderation', () => {
  let submitterId = '';
  let submitterEmail = '';
  let adminId = '';
  let adminEmail = '';

  test.beforeAll(async () => {
    submitterEmail = uniqueEmail('submitter');
    submitterId = await createConfirmedUser(submitterEmail, 'E2E Submitter');
    adminEmail = uniqueEmail('mod-admin');
    adminId = await createConfirmedUser(adminEmail, 'E2E Moderator');
    await promoteToAdmin(adminId);
  });

  test.afterAll(async () => {
    const admin = serviceClient();
    await admin.from('hackathons').delete().ilike('name', 'E2E %');
    await deleteUser(submitterId);
    await deleteUser(adminId);
  });

  test('a submission lands as pending and stays invisible to the public', async ({
    page,
    browser,
  }) => {
    await page.goto('/en');
    await signIn(page, submitterEmail);
    await fillSubmitForm(page, NAME);

    await expect(page.getByText('Thanks', { exact: true })).toBeVisible({ timeout: 20_000 });

    // Stored as pending — never approved by the submitter's own action.
    const admin = serviceClient();
    const { data: row } = await admin
      .from('hackathons')
      .select('status, submitted_by, slug')
      .eq('name', NAME)
      .single();

    expect(row?.status).toBe('pending');
    expect(row?.submitted_by).toBe(submitterId);

    // The author can see it on their profile, with its status.
    await page.goto('/en/profile');
    const entry = page.locator('li').filter({ hasText: NAME });
    await expect(entry).toHaveCount(1);
    await expect(entry.getByText('In moderation')).toBeVisible();

    // A logged-out visitor cannot: not in the catalog, and the URL 404s.
    const visitorContext = await browser.newContext();
    const visitor = await visitorContext.newPage();

    await visitor.goto(`/en/hackathons?q=${encodeURIComponent('E2E Test Fintech')}`);
    await expect(visitor.getByText(NAME)).toHaveCount(0);

    const direct = await visitor.goto(`/en/hackathons/${row?.slug}`);
    expect(direct?.status()).toBe(404);

    // Nor through the API.
    const { data: publicRows } = await anonClient()
      .from('hackathon_cards')
      .select('id')
      .eq('name', NAME);
    expect(publicRows ?? []).toHaveLength(0);

    await visitorContext.close();
  });

  test('an admin approves it from the queue and it goes live', async ({ page, browser }) => {
    await page.goto('/en');
    await signIn(page, adminEmail);

    await page.goto('/en/admin');
    const card = page.locator('article').filter({ hasText: NAME });
    await expect(card).toHaveCount(1);
    await expect(card.getByText('E2E Submitter')).toBeVisible();

    await card.getByTestId('admin-approve').click();
    await expect(page.locator('article').filter({ hasText: NAME })).toHaveCount(0, {
      timeout: 15_000,
    });

    const admin = serviceClient();
    const { data: row } = await admin.from('hackathons').select('status, slug').eq('name', NAME).single();
    expect(row?.status).toBe('approved');

    // Now public, for a completely fresh visitor.
    const visitorContext = await browser.newContext();
    const visitor = await visitorContext.newPage();
    const response = await visitor.goto(`/en/hackathons/${row?.slug}`);
    expect(response?.status()).toBe(200);
    await expect(visitor.getByRole('heading', { level: 1 })).toContainText(NAME);
    await visitorContext.close();
  });

  test('rejecting a submission records the reason and shows it to the author', async ({ page }) => {
    await page.goto('/en');
    await signIn(page, submitterEmail);
    await fillSubmitForm(page, REJECTED_NAME);
    await expect(page.getByText('Thanks', { exact: true })).toBeVisible({ timeout: 20_000 });

    await page.goto('/en');
    await signIn(page, adminEmail);
    await page.goto('/en/admin');

    const card = page.locator('article').filter({ hasText: REJECTED_NAME });
    await card.getByRole('button', { name: 'Reject' }).click();
    await card.getByLabel('Reason for rejection').fill('E2E: manba topilmadi');
    await card.getByRole('button', { name: 'Reject' }).click();

    await expect(page.locator('article').filter({ hasText: REJECTED_NAME })).toHaveCount(0, {
      timeout: 15_000,
    });

    await page.goto('/en');
    await signIn(page, submitterEmail);
    await page.goto('/en/profile');

    const entry = page.locator('li').filter({ hasText: REJECTED_NAME });
    await expect(entry.getByText('Rejected', { exact: true })).toBeVisible();
    await expect(entry.getByText('E2E: manba topilmadi')).toBeVisible();
  });

  test('a non-admin cannot reach the admin panel', async ({ page }) => {
    await page.goto('/en');
    await signIn(page, submitterEmail);

    await page.goto('/en/admin');
    await expect(page.getByText('You do not have access to this page')).toBeVisible();
    await expect(page.getByTestId('admin-approve')).toHaveCount(0);
  });

  test('a logged-out visitor sees a sign-in prompt on the admin panel, not its contents', async ({
    page,
  }) => {
    await page.goto('/en/admin');
    await expect(page.getByTestId('prompt-signin')).toBeVisible();
    await expect(page.getByTestId('admin-approve')).toHaveCount(0);
  });
});
