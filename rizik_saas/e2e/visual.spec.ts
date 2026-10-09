import { test, expect } from '@playwright/test';

const ROUTES = [
  '/',
  '/global',
  '/about',
  '/contact',
  '/oathlink'
];

test.describe('Visual Regression Tests', () => {
  for (const route of ROUTES) {
    test(`Visual test for ${route}`, async ({ page }) => {
      // Fail on console.error
      page.on('console', msg => {
        if (msg.type() === 'error') {
          throw new Error(`Console error encountered: ${msg.text()}`);
        }
      });

      // Fail on uncaught exceptions
      page.on('pageerror', err => {
        throw new Error(`Uncaught exception encountered: ${err.message}`);
      });

      const response = await page.goto(route);

      expect(response).not.toBeNull();
      if (response) {
        expect(response.status(), `Expected route ${route} to have HTTP 200, got ${response.status()}`).toBe(200);
      }

      await expect(page).toHaveScreenshot({ fullPage: true });
    });
  }
});
