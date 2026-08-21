// =============================================================================
// FILE HỌC: PIM Employee List — FOCUS MODAL (popup xác nhận xóa)
// URL: https://opensource-demo.orangehrmlive.com/web/index.php/pim/viewEmployeeList
//
// Chạy cả file (thấy trình duyệt):
//   npx playwright test -c playwright.config.js tests/pim.modal.learn.spec.js --headed --workers=1
//
// Chạy 1 STEP (khuyên dùng khi học):
//   npx playwright test -c playwright.config.js tests/pim.modal.learn.spec.js -g "STEP1" --headed
//   npx playwright test -c playwright.config.js tests/pim.modal.learn.spec.js -g "STEP2" --ui
//
// Hôm nay học: MODAL = cửa sổ popup nổi lên giữa màn hình
// =============================================================================
//
// =============================================================================
// HƯỚNG DẪN ĐỌC FILE NÀY (đọc trước khi gõ code)
// =============================================================================
//
// 1) Modal là gì?
//    - Giống tờ giấy thông báo đè lên trang web.
//    - Trang phía sau vẫn còn, nhưng bạn phải trả lời popup trước (Yes / No).
//    - Trên OrangeHRM: bấm Delete → hiện "Are you Sure?"
//
// 2) Vì sao học modal?
//    - Nhiều web dùng modal để hỏi lại trước khi xóa / lưu / thoát.
//    - Automation phải biết: mở modal → đọc nội dung → bấm Yes hoặc No → kiểm tra.
//
// 3) Cách học an toàn trên demo (QUAN TRỌNG):
//    - STEP 1–4: chỉ mở modal rồi bấm NO → KHÔNG xóa dữ liệu.
//    - STEP 5: bấm YES (có xóa 1 dòng) — chỉ làm khi đã hiểu STEP 1–4.
//    - KHÔNG xóa user Admin. Ở đây ta xóa trên PIM Employee List (demo hay reset).
//
// 4) Quy trình tay (làm trên web trước khi code):
//    a. Login Admin / admin123
//    b. Vào PIM
//    c. Tick 1 checkbox nhân viên
//    d. Bấm nút thùng rác / Delete Selected
//    e. Thấy popup "Are you Sure?" → thử No rồi thử mở lại
//
// 5) Cách học từng STEP:
//    - Đọc comment "MỤC TIÊU" + "GÕ NHƯ SAU"
//    - Tự gõ vào chỗ TODO (đừng copy nguyên cả file)
//    - Chạy đúng STEP đó cho PASS rồi mới sang STEP tiếp
//
// 6) Nhắc nhanh từ khóa:
//    - click()              = bấm chuột
//    - expect(...).toBeVisible() = mong đợi NHÌN THẤY
//    - expect(...).toBeHidden()  = mong đợi ĐÃ BIẾN MẤT
//    - await                 = đợi bước này xong rồi mới làm bước sau
//
// =============================================================================

require('dotenv').config();
const { test, expect } = require('@playwright/test');
const { URLS, loginAsAdmin, PimEmployeeListPage } = require('../pages');

/**
 * Locator PIM + modal: pages/PimEmployeeListPage.js, pages/ConfirmModal.js
 * Helper mở modal: ui.openDeleteModal()
 */

test.describe('LEARN - PIM Delete Confirmation (Modal)', () => {
  // Demo site đôi khi lỗi khi chạy song song → retry 1 lần
  test.describe.configure({ retries: 1 });

  /**
   * beforeEach = "trước MỖI test"
   * Mỗi STEP đều bắt đầu từ: đã login + đang ở PIM + bảng đã có dữ liệu
   */
  test.beforeEach(async ({ page }) => {
    const ui = new PimEmployeeListPage(page);
    await loginAsAdmin(page);
    await ui.goto();
    await ui.waitForReady();
  });

  // ===========================================================================
  // STEP 1 — Mở được modal
  // MỤC TIÊU: Biết cách "gọi" popup hiện ra và assert nhìn thấy
  //
  // Làm tay trước:
  //   Tick 1 checkbox → bấm Delete → thấy "Are you Sure?"
  //
  // GÕ NHƯ SAU vào trong test (thay chỗ TODO):
  //   const ui = new PimEmployeeListPage(page);
  //
  //   await ui.rowCheckboxes.nth(0).click();
  //   await ui.deleteSelectedButton.click();
  //
  //   await expect(ui.modal).toBeVisible({ timeout: 15_000 });
  //   await expect(ui.modalTitle).toBeVisible();
  //   await expect(ui.yesButton).toBeVisible();
  //   await expect(ui.noButton).toBeVisible();
  //
  // Chạy:
  //   npx playwright test -c playwright.config.js tests/pim.modal.learn.spec.js -g "STEP1" --headed
  // ===========================================================================
  test('STEP1 should open delete confirmation modal', async ({ page }) => {
    // TODO STEP1: tự gõ code theo hướng dẫn phía trên
    const ui = new PimEmployeeListPage(page);

    await ui.rowCheckboxes.nth(0).click();
    await ui.deleteSelectedButton.click();

    await expect(ui.modal).toBeVisible({ timeout: 15_000 });
    await expect(ui.modalTitle).toBeVisible();
    await expect(ui.yesButton).toBeVisible();
    await expect(ui.noButton).toBeVisible();
  });

  // ===========================================================================
  // STEP 2 — Bấm NO → modal ĐÓNG (không xóa)
  // MỤC TIÊU: Hiểu nút No = hủy thao tác + popup biến mất
  //
  // Đây là pattern RẤT HAY DÙNG khi test:
  //   mở modal → cancel → assert modal hidden
  //
  // GÕ NHƯ SAU:
  //   const ui = new PimEmployeeListPage(page);
  //
  //   await ui.openDeleteModal();          // dùng helper cho nhanh
  //
  //   await ui.noButton.click();
  //
  //   await expect(ui.modal).toBeHidden({ timeout: 10_000 });
  //   // (tuỳ chọn) vẫn còn ở trang PIM
  //   await expect(page).toHaveURL(URLS.pimEmployeeList);
  //
  // Chạy:
  //   npx playwright test -c playwright.config.js tests/pim.modal.learn.spec.js -g "STEP2" --headed
  // ===========================================================================
  test('STEP2 should close modal when clicking No', async ({ page }) => {
    const ui = new PimEmployeeListPage(page);

    await ui.openDeleteModal();
    await ui.noButton.click();

    await expect(ui.modal).toBeHidden({ timeout: 10_000 });
    await expect(page).toHaveURL(URLS.pimEmployeeList);
  });

  // ===========================================================================
  // STEP 3 — Trong modal phải thấy đủ chữ + 2 nút
  // MỤC TIÊU: Assert NỘI DUNG modal (không chỉ "có hiện")
  //
  // Vì sao cần?
  //   Modal hiện nhưng sai chữ / thiếu nút = bug UI. Test phải bắt được.
  //
  // Tip: assert chữ dài nên dùng đoạn ngắn ổn định, ví dụ /permanently deleted/i
  //
  // Chạy:
  //   npx playwright test -c playwright.config.js tests/pim.modal.learn.spec.js -g "STEP3" --headed
  // ===========================================================================
  test('STEP3 should show correct modal title and buttons', async ({
    page,
  }) => {
    const ui = new PimEmployeeListPage(page);

    await ui.openDeleteModal();

    await expect(ui.modalTitle).toHaveText(/Are you Sure\?/i);
    await expect(ui.modal).toContainText(/permanently deleted/i);
    await expect(ui.yesButton).toBeVisible();
    await expect(ui.noButton).toBeVisible();

    // Đóng lại cho sạch (an toàn)
    await ui.noButton.click();
    await expect(ui.modal).toBeHidden();
  });

  // ===========================================================================
  // STEP 4 — Mở modal → No → mở lại lần 2 vẫn được
  // MỤC TIÊU: Modal không phải "dùng 1 lần rồi hỏng"
  //
  // LƯU Ý:
  //   Nếu lần 2 FAIL vì checkbox vẫn tick sẵn / Delete không bật:
  //   - Reload trang rồi thử lại, hoặc
  //   - Trước lần 2: await page.reload() rồi chờ bảng hiện lại
  //
  // Chạy:
  //   npx playwright test -c playwright.config.js tests/pim.modal.learn.spec.js -g "STEP4" --headed
  // ===========================================================================
  test('STEP4 should open modal again after clicking No', async ({ page }) => {
    const ui = new PimEmployeeListPage(page);

    // Lần 1
    await ui.openDeleteModal();
    await ui.noButton.click();
    await expect(ui.modal).toBeHidden();

    // Lần 2
    await ui.openDeleteModal();
    await expect(ui.modalTitle).toBeVisible();
    await ui.noButton.click();
    await expect(ui.modal).toBeHidden();
  });

  // ===========================================================================
  // STEP 5 — (TÙY CHỌN) Bấm YES → modal đóng + có thông báo xóa
  // MỤC TIÊU: Biết luồng "xác nhận" (confirm), khác với cancel
  //
  // CẢNH BÁO:
  //   - Bấm Yes sẽ XÓA 1 employee trên demo (site dùng chung, data hay reset).
  //
  // Chạy:
  //   npx playwright test -c playwright.config.js tests/pim.modal.learn.spec.js -g "STEP5" --headed
  // ===========================================================================
  test('STEP5 should confirm delete when clicking Yes', async ({ page }) => {
    const ui = new PimEmployeeListPage(page);

    await ui.openDeleteModal();
    await ui.yesButton.click();

    await expect(ui.modal).toBeHidden({ timeout: 15_000 });
    await expect(ui.confirmModal.successDeleted).toBeVisible({
      timeout: 15_000,
    });
  });

  // ===========================================================================
  // STEP 6 — Tự viết lại KHÔNG dùng helper openDeleteModal
  // MỤC TIÊU: Chứng tỏ bạn nhớ đủ 3 bước: tick → Delete → assert modal
  //
  // Chạy:
  //   npx playwright test -c playwright.config.js tests/pim.modal.learn.spec.js -g "STEP6" --headed
  // ===========================================================================
  test('STEP6 should handle modal flow without helper', async ({ page }) => {
    const ui = new PimEmployeeListPage(page);

    await expect(page).toHaveURL(URLS.pimEmployeeList);
    await ui.rowCheckboxes.nth(0).click();
    await ui.deleteSelectedButton.click();

    await expect(ui.modal).toBeVisible();
    await expect(ui.modalTitle).toBeVisible();

    await ui.noButton.click();
    await expect(ui.modal).toBeHidden();
  });
});
