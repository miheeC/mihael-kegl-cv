import { expect, test } from '@playwright/test';

// A visitor whose browser cannot start WebGL: hardware acceleration switched off, a company policy,
// a remote desktop. The other specs can never see this case, because Playwright starts Chrome with
// --enable-unsafe-swiftshader, which gives it software WebGL that an ordinary Chrome no longer has.
test.use({ launchOptions: { args: ['--disable-3d-apis'] } });

test('without WebGL the visitor lands on the CV, not on an error screen', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'Mihael Kegl' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Quality Assurance Team Lead', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Download PDF' })).toBeVisible();
  await expect(page.getByText(/could not start WebGL/)).toHaveCount(0);
  await expect(page).toHaveTitle(/CV/);
});

test('without WebGL the CV offers no way back into a game that cannot run', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'Mihael Kegl' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Back to the bug hunt/ })).toHaveCount(0);
  await expect(page.getByRole('navigation', { name: 'CV actions' })).toContainText('It needs WebGL');
  await expect(page.locator('canvas')).toHaveCount(0);
});
