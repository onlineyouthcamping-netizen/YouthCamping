import { test, expect } from '@playwright/test';
import { attachApiMonitor, assertNoServerErrors, type TrackedFailure } from '../helpers/network';
import { discoverPublicTripSlug } from '../helpers/discovery';
import { publicBaseUrl } from '../helpers/env';

test.describe('public.smoke', () => {
  test('homepage loads with title and main content', async ({ page }) => {
    const failures: TrackedFailure[] = [];
    attachApiMonitor(page, failures, 'homepage');

    const response = await page.goto('/', { waitUntil: 'domcontentloaded' });
    expect(response?.status(), 'homepage HTTP status').toBeLessThan(500);
    await expect(page).toHaveTitle(/YouthCamping/i);
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('nav').first()).toBeVisible();
    assertNoServerErrors(failures);
  });

  test('navigation opens trips page and a discovered trip detail', async ({ page }) => {
    const failures: TrackedFailure[] = [];
    attachApiMonitor(page, failures, 'trips-nav');

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const tripsLink = page.getByRole('link', { name: /^trips$/i }).first();
    if (await tripsLink.isVisible()) {
      await tripsLink.click();
    } else {
      await page.goto('/trips', { waitUntil: 'domcontentloaded' });
    }
    await expect(page).toHaveURL(/\/trips/);
    await expect(page.locator('body')).toBeVisible();

    const slug = await discoverPublicTripSlug(publicBaseUrl());
    if (!slug) {
      const card = page.locator('a[href^="/trips/"]').first();
      if ((await card.count()) === 0) {
        test.info().annotations.push({
          type: 'note',
          description: 'No public trip cards available to open a detail page',
        });
        assertNoServerErrors(failures);
        return;
      }
      await card.click();
    } else {
      await page.goto(`/trips/${slug}`, { waitUntil: 'domcontentloaded' });
    }

    const detail = page.url();
    expect(detail).toMatch(/\/trips\//);
    expect(page.url()).not.toMatch(/404/);
    await expect(page.locator('body')).toBeVisible();
    assertNoServerErrors(failures);
  });
});
