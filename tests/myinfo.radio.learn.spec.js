// =============================================================================
// FILE HỌC: My Info / Personal Details — FOCUS RADIO BUTTON
// URL: https://opensource-demo.orangehrmlive.com/web/index.php/pim/viewPersonalDetails/empNumber/7
//
// Chạy:
//   npx playwright test -c playwright.config.js tests/myinfo.radio.learn.spec.js --headed
//   npx playwright test -c playwright.config.js tests/myinfo.radio.learn.spec.js -g "STEP3" --ui
//
// Hôm nay học: RADIO BUTTON (trường Gender)
// =============================================================================

require('dotenv').config();
const { test, expect } = require('@playwright/test');
const { URLS, loginAsAdmin, MyInfoPage } = require('../pages');

test.describe('LEARN - My Info Gender (Radio Button)', () => {
  // Demo site flaky khi chạy song song
  test.describe.configure({ retries: 1 });

  test.beforeEach(async ({ page }) => {
    const ui = new MyInfoPage(page);
    await loginAsAdmin(page);
    await ui.goto();
    await ui.waitForGenderReady();
  });

  // ===========================================================================
  // STEP 1 — Mở đúng trang My Info + thấy 2 radio Gender
  // ===========================================================================
  test('STEP1 should open Personal Details and show Gender radios', async ({
    page,
  }) => {
    const ui = new MyInfoPage(page);

    await expect(page).toHaveURL(URLS.myInfoPersonalDetails);
    await expect(ui.heading.first()).toBeVisible();
    await expect(ui.genderLabel).toBeVisible();

    await expect(ui.maleCircle).toBeVisible();
    await expect(ui.femaleCircle).toBeVisible();
    await expect(ui.maleInput).toBeAttached();
    await expect(ui.femaleInput).toBeAttached();
  });

  // ===========================================================================
  // STEP 2 — Click Male → assert Male checked, Female NOT checked
  // ===========================================================================
  test('STEP2 should select Male and assert exclusive checked state', async ({
    page,
  }) => {
    const ui = new MyInfoPage(page);

    await ui.maleCircle.click();

    await expect(ui.maleInput).toBeChecked();
    await expect(ui.femaleInput).not.toBeChecked();
  });

  // ===========================================================================
  // STEP 3 — Chọn Female → Male tự bỏ chọn (tính chất radio)
  // ===========================================================================
  test('STEP3 should select Female and uncheck Male automatically', async ({
    page,
  }) => {
    const ui = new MyInfoPage(page);

    await ui.maleCircle.click();
    await expect(ui.maleInput).toBeChecked();

    await ui.femaleCircle.click();
    await expect(ui.femaleInput).toBeChecked();
    await expect(ui.maleInput).not.toBeChecked();
  });

  // ===========================================================================
  // STEP 4 — Click cả wrapper (chữ Male/Female), assert theo value
  // ===========================================================================
  test('STEP4 should select by clicking radio wrapper label', async ({
    page,
  }) => {
    const ui = new MyInfoPage(page);

    await ui.femaleWrapper.click();
    await expect(ui.femaleByValue).toBeChecked();
    await expect(ui.maleByValue).not.toBeChecked();

    await ui.maleWrapper.click();
    await expect(ui.maleByValue).toBeChecked();
    await expect(ui.femaleByValue).not.toBeChecked();
  });

  // ===========================================================================
  // STEP 5 — Radio KHÔNG bỏ chọn khi click lại cùng option
  // (Khác checkbox: click lần 2 của checkbox = untick)
  // ===========================================================================
  test('STEP5 should stay checked when clicking the same radio again', async ({
    page,
  }) => {
    const ui = new MyInfoPage(page);

    await ui.maleCircle.click();
    await expect(ui.maleInput).toBeChecked();

    // Click lại Male → vẫn checked (không toggle off)
    await ui.maleCircle.click();
    await expect(ui.maleInput).toBeChecked();
    await expect(ui.femaleInput).not.toBeChecked();
  });

  // ===========================================================================
  // STEP 6 — Đổi qua lại Male ↔ Female vài lần (assert mỗi lần)
  // ===========================================================================
  test('STEP6 should switch Gender between Male and Female', async ({
    page,
  }) => {
    const ui = new MyInfoPage(page);

    await ui.maleCircle.click();
    await expect(ui.maleInput).toBeChecked();
    await expect(ui.femaleInput).not.toBeChecked();

    await ui.femaleCircle.click();
    await expect(ui.femaleInput).toBeChecked();
    await expect(ui.maleInput).not.toBeChecked();

    await ui.maleCircle.click();
    await expect(ui.maleInput).toBeChecked();
    await expect(ui.femaleInput).not.toBeChecked();
  });
});
