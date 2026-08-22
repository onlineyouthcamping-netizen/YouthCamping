import { test, expect } from '@playwright/test';
import {
  adminEmail,
  adminPassword,
  adminSkipReason,
  hasAdminCredentials,
} from '../helpers/env';
import { loginViaUi } from '../helpers/auth';
import { attachApiMonitor, assertNoServerErrors, type TrackedFailure } from '../helpers/network';
import { adminBaseUrl } from '../helpers/env';

test.describe('admin.smoke', () => {
  test('admin site loads and login form exists', async ({ page }) => {
    const failures: TrackedFailure[] = [];
    attachApiMonitor(page, failures, 'admin-login-form');
    const res = await page.goto(`${adminBaseUrl()}/login`, {
      waitUntil: 'domcontentloaded',
    });
    expect(res?.status(), 'admin login HTTP status').toBeLessThan(500);
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
    await expect(page.locator('#admin-email')).toBeVisible();
    await expect(page.locator('#admin-password')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
    assertNoServerErrors(failures);
  });

  test('login with E2E admin credentials reaches dashboard', async ({ page }) => {
    test.skip(!hasAdminCredentials(), adminSkipReason());
    const failures: TrackedFailure[] = [];
    attachApiMonitor(page, failures, 'admin-login');

    await loginViaUi(page, adminEmail()!, adminPassword()!);
    await expect(page).toHaveURL(/\/admin/);
    await expect(page.getByTitle(/log out/i)).toBeVisible({ timeout: 20_000 });
    const serverFailures = failures.filter((f) => f.status >= 500);
    expect(serverFailures, failures.map((f) => `${f.method} ${f.url} ${f.status}`).join('\n')).toHaveLength(0);
  });

  test('logout is supported after login', async ({ page }) => {
    test.skip(!hasAdminCredentials(), adminSkipReason());
    await loginViaUi(page, adminEmail()!, adminPassword()!);
    await page.getByTitle(/log out/i).click();
    await page.waitForURL(/\/(admin\/)?login/, { timeout: 20_000 });
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
  });
});
