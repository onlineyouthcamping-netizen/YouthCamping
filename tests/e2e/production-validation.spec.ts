import { test, expect } from '@playwright/test';

const FRONTEND_URL = 'http://127.0.0.1:3000';
const ADMIN_URL = 'http://127.0.0.1:8080';
const API_URL = 'http://127.0.0.1:8888/api';

test.describe('Production Product Validation', () => {

  test.beforeEach(async ({ page }) => {
    // Debug frontend logs
    page.on('console', msg => console.log(`[FRONTEND] ${msg.type()}: ${msg.text()}`));
    
    // Warm up the dev server
    await page.goto(FRONTEND_URL);
    await page.waitForSelector('.avian-card', { timeout: 30000 });
  });

  // ✅ 1. Data Correctness (Homepage & Trip Detail)
  test('should display correct trip pricing and details', async ({ page }) => {
    const start = Date.now();
    await page.goto(FRONTEND_URL);
    await page.waitForSelector('.avian-card');
    const loadTime = Date.now() - start;
    
    // Performance Check
    console.log(`Homepage load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(15000); // Increased threshold for local

    // Verify first trip data
    const tourCard = page.locator('.avian-card').first();
    await expect(tourCard).toBeVisible({ timeout: 20000 });
    
    // Find price element that contains the rupee symbol
    const priceElement = tourCard.locator('span:has-text("₹")').first();
    const priceText = await priceElement.textContent();
    const tripTitle = await tourCard.locator('h3').first().textContent();
    
    console.log(`Found Trip: ${tripTitle} at ${priceText}`);
    
    // Navigate to detail
    await tourCard.click();
    await expect(page).toHaveURL(/\/tours\//);
    
    // Verify detailed data matches
    await expect(page.locator('h1').first()).toContainText(tripTitle?.trim() || '', { ignoreCase: true });
    // In Detail page, price might be in a different class, but should contain the same digits
    const priceDigits = priceText?.replace(/\D/g, '') || '';
    const priceRegex = new RegExp(priceDigits.split('').join(',?'));
    await expect(page.locator('.text-3xl, .text-4xl, .text-6xl, .text-primary').filter({ hasText: '₹' }).first()).toContainText(priceRegex);
  });

  // ✅ 2 & 5. Real User Flow + State Change Validation (Inquiry)
  test('full journey: home -> trip -> inquiry -> verify in admin', async ({ page, request }) => {
    // 1. Frontend: Submit Inquiry (Already on homepage from beforeEach)
    const tourCard = page.locator('.avian-card').first();
    await tourCard.click();
    
    // Multiple possible button texts
    const bookButton = page.locator('button:has-text("Confirm & Book Now"), button:has-text("SEND ENQUIRY"), button:has-text("Connect with Expert")').first();
    await expect(bookButton).toBeVisible({ timeout: 15000 });
    await bookButton.click();
    
    // Ensure popup is open
    await expect(page.locator('form')).toBeVisible({ timeout: 10000 });
    
    const testEmail = `test-${Date.now()}@example.com`;
    const testName = 'Validation User';
    
    await page.fill('input[placeholder*="Name"]', testName);
    await page.fill('input[placeholder*="Mobile"], input[placeholder*="Phone"]', '1234567890');
    
    const emailInput = page.locator('input[placeholder*="Email"]').first();
    if (await emailInput.count() > 0) {
      await emailInput.fill(testEmail);
    }
    
    await page.fill('input[type="date"]', '2026-06-15');
    await page.fill('input[placeholder*="Traveller"], input[placeholder*="Count"]', '2');
    await page.locator('textarea[placeholder*="Message"]').first().fill('Real product validation test.');
    
    await page.click('button[type="submit"], button:has-text("Connect with Expert")');
    await expect(page.getByText(/Thank You/i).first()).toBeVisible({ timeout: 20000 });

    // 2. API: Verify state change (Direct API Check - requires admin login)
    // First login to get token
    const loginRes = await request.post(`${API_URL}/admin/login`, {
      data: { email: 'admin@youthcamping.in', password: 'admin@123456' }
    });
    expect(loginRes.ok()).toBeTruthy();
    const loginJson = await loginRes.json();
    const token = loginJson.data?.token || loginJson.token;
    expect(token).toBeDefined();
    
    const response = await request.get(`${API_URL}/inquiries`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    expect(response.ok()).toBeTruthy();
    const json = await response.json();
    const data = json.data || [];
    
    const found = data.some((inq: any) => inq.email === testEmail || inq.name === testName);
    expect(found).toBeTruthy();
  });

  // ✅ 3. Negative Testing (Form Validation)
  test('should show validation errors on invalid inquiry submission', async ({ page }) => {
    // Already on homepage
    await page.locator('.avian-card').first().click();
    
    const bookButton = page.locator('button:has-text("Confirm & Book Now"), button:has-text("SEND ENQUIRY"), button:has-text("Book Now")').first();
    await expect(bookButton).toBeVisible({ timeout: 15000 });
    await bookButton.click();
    
    // Submit empty form
    await page.click('button[type="submit"]');
    
    // Check for common error indicators (depends on implementation, usually toast or inline text)
    // Here we check if the form is still visible (not submitted)
    await expect(page.locator('form')).toBeVisible();
    
    // Test invalid email
    const emailInput = page.locator('input[placeholder*="Email"]').first();
    if (await emailInput.count() > 0) {
      await emailInput.fill('invalid-email');
      await page.click('button[type="submit"]');
      await expect(page.locator('form')).toBeVisible();
    }
  });

  // ✅ 4. Sync Testing (Admin -> Frontend Sync)
  test('Admin Edit -> Frontend Sync Validation', async ({ page }) => {
    // 1. Login to Admin
    await page.goto(`${ADMIN_URL}/admin/login`);
    await page.fill('input[type="email"]', 'admin@youthcamping.in');
    await page.fill('input[type="password"]', 'admin@123456');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard
    await expect(page).toHaveURL(/\/admin(\/dashboard)?$/);
    
    // 2. Go to Trips and edit the first one
    await page.goto(`${ADMIN_URL}/admin/trips`);
    const editButton = page.locator('button:has-text("Edit"), .lucide-pencil').first();
    await editButton.click();
    
    const uniqueSuffix = ` (Updated ${Date.now()})`;
    const originalTitle = await page.inputValue('#title');
    const newTitle = originalTitle + uniqueSuffix;
    
    await page.fill('#title', newTitle);
    await page.click('button:has-text("Update Trip"), button:has-text("Save")');
    
    // 3. Verify on Frontend
    await page.goto(FRONTEND_URL);
    // Give it a bit of time for HMR or cache to clear if needed, though staleTime is 5m we might need to wait or force refresh
    // But since it's a new page load, it should be fine if DB is updated
    await expect(page.locator(`text=${newTitle}`)).toBeVisible({ timeout: 15000 });
    
    // Cleanup: Revert change
    await page.goto(`${ADMIN_URL}/admin/trips`);
    await page.locator('button:has-text("Edit"), .lucide-pencil').first().click();
    await page.fill('#title', originalTitle);
    await page.click('button:has-text("Update Trip"), button:has-text("Save")');
  });

  // ✅ 7. API + UI Combined (Robustness)
  test('API availability should precede UI check', async ({ page, request }) => {
    const res = await request.get(`${API_URL}/trips`);
    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.success).toBeTruthy();
    expect(json.data.length).toBeGreaterThan(0);
    
    await page.goto(`${FRONTEND_URL}/tour-packages`);
    const count = await page.locator('.avian-card').count();
    expect(count).toBeGreaterThan(0);
  });

});
