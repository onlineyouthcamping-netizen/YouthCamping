import { test, expect } from '@playwright/test';

test.describe('YouthCamping Frontend E2E', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');
    
    // Verify the hero section - Using more flexible text locator
    await expect(page.getByText(/Adventure/i).first()).toBeVisible({ timeout: 15000 });
    
    // Verify the navbar
    await expect(page.locator('nav').first()).toBeVisible();
  });

  test('should navigate to a trip detail page', async ({ page }) => {
    await page.goto('/');
    
    // Find the first tour card and click it
    const tourCard = page.locator('.avian-card').first();
    await expect(tourCard).toBeVisible({ timeout: 10000 });
    
    const tripTitle = await tourCard.locator('h3').textContent();
    await tourCard.click();
    
    // Verify we are on the trip page
    await expect(page).toHaveURL(/\/tours\//);
    if (tripTitle) {
      // Check if the title is present (ignoring case/extra whitespace)
      const h1Text = await page.locator('h1').textContent();
      expect(h1Text?.toLowerCase()).toContain(tripTitle.trim().toLowerCase());
    }
  });

  test('should submit an inquiry form', async ({ page }) => {
    // Navigate to a specific trip
    await page.goto('/');
    await page.locator('.avian-card').first().click();
    
    // Click "Confirm & Book Now" to open inquiry popup
    const bookButton = page.locator('button:has-text("Confirm & Book Now"), button:has-text("SEND ENQUIRY")').first();
    await bookButton.click();
    
    // Wait for popup
    await expect(page.locator('form')).toBeVisible();
    
    // Fill the form
    await page.fill('input[placeholder*="Name"]', 'Test User');
    await page.fill('input[placeholder*="Mobile"]', '9876543210');
    
    // Fill email if present
    const emailInput = page.locator('input[placeholder*="Email"]').first();
    if (await emailInput.count() > 0) {
      await emailInput.fill('test@example.com');
    }
    
    // Date input
    await page.fill('input[type="date"]', '2026-05-20');
    
    await page.locator('input[placeholder*="Traveller"]').first().fill('2');
    await page.locator('textarea[placeholder*="Message"]').first().fill('This is a test inquiry.');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Verify success message
    await expect(page.getByText(/Thank You/i).first()).toBeVisible({ timeout: 15000 });
  });
});
