import { expect, test } from '@playwright/test';

/** The hunt is on and the opening camera move has finished. */
const ready = (page) =>
  page.waitForFunction(() => window.__releaseBlocker?.mode === 'play' && window.__releaseBlocker.tween === null);
const state = (page, id) => page.evaluate((bug) => window.__releaseBlocker.byId[bug].state, id);

/**
 * Clicks a bug with the real mouse, but only once a click at its position would actually hit it
 * (it can be behind the desk, or under another bug). Returns false if it never became clickable.
 */
async function clickBug(page, id, { index = 0, tries = 600 } = {}) {
  for (let i = 0; i < tries; i++) {
    const target = await page.evaluate(
      ([bug, idx]) => {
        const g = window.__releaseBlocker;
        const found = g.locate(bug);
        if (found.state !== 'active') return { gone: true };
        const point = found.points[idx];
        g.aim(point.x, point.y);
        return { point, hittable: g.pick()?.id === bug };
      },
      [id, index],
    );
    if (target.gone) return false;
    if (target.hittable) {
      await page.mouse.click(target.point.x, target.point.y);
      return true;
    }
    await page.waitForTimeout(100);
  }
  return false;
}

async function start(page) {
  await page.goto('/');
  await page.getByRole('button', { name: /Start the bug hunt/ }).click();
  await ready(page);
}

async function expectTicket(page, name) {
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('heading', { level: 2 })).toHaveText(name);
  return dialog;
}

const closeTicket = (page) => page.locator('.ticket-foot .btn.primary').click();

test('intro explains the game and offers a way to skip it', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Eight bugs stand between you and Mihael Kegl');
  await expect(page.getByRole('button', { name: /Start the bug hunt/ })).toBeFocused();
  await page.getByRole('link', { name: /Skip the game/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Mihael Kegl' })).toBeVisible();
});

test('CV page lists every role and links to a PDF that exists', async ({ page, request }) => {
  await page.goto('/#cv');
  for (const role of ['Quality Assurance Team Lead', 'Senior Quality Assurance Engineer', 'Quality Assurance Engineer']) {
    await expect(page.getByRole('heading', { name: role, exact: true })).toBeVisible();
  }
  for (const project of ['QA Squad', 'Feature Dependency Visualizer']) {
    await expect(page.getByRole('heading', { name: project, exact: true })).toBeVisible();
  }
  const href = await page.getByRole('link', { name: 'Download PDF' }).getAttribute('href');
  const pdf = await request.get(new URL(href, page.url()).toString());
  expect(pdf.status()).toBe(200);
  expect(pdf.headers()['content-type']).toContain('pdf');
});

test('a ticket reveals a CV section and progress survives a detour to the CV', async ({ page }) => {
  await start(page);
  expect(await clickBug(page, 'typo')).toBe(true);
  const dialog = await expectTicket(page, 'Typo');
  await expect(dialog).toContainText('QA Team Lead with 8+ years in software quality');
  await dialog.getByRole('link', { name: 'Full CV' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Mihael Kegl' })).toBeVisible();
  await page.getByRole('link', { name: /Back to the bug hunt/ }).click();
  await expect(page.locator('.progress')).toHaveText('1 / 8 filed');
});

test('keyboard only: Tab to a ticket chip, Enter to swat, Escape to close', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: /Start the bug hunt/ })).toBeFocused();
  await page.keyboard.press('Enter');
  await ready(page);
  const chip = page.getByRole('button', { name: /Memory Leak: still loose/ });
  await chip.focus();
  await page.keyboard.press('Enter');
  await expectTicket(page, 'Memory Leak');
  await expect(page.locator('.ticket-foot .btn.primary')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Memory Leak: filed/ })).toBeFocused();
});

test('full hunt with the mouse: every bug behaves as its ticket says', async ({ page }) => {
  await start(page);

  await test.step('Flaky Test cannot be caught while it is invisible', async () => {
    await page.waitForFunction(() => window.__releaseBlocker.byId.flaky.opacity < 0.2);
    await page.evaluate(() => window.__releaseBlocker.attemptById('flaky'));
    await expect(page.locator('.toast')).toContainText('flaky test');
    expect(await state(page, 'flaky')).toBe('active');
    await page.waitForFunction(() => window.__releaseBlocker.byId.flaky.opacity > 0.9);
    expect(await clickBug(page, 'flaky', { tries: 20 })).toBe(true);
    const dialog = await expectTicket(page, 'Flaky Test');
    await expect(dialog).toContainText('Katalon and Selenium');
    await expect(dialog).toContainText('Playwright and Claude Code');
    await closeTicket(page);
  });

  await test.step('Regression comes back and has to be caught twice', async () => {
    expect(await clickBug(page, 'regression')).toBe(true);
    await expect(page.locator('.toast')).toContainText('Fixed and closed');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await page.waitForFunction(() => window.__releaseBlocker.byId.regression.state === 'active');
    await expect(page.locator('.toast')).toContainText('is back');
    expect(await clickBug(page, 'regression')).toBe(true);
    const dialog = await expectTicket(page, 'Regression');
    // The whole career sits on this one ticket.
    for (const role of ['Quality Assurance Team Lead', 'Senior Quality Assurance Engineer', 'Quality Assurance Engineer']) {
      await expect(dialog.getByRole('heading', { name: role, exact: true })).toBeVisible();
    }
    await closeTicket(page);
  });

  await test.step('Race Condition: catching one racer catches both', async () => {
    expect(await clickBug(page, 'race', { index: 1 })).toBe(true);
    const dialog = await expectTicket(page, 'Race Condition');
    await expect(dialog).toContainText('QA Squad');
    await expect(dialog).toContainText('Feature Dependency Visualizer');
    await closeTicket(page);
  });

  for (const [id, name] of [
    ['typo', 'Typo'],
    ['leak', 'Memory Leak'],
    ['edge', 'Edge Case'], // waits until it walks round to a side of the desk the camera can see
  ]) {
    await test.step(name, async () => {
      expect(await clickBug(page, id)).toBe(true);
      await expectTicket(page, name);
      await closeTicket(page);
    });
  }

  await test.step('Low Contrast lights up under the contrast check', async () => {
    await page.getByRole('button', { name: 'Contrast check' }).click();
    await expect(page.getByRole('button', { name: 'Contrast check' })).toHaveAttribute('aria-pressed', 'true');
    expect(await page.evaluate(() => window.__releaseBlocker.byId.contrast.on)).toBe(true);
    expect(await clickBug(page, 'contrast')).toBe(true);
    await expectTicket(page, 'Low Contrast');
    expect(await state(page, 'heisen')).toBe('waiting');
    await closeTicket(page);
  });

  await test.step('Heisenbug appears last and gives up on the third try', async () => {
    await page.waitForFunction(() => window.__releaseBlocker.byId.heisen.state === 'active');
    for (const excuse of ['Cannot reproduce', 'Works on my machine']) {
      await page.mouse.move(4, 4);
      await page.waitForTimeout(1300); // let the pointer go stale so it stops running away
      expect(await clickBug(page, 'heisen')).toBe(true);
      await expect(page.locator('.toast')).toContainText(excuse);
    }
    await page.mouse.move(4, 4);
    await page.waitForTimeout(1300);
    expect(await clickBug(page, 'heisen')).toBe(true);
    const dialog = await expectTicket(page, 'Heisenbug');
    await expect(dialog.getByRole('link', { name: /linkedin\.com\/in\/mihaelkegl/ })).toBeVisible();
    await dialog.getByRole('button', { name: /Ship the release/ }).click();
  });

  await expect(page.getByRole('heading', { name: /Zero open blockers/ })).toBeVisible();
  await expect(page.locator('.progress')).toHaveText('8 / 8 filed');
});
