import { test, expect } from '@playwright/test';

const ADMIN_URL = 'http://localhost:8080';
const FRONTEND_URL = 'http://localhost:5173';

test.describe('Admin to Frontend Synchronization', () => {
  test('should create a trip in Admin and verify it on Frontend', async ({ page }) => {
    // 1. LOGIN TO ADMIN
    await page.goto(`${ADMIN_URL}/admin/login`);
    
    // Fill credentials (using placeholders or types)
    await page.locator('input[type="email"]').fill('admin@youthcamping.in');
    await page.locator('input[type="password"]').fill('admin@123456');
    
    // Click Sign In and wait for response
    await Promise.all([
      page.waitForResponse(res => res.url().includes('/admin/login') && res.status() === 200),
      page.click('button:has-text("Sign In")')
    ]);

    // Wait for the admin UI to appear
    await expect(page.locator('aside').first()).toBeVisible({ timeout: 20000 });
    
    // 2. NAVIGATE TO TRIPS
    await page.goto(`${ADMIN_URL}/admin/trips`);
    
    // Click "Add Trip" - Using more robust locator
    const addBtn = page.getByRole('button', { name: /Add Trip/i });
    await addBtn.click();
    
    // Fill Trip Form
    const testTitle = `Automation Trip ${Date.now()}`;
    await page.fill('input[placeholder="Spiti Valley Expedition"]', testTitle);
    await page.fill('input[placeholder="9 Days"]', '5 Days');
    await page.fill('input[placeholder="15000"]', '9999');
    await page.fill('input[placeholder="Manali"]', 'Test Origin');
    await page.fill('textarea[placeholder*="Describe"]', 'Created by automation test for sync verification.');
    
    // Submit Form
    await page.click('button:has-text("Launch Trip")');
    
    // Verify it appears in the list
    await expect(page.locator(`text=${testTitle}`)).toBeVisible();

    // 3. VERIFY ON FRONTEND
    await page.goto(FRONTEND_URL);
    
    // Wait for data to load
    await expect(page.locator(`text=${testTitle}`).first()).toBeVisible({ timeout: 15000 });
    
    // Click it to ensure detail page works too
    await page.locator(`text=${testTitle}`).first().click();
    await expect(page.locator('h1')).toContainText(testTitle);
  });
});
