// =============================================================================
// FILE HỌC: PIM Employee List — FOCUS SCROLL (tự viết từng STEP)
// URL: https://opensource-demo.orangehrmlive.com/web/index.php/pim/viewEmployeeList
//
// Chạy 1 STEP:
//   npx playwright test -c playwright.config.js tests/pim.scroll.learn.spec.js -g "STEP1" --headed
//   npx playwright test -c playwright.config.js tests/pim.scroll.learn.spec.js -g "STEP2" --headed
//
// Chạy cả file:
//   npx playwright test -c playwright.config.js tests/pim.scroll.learn.spec.js --headed --workers=1
//
// Hôm nay học: SCROLL
// =============================================================================

require('dotenv').config();
const { test, expect } = require('@playwright/test');
const { URLS, loginAsAdmin, PimEmployeeListPage } = require('../pages');

test.describe('LEARN - PIM Employee List (Scroll)', () => {
  test.describe.configure({ retries: 1 });

  test.beforeEach(async ({ page }) => {
    const ui = new PimEmployeeListPage(page);
    await loginAsAdmin(page);
    await ui.goto();
    await ui.waitForReady();
  });

  // ===========================================================================
  // STEP 1 — scrollIntoViewIfNeeded tới dòng cuối
  // ===========================================================================
  test('STEP1 should scroll last employee row into view', async ({ page }) => {
    const ui = new PimEmployeeListPage(page);

    await expect(page).toHaveURL(URLS.pimEmployeeList);
    await expect(ui.tableRows.first()).toBeVisible();

    await ui.lastRow.scrollIntoViewIfNeeded();
    await expect(ui.lastRow).toBeVisible({ timeout: 15_000 });
  });

  // ===========================================================================
  // STEP 2 — Cuộn cả trang: xuống cuối → về đầu
  // ===========================================================================
  test('STEP2 should scroll to bottom then back to top', async ({ page }) => {
    const ui = new PimEmployeeListPage(page);

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(ui.lastRow).toBeVisible({ timeout: 15_000 });

    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(ui.heading.first()).toBeVisible();
    await expect(ui.firstRow).toBeVisible();
  });

  // ===========================================================================
  // STEP 3 — mouse.wheel
  // ===========================================================================
  test('STEP3 should scroll page using mouse wheel', async ({ page }) => {
    const ui = new PimEmployeeListPage(page);

    await ui.table.hover();
    await page.mouse.wheel(0, 1200);

    await expect(page).toHaveURL(URLS.pimEmployeeList);
    await expect(ui.table).toBeVisible();

    await page.mouse.wheel(0, -1200);
    await expect(ui.heading.first()).toBeVisible();
  });

  // ===========================================================================
  // STEP 4 — Scroll rồi tick checkbox dòng cuối
  // ===========================================================================
  test('STEP4 should scroll to last row then tick its checkbox', async ({
    page,
  }) => {
    const ui = new PimEmployeeListPage(page);
    const lastCheckbox = ui.rowCheckboxes.last();
    const lastInput = ui.rowCheckboxInputs.last();

    await ui.lastRow.scrollIntoViewIfNeeded();
    await expect(ui.lastRow).toBeVisible();

    await lastCheckbox.click();
    await expect(lastInput).toBeChecked({ timeout: 10_000 });
  });

  // ===========================================================================
  // STEP 5 — Scroll tới Records Found + Add + về heading
  // ===========================================================================
  test('STEP5 should scroll specific controls into view', async ({ page }) => {
    const ui = new PimEmployeeListPage(page);

    await ui.recordsFound.first().scrollIntoViewIfNeeded();
    await expect(ui.recordsFound.first()).toBeVisible({ timeout: 15_000 });

    await ui.addButton.scrollIntoViewIfNeeded();
    await expect(ui.addButton).toBeVisible();

    await ui.heading.first().scrollIntoViewIfNeeded();
    await expect(ui.heading.first()).toBeVisible();
  });
});
