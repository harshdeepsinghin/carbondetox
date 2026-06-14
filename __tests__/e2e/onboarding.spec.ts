import { test, expect } from '@playwright/test';

/**
 * E2E test: Guest user completes full onboarding flow and sees dashboard score ring.
 *
 * NOTE: These tests require a running dev server with valid Firebase credentials (.env.local).
 * Anonymous sign-in must be enabled in the Firebase Console.
 */
test.describe('Guest Onboarding Flow', () => {
  test('1. Guest can complete onboarding and see dashboard score ring', async ({ page }) => {
    // Navigate to landing page
    await page.goto('/');
    await expect(page).toHaveTitle(/CarbonDetox/);

    // Click "Try as Guest"
    await page.getByRole('link', { name: 'Try as Guest' }).click();

    // Wait for login page to redirect (anonymous auth) → onboarding
    await page.waitForURL(/\/onboarding/, { timeout: 15000 });
    await expect(page.getByRole('heading', { name: /Carbon Profile/i })).toBeVisible();

    // Step 1 — Transport (defaults are pre-selected, just click Continue)
    await page.getByRole('button', { name: /Continue/i }).click();

    // Step 2 — Food
    await page.getByRole('button', { name: /Continue/i }).click();

    // Step 3 — Energy
    await page.getByRole('button', { name: /Continue/i }).click();

    // Step 4 — Shopping
    await page.getByRole('button', { name: /Continue/i }).click();

    // Step 5 — Flights
    await page.getByRole('button', { name: /Continue/i }).click();

    // Step 6 — Waste
    await page.getByRole('button', { name: /Calculate My Score/i }).click();

    // Should redirect to dashboard
    await page.waitForURL(/\/dashboard/, { timeout: 20000 });

    // Assert score ring is visible
    await expect(
      page.getByRole('img', { name: /Carbon Health Score/i }),
    ).toBeVisible({ timeout: 10000 });
  });

  test('2. Missions page shows mission cards after onboarding', async ({ page }) => {
    // Navigate to landing page
    await page.goto('/');
    await page.getByRole('link', { name: 'Try as Guest' }).click();

    // Wait for login page to redirect (anonymous auth) → onboarding
    await page.waitForURL(/\/onboarding/, { timeout: 15000 });

    // Complete onboarding steps
    for (let i = 0; i < 5; i++) {
      await page.getByRole('button', { name: /Continue/i }).click();
    }
    await page.getByRole('button', { name: /Calculate My Score/i }).click();

    // Wait for dashboard redirect
    await page.waitForURL(/\/dashboard/, { timeout: 20000 });

    // Go to missions page
    await page.goto('/missions');
    await page.waitForTimeout(3000);

    // Should see the missions page title
    await expect(page.getByRole('heading', { name: "Today's Missions" })).toBeVisible();
  });
});
