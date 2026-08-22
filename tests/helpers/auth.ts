import { test as base, expect, type Page } from '@playwright/test';
import { loginAdminApi, type AdminSession } from '../helpers/api';
import { adminBaseUrl, hasAdminCredentials } from '../helpers/env';

export const test = base.extend<{
  adminSession: AdminSession;
  adminPage: Page;
}>({
  adminSession: async ({}, use, testInfo) => {
    if (!hasAdminCredentials()) {
      testInfo.skip(true, 'E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD are not set.');
      return;
    }
    const session = await loginAdminApi();
    await use(session);
  },
  adminPage: async ({ page, adminSession }, use) => {
    await page.addInitScript(
      ({ token, admin }) => {
        localStorage.setItem('token', token);
        localStorage.setItem('admin_user', JSON.stringify(admin));
      },
      { token: adminSession.token, admin: adminSession.admin },
    );
    await use(page);
  },
});

export { expect };

export async function gotoAdmin(page: Page, path = '/admin') {
  const url = `${adminBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`;
  await page.goto(url, { waitUntil: 'domcontentloaded' });
}

export async function loginViaUi(page: Page, email: string, password: string) {
  await page.goto(`${adminBaseUrl()}/login`, { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
  await page.locator('#admin-email').fill(email);
  await page.locator('#admin-password').fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(/\/admin/, { timeout: 30_000 });
}
