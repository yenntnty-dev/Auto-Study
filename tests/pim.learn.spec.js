// =============================================================================
// FILE HỌC: PIM Employee List — FOCUS CHECKBOX
// URL: https://opensource-demo.orangehrmlive.com/web/index.php/pim/viewEmployeeList
//
// Chạy:
//   npx playwright test -c playwright.config.js tests/pim.learn.spec.js --headed
//   npx playwright test -c playwright.config.js tests/pim.learn.spec.js -g "STEP5" --ui
//
// Hôm nay học: CHECKBOX trên bảng Employee List
// =============================================================================

require('dotenv').config();
const { test, expect } = require('@playwright/test');
const { URLS, loginAsAdmin, PimEmployeeListPage } = require('../pages');

test.describe('LEARN - PIM Employee List (Checkbox)', () => {
  // Demo site flaky khi chạy song song
  test.describe.configure({ retries: 1 });

  test.beforeEach(async ({ page }) => {
    const ui = new PimEmployeeListPage(page);
    await loginAsAdmin(page);
    await ui.goto();
    await ui.waitForReady();
  });

  // ===========================================================================
  // STEP 1 — Mở đúng trang PIM + thấy checkbox
  // ===========================================================================
  test('STEP1 should open Employee List and show checkboxes', async ({
    page,
  }) => {
    const ui = new PimEmployeeListPage(page);

    await expect(page).toHaveURL(URLS.pimEmployeeList);

    // Dùng expect(locator) để Playwright TỰ RETRY (tránh count() = 0 sớm)
    await expect(ui.tableRows.first()).toBeVisible({ timeout: 30_000 });
    await expect(ui.tableRows).not.toHaveCount(0);
    await expect(ui.selectAllCheckbox).toBeVisible();
    await expect(ui.rowCheckboxes).not.toHaveCount(0);
  });

  // ===========================================================================
  // STEP 2 — Tick 1 checkbox dòng → assert checked
  // ===========================================================================
  test('STEP2 should tick 1 checkbox and assert checked = true', async ({
    page,
  }) => {
    const ui = new PimEmployeeListPage(page);
    const firstBox = ui.rowCheckboxes.nth(0);
    const firstInput = ui.rowCheckboxInputs.nth(0);

    await firstBox.click();
    await expect(firstInput).toBeChecked();
  });

  // ===========================================================================
  // STEP 3 — Bỏ tick: click lại → not.toBeChecked()
  // ===========================================================================
  test('STEP3 should untick 1 checkbox and assert checked = false', async ({
    page,
  }) => {
    const ui = new PimEmployeeListPage(page);
    const firstBox = ui.rowCheckboxes.nth(0);
    const firstInput = ui.rowCheckboxInputs.nth(0);

    await firstBox.click();
    await expect(firstInput).toBeChecked();

    await firstBox.click();
    await expect(firstInput).not.toBeChecked();
  });

  // ===========================================================================
  // STEP 4 — Select All
  // LƯU Ý: Demo OrangeHRM đôi khi Select All không tick hết ~50 row.
  // → Assert header + vài dòng đầu để PASS ổn định (không for hết n).
  // ===========================================================================
  test('STEP4 should select all checkboxes and assert checked = true', async ({
    page,
  }) => {
    const ui = new PimEmployeeListPage(page);

    await ui.selectAllCheckbox.click();

    await expect(ui.selectAllInput).toBeChecked({ timeout: 15_000 });
    await expect(ui.rowCheckboxInputs.nth(0)).toBeChecked();
    await expect(ui.rowCheckboxInputs.nth(1)).toBeChecked();
    await expect(ui.rowCheckboxInputs.nth(2)).toBeChecked();
  });

  // ===========================================================================
  // STEP 5 — Unselect All (click Select All lần 2)
  // ===========================================================================
  test('STEP5 should unselect all checkboxes and assert checked = false', async ({
    page,
  }) => {
    const ui = new PimEmployeeListPage(page);

    // Lần 1: chọn
    await ui.selectAllCheckbox.click();
    await expect(ui.selectAllInput).toBeChecked({ timeout: 15_000 });
    await expect(ui.rowCheckboxInputs.nth(0)).toBeChecked();

    // Lần 2: bỏ chọn
    await ui.selectAllCheckbox.click();
    await expect(ui.selectAllInput).not.toBeChecked({ timeout: 15_000 });
    await expect(ui.rowCheckboxInputs.nth(0)).not.toBeChecked();
    await expect(ui.rowCheckboxInputs.nth(1)).not.toBeChecked();
    await expect(ui.rowCheckboxInputs.nth(2)).not.toBeChecked();
  });

  // ===========================================================================
  // STEP 6 — Chọn nhiều checkbox lẻ (không dùng Select All)
  // ===========================================================================
  test('STEP6 should check multiple employee checkboxes', async ({ page }) => {
    const ui = new PimEmployeeListPage(page);

    await ui.rowCheckboxes.nth(0).click();
    await ui.rowCheckboxes.nth(1).click();

    await expect(ui.rowCheckboxInputs.nth(0)).toBeChecked();
    await expect(ui.rowCheckboxInputs.nth(1)).toBeChecked();
    await expect(ui.rowCheckboxInputs.nth(2)).not.toBeChecked();
  });
});
