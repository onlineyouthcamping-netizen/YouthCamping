import { test, expect } from '@playwright/test';
import { attachConsoleMonitor } from '../helpers/console';
import { hasAdminCredentials } from '../helpers/env';
import { adminBaseUrl } from '../helpers/env';

test.describe('console-errors', () => {
  test('public homepage has no application console exceptions', async ({ page }) => {
    const errors: string[] = [];
    attachConsoleMonitor(page, errors);
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.locator('body').waitFor();
    expect(errors, errors.join('\n')).toEqual([]);
  });

  test('admin login page has no application console exceptions', async ({ page }) => {
    const errors: string[] = [];
    attachConsoleMonitor(page, errors);
    await page.goto(`${adminBaseUrl()}/login`, { waitUntil: 'domcontentloaded' });
    await page.locator('body').waitFor();
    const appErrors = errors.filter(
      (e) => !/favicon|manifest|service.?worker/i.test(e),
    );
    expect(appErrors, appErrors.join('\n')).toEqual([]);
  });

  test('authenticated dashboard console is clean when credentials exist', async ({
    page,
  }) => {
    test.skip(!hasAdminCredentials(), 'Skipped: no admin credentials');
    const { loginViaUi } = await import('../helpers/auth');
    const { adminEmail, adminPassword } = await import('../helpers/env');
    const errors: string[] = [];
    attachConsoleMonitor(page, errors);
    await loginViaUi(page, adminEmail()!, adminPassword()!);
    await page.locator('body').waitFor();
    const appErrors = errors.filter(
      (e) => !/favicon|Download the React/i.test(e),
    );
    expect(appErrors, appErrors.join('\n')).toEqual([]);
  });
});
