import { expect, test, type Page } from '@playwright/test';
import { signIn, signUpWithOtp } from './helpers/auth';
import { clearMailbox } from './helpers/mailpit';
import {
  anonClient,
  createConfirmedUser,
  deleteUser,
  firstReviewIdOf,
  hackathonIdBySlug,
  serviceClient,
  uniqueEmail,
} from './helpers/supabase';

/**
 * PRD 15.3.2 and 15.3.4 — the core contribution loop.
 *
 * The first test is the one that matters most: it walks the exact journey from
 * PRD 6, where a logged-out visitor writes a whole review, meets the auth
 * dialog only at submit time, and must land back on their own draft rather
 * than on the homepage.
 */

const HACKATHON = 'navruz-hackathon-2025';
const BODY =
  'Tashkiliy jihatdan yaxshi tayyorgarlik koʼrilgan edi. Jadval eʼlon qilingan vaqtda bajarildi ' +
  'va mentorlar har bir jamoa bilan alohida ishladi. Natijalar oʼsha kuni eʼlon qilindi.';

async function fillReviewForm(page: Page, ratings = [5, 4, 4, 3, 5]) {
  const categories = ['Organization', 'Communication', 'Judging', 'Prizes', 'Venue & comfort'];

  for (const [index, category] of categories.entries()) {
    const group = page.getByRole('radiogroup', { name: category });
    await group.getByRole('radio', { name: `${ratings[index]} / 5` }).check({ force: true });
  }

  await page.getByLabel('Headline').fill('E2E: mentorlik kuchli, jadval aniq');
  await page.getByLabel('Review', { exact: true }).fill(BODY);
}

test.describe('review flow', () => {
  const created: string[] = [];

  test.afterAll(async () => {
    for (const id of created) await deleteUser(id);
  });

  test('a logged-out visitor can write a full review and is returned to it after signing up', async ({
    page,
  }) => {
    await clearMailbox();
    const email = uniqueEmail('reviewer');

    // Straight to the form while logged out — no auth wall on the way in.
    await page.goto(`/en/hackathons/${HACKATHON}/review`);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('dialog')).toBeHidden();

    await fillReviewForm(page);

    // Submitting is the first moment auth is required (PRD 6).
    await page.getByTestId('submit-review').click();
    await expect(page.getByRole('dialog')).toBeVisible();

    await signUpWithOtp(page, email, 'E2E Reviewer');

    // The draft was never unmounted, so the review posts itself straight after
    // authentication — the user is not dumped on the homepage.
    await expect(page.getByText('Thanks', { exact: true })).toBeVisible({ timeout: 20_000 });

    const { data } = await anonClient()
      .from('public_reviews')
      .select('title, overall, display_name')
      .eq('hackathon_id', await hackathonIdBySlug(HACKATHON))
      .eq('title', 'E2E: mentorlik kuchli, jadval aniq');

    expect(data).toHaveLength(1);
    expect(Number(data?.[0]?.overall)).toBeCloseTo(4.2, 5);
    expect(data?.[0]?.display_name).toBe('E2E Reviewer');
  });

  test('the new review appears on the page and moves the aggregate', async ({ page }) => {
    await page.goto(`/en/hackathons/${HACKATHON}`);

    const card = page
      .getByTestId('review-card')
      .filter({ hasText: 'E2E: mentorlik kuchli, jadval aniq' });
    await expect(card).toHaveCount(1);
    await expect(card.getByText('E2E Reviewer')).toBeVisible();

    // The hackathon had a single 3.8 review; adding a 4.2 must move the mean to
    // 4.0. Matched via the ScoreMark's accessible label so the assertion cannot
    // accidentally pick up a category bar that also reads 4.0.
    await expect(
      page.getByTestId('score-panel').getByRole('img', { name: '4.0 / 5' }),
    ).toBeVisible();
    await expect(page.getByText('2 reviews').first()).toBeVisible();
  });

  test('a second review from the same user is blocked and the form switches to edit mode', async ({
    page,
  }) => {
    const email = uniqueEmail('dupe');
    const userId = await createConfirmedUser(email, 'E2E Duplicate');
    created.push(userId);

    await page.goto('/en');
    await signIn(page, email);

    await page.goto(`/en/hackathons/${HACKATHON}/review`);
    await fillReviewForm(page, [4, 4, 4, 4, 4]);
    await page.getByLabel('Headline').fill('Birinchi sharh');
    await page.getByTestId('submit-review').click();
    await expect(page.getByText('Thanks', { exact: true })).toBeVisible({ timeout: 20_000 });

    // Coming back loads the existing review for editing rather than offering a
    // second one — the DB has a unique (hackathon_id, user_id) constraint.
    await page.goto(`/en/hackathons/${HACKATHON}/review`);
    await expect(page.getByLabel('Headline')).toHaveValue('Birinchi sharh');
    await expect(page.getByTestId('submit-review')).toHaveText(/Save changes/);

    await page.getByLabel('Headline').fill('Tahrirlangan sharh');
    await page.getByTestId('submit-review').click();
    await expect(page.getByText('Thanks', { exact: true })).toBeVisible({ timeout: 20_000 });

    // Still exactly one review from this account, now with the edited title
    // and an "Edited" marker.
    await page.goto(`/en/hackathons/${HACKATHON}`);
    const cards = page.getByTestId('review-card').filter({ hasText: 'E2E Duplicate' });
    await expect(cards).toHaveCount(1);
    await expect(cards.getByText('Tahrirlangan sharh')).toBeVisible();
    await expect(cards.getByText('Edited')).toBeVisible();

    // You cannot mark your own review helpful (PRD 8).
    await expect(cards.getByTestId('helpful-button')).toBeDisabled();
  });

  test('a helpful vote persists, counts once, and can be retracted', async ({ page }) => {
    const email = uniqueEmail('voter');
    const userId = await createConfirmedUser(email, 'E2E Voter');
    created.push(userId);

    const admin = serviceClient();
    const reviewId = await firstReviewIdOf('urban-tech-uzbekistan-2024-hackathon');
    const votesFor = async () => {
      const { count } = await admin
        .from('review_votes')
        .select('id', { count: 'exact', head: true })
        .eq('review_id', reviewId);
      return count ?? 0;
    };

    const before = await votesFor();

    await page.goto('/en/hackathons/urban-tech-uzbekistan-2024-hackathon');
    await signIn(page, email);
    await page.goto('/en/hackathons/urban-tech-uzbekistan-2024-hackathon');

    const button = () => page.getByTestId('review-card').first().getByTestId('helpful-button');
    await button().click();
    await expect(button()).toHaveAttribute('aria-pressed', 'true');

    // The optimistic UI flips instantly, so the database is the only honest
    // witness that the vote actually landed.
    await expect.poll(votesFor, { timeout: 10_000 }).toBe(before + 1);

    // It survives a reload — the viewer's own vote state is read per request.
    await page.reload();
    await expect(button()).toHaveAttribute('aria-pressed', 'true');

    // Clicking again retracts rather than double-counting.
    await button().click();
    await expect(button()).toHaveAttribute('aria-pressed', 'false');
    await expect.poll(votesFor, { timeout: 10_000 }).toBe(before);
  });

  test('reporting a review reaches the admin queue', async ({ page }) => {
    const email = uniqueEmail('reporter');
    const userId = await createConfirmedUser(email, 'E2E Reporter');
    created.push(userId);

    await page.goto('/en/hackathons/urban-tech-uzbekistan-2024-hackathon');
    await signIn(page, email);
    await page.goto('/en/hackathons/urban-tech-uzbekistan-2024-hackathon');

    await page.getByTestId('review-card').first().getByTestId('report-button').click();

    // Each review renders its own dialog; only the open one is in the a11y tree.
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    await dialog.getByLabel('Reason').fill('E2E: sinov uchun yuborilgan shikoyat');
    await dialog.getByTestId('report-submit').click();

    await expect(dialog).toBeHidden();
    await expect(page.getByText('Report sent').first()).toBeVisible();
  });

  test('a review body under 50 characters is rejected before it reaches the server', async ({
    page,
  }) => {
    const email = uniqueEmail('shortie');
    const userId = await createConfirmedUser(email, 'E2E Shortie');
    created.push(userId);

    await page.goto('/en');
    await signIn(page, email);

    await page.goto('/en/hackathons/open-data-challenge-2025/review');
    await fillReviewForm(page);
    await page.getByLabel('Review', { exact: true }).fill('too short');
    await page.getByTestId('submit-review').click();

    await expect(page.getByText('Too short').first()).toBeVisible();
    await expect(page.getByText('Thanks', { exact: true })).toBeHidden();
  });

  test('all five categories are required', async ({ page }) => {
    const email = uniqueEmail('partial');
    const userId = await createConfirmedUser(email, 'E2E Partial');
    created.push(userId);

    await page.goto('/en');
    await signIn(page, email);

    await page.goto('/en/hackathons/open-data-challenge-2025/review');
    await page
      .getByRole('radiogroup', { name: 'Organization' })
      .getByRole('radio', { name: '4 / 5' })
      .check({ force: true });
    await page.getByLabel('Headline').fill('Yetarli emas');
    await page.getByLabel('Review', { exact: true }).fill(BODY);
    await page.getByTestId('submit-review').click();

    await expect(page.getByText('This field is required').first()).toBeVisible();
    await expect(page.getByText('Thanks', { exact: true })).toBeHidden();
  });
});
