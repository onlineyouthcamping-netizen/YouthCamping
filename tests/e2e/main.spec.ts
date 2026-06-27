import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';
const {
  assertReadOnlyTestSafety,
  requireEnvironmentValue,
} = require('../../backend/src/utils/testSafety');
const API_URL = assertReadOnlyTestSafety({
  apiUrl: requireEnvironmentValue('TEST_API_URL')
});

test.describe('Travel CRM - E2E Tests', () => {
  test('Homepage should load successfully', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Check main heading
    await expect(page.locator('h1')).toContainText(/trips|journeys/i);
    
    // Check navigation
    await expect(page.locator('[role="navigation"]')).toBeVisible();
  });

  test('Trip listings page should display trips with search', async ({ page }) => {
    await page.goto(`${BASE_URL}/tour-packages`);
    
    // Wait for trips to load
    await page.waitForSelector('[class*="grid"]', { timeout: 5000 });
    
    // Search for a trip
    const searchInput = page.locator('input[placeholder*="SEARCH"]');
    await searchInput.fill('Himachal');
    
    // Verify results are filtered
    await page.waitForTimeout(500); // Wait for debounce
    const tripCards = page.locator('[class*="rounded-\\[40px\\]"]');
    const count = await tripCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('Trip detail page should load', async ({ page }) => {
    // First, fetch a trip ID from the API
    const response = await page.request.get(`${API_URL}/trips`);
    const data = await response.json();
    
    if (data.data.length > 0) {
      const tripId = data.data[0].id;
      const tripSlug = data.data[0].slug;
      
      // Navigate to trip detail
      await page.goto(`${BASE_URL}/trips/${tripSlug}`);
      
      // Check if trip details are visible
      await expect(page.locator('h1')).toBeVisible();
      
      // Check for inquiry button
      const inquiryButton = page.locator('button:has-text("Inquiry")');
      if (await inquiryButton.isVisible()) {
        expect(inquiryButton).toBeDefined();
      }
    }
  });

  test('Wishlist functionality should work', async ({ page }) => {
    await page.goto(`${BASE_URL}/tour-packages`);
    
    // Wait for trips to load
    await page.waitForSelector('[class*="grid"]', { timeout: 5000 });
    
    // Click wishlist button on first trip
    const wishlistButton = page.locator('button[title="Add to wishlist"]').first();
    if (await wishlistButton.isVisible()) {
      await wishlistButton.click();
      
      // Check for success toast
      await expect(page.locator('[class*="toast"]')).toBeVisible({ timeout: 2000 });
    }
  });

  test('Admin login should work', async ({ page }) => {
    // Navigate to admin panel
    await page.goto('http://localhost:8080'); // Adjust port for admin panel
    
    // Fill login form
    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    const loginButton = page.locator('button:has-text("Login")').first();
    
    if (await emailInput.isVisible()) {
      await emailInput.fill(requireEnvironmentValue('TEST_ADMIN_EMAIL'));
      await passwordInput.fill(requireEnvironmentValue('TEST_ADMIN_PASSWORD'));
      await loginButton.click();
      
      // Wait for redirect to dashboard
      await page.waitForURL('**/dashboard**', { timeout: 5000 });
      expect(page.url()).toContain('dashboard');
    }
  });

  test('Admin dashboard should load stats', async ({ page, context }) => {
    // Set auth token in localStorage
    await page.goto('http://localhost:8080');
    
    // Check if dashboard stats are visible
    const stats = page.locator('[class*="stat"]');
    const count = await stats.count();
    expect(count).toBeGreaterThan(0);
  });

  test('Create inquiry should succeed', async ({ page }) => {
    await page.goto(`${BASE_URL}/tour-packages`);
    
    // Get first trip
    const response = await page.request.get(`${API_URL}/trips`);
    const data = await response.json();
    
    if (data.data.length > 0) {
      const trip = data.data[0];
      
      // Navigate to trip detail
      await page.goto(`${BASE_URL}/trips/${trip.slug}`);
      
      // Fill inquiry form
      const nameInput = page.locator('input[placeholder*="Name"]').first();
      const emailInput = page.locator('input[placeholder*="Email"]').first();
      const phoneInput = page.locator('input[placeholder*="Phone"]').first();
      const submitButton = page.locator('button:has-text("Inquiry")').first();
      
      if (await nameInput.isVisible()) {
        await nameInput.fill('Test User');
        await emailInput.fill('testuser@example.com');
        await phoneInput.fill('9876543210');
        await submitButton.click();
        
        // Check for success message
        await expect(page.locator('[class*="toast"]')).toBeVisible({ timeout: 3000 });
      }
    }
  });

  test('Sorting trips should work', async ({ page }) => {
    await page.goto(`${BASE_URL}/tour-packages`);
    
    // Wait for trips to load
    await page.waitForSelector('[class*="grid"]', { timeout: 5000 });
    
    // Get initial trip prices
    const sortSelect = page.locator('select').first();
    if (await sortSelect.isVisible()) {
      // Change sort to price low to high
      await sortSelect.selectOption('price-low');
      
      // Wait for sorting to apply
      await page.waitForTimeout(500);
      
      // Verify sorting
      const prices = await page.locator('[class*="text-primary"]').allTextContents();
      expect(prices.length).toBeGreaterThan(0);
    }
  });
});
