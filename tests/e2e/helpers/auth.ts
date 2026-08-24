import { expect, type Page } from '@playwright/test';
import { waitForOtp } from './mailpit';
import { TEST_PASSWORD } from './supabase';

/**
 * Signs in through the real auth dialog. Deliberately not a cookie shortcut:
 * the dialog is the single most important interaction on the site (PRD 6), so
 * every test that needs a session exercises it.
 */
/** Signs out if a session is already active. Safe to call unconditionally. */
export async function signOut(page: Page) {
  const menu = page.getByRole('button', { name: 'My profile' });
  if (!(await menu.isVisible().catch(() => false))) return;

  await menu.click();
  await page.getByRole('menuitem', { name: 'Sign out' }).click();
  await expect(page.getByTestId('header-signin')).toBeVisible({ timeout: 15_000 });
}

export async function signIn(page: Page, email: string, password = TEST_PASSWORD) {
  // Switching accounts mid-test needs an explicit sign-out first: while a
  // session is active the header shows the account menu, not a sign-in button.
  await signOut(page);

  const dialog = await openAuthDialog(page);

  await dialog.getByLabel('Email', { exact: true }).fill(email);
  await dialog.getByLabel('Password', { exact: true }).fill(password);
  await dialog.getByRole('button', { name: 'Sign in', exact: true }).click();

  await expect(dialog).toBeHidden({ timeout: 15_000 });
}

async function openAuthDialog(page: Page) {
  const dialog = page.getByRole('dialog');
  if (await dialog.isVisible().catch(() => false)) return dialog;

  const headerButton = page.getByTestId('header-signin');
  if (await headerButton.isVisible().catch(() => false)) {
    await headerButton.click();
  } else {
    // Narrow viewport: the sign-in button lives inside the mobile menu.
    await page.getByRole('button', { name: /menu/i }).click();
    await page.locator('#mobile-menu').getByRole('button', { name: 'Sign in', exact: true }).click();
  }
  await expect(dialog).toBeVisible();
  return dialog;
}

/**
 * Full sign-up including the real 6-digit email code, read back out of
 * Mailpit — the same code a user would type.
 */
export async function signUpWithOtp(page: Page, email: string, displayName: string) {
  const dialog = await openAuthDialog(page);

  // The dialog opens in sign-in mode; switch to sign-up.
  await dialog.getByRole('button', { name: 'Sign up', exact: true }).first().click();
  await dialog.getByLabel('Your name').fill(displayName);
  await dialog.getByLabel('Email', { exact: true }).fill(email);
  await dialog.getByLabel('Password', { exact: true }).fill(TEST_PASSWORD);
  await dialog.getByRole('button', { name: 'Sign up', exact: true }).last().click();

  const codeField = dialog.getByLabel('Confirmation code');
  await expect(codeField).toBeVisible({ timeout: 20_000 });

  const code = await waitForOtp(email);
  await codeField.fill(code);
  await dialog.getByRole('button', { name: 'Confirm', exact: true }).click();

  await expect(dialog).toBeHidden({ timeout: 20_000 });
}

export { TEST_PASSWORD };
