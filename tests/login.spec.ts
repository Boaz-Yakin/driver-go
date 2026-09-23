import { test, expect } from '@playwright/test';

test('login page has title', async ({ page }) => {
  await page.goto('/login');
  await expect(page.locator('h1')).toContainText('Driver-Go');
});
