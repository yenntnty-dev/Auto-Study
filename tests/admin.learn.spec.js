// =============================================================================
// FILE HỌC: viết lại admin.spec.js theo TỪNG STEP
// Chạy: npx playwright test -c playwright.config.js tests/admin.learn.spec.js --headed
//
// Quy tắc học:
// 1. Đọc comment → tự gõ code (đừng copy nguyên admin.spec.js)
// 2. Chạy test Step hiện tại cho pass
// 3. Báo mentor "xong step X" để sang step tiếp
// =============================================================================

// -----------------------------------------------------------------------------
// STEP 1 — NỀN TẢNG: import + hằng số + login + 1 test URL
// Mục tiêu: hiểu vì sao Admin test PHẢI login trước
// -----------------------------------------------------------------------------

// TODO (bạn tự gõ): load biến môi trường từ file .env
require('dotenv').config();
const { test, expect } = require('@playwright/test');
const {
  PATHS,
  URLS,
  loginAsAdmin,
  AdminUsersPage,
} = require('../pages');

/**
 * Locator System Users: pages/AdminUsersPage.js
 * Locator Add User:     pages/AddUserPage.js
 * Login helper:         pages/auth.js
 */

test.describe('LEARN - Admin System Users', () => {
  /**
   * STEP 1.2 — beforeEach
   * Chạy TRƯỚC MỖI test:
   * 1) login
   * 2) goto màn Admin System Users
   * 3) chờ heading "System Users" hiện (trang sẵn sàng)
   */
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    const ui = new AdminUsersPage(page);
    await ui.goto();
    await ui.waitForReady();
  });

  // ===========================================================================
  // STEP 1.3 — Test đầu tiên: kiểm tra URL + title
  // Ý nghĩa tên test: "nên mở trang System Users đúng URL"
  // ===========================================================================
  test('STEP1 should open System Users at /admin/viewSystemUsers', async ({
    page,
  }) => {
    // beforeEach đã đưa bạn tới trang Admin rồi
    // Ở đây chỉ CẦN kiểm tra kết quả
    await expect(page).toHaveURL(URLS.adminUsers);
    await expect(page).toHaveTitle(/OrangeHRM/i);
  });

  // ===========================================================================
  // STEP 2 — NAVIGATION (bạn TỰ VIẾT 3 test bên dưới)
  // Mục tiêu: hiểu điều hướng + session (đã login / chưa login)
  // ===========================================================================
  test.describe('STEP2 Navigation', () => {
    /**
     * TEST A — Chưa login mà vào Admin → phải redirect về login
     *
     * Vì sao KHÔNG dùng `page` của beforeEach?
     * - beforeEach đã login sẵn trên `page`
     * - Muốn giả lập "khách chưa login" → tạo browser context MỚI
     *
     * Gợi ý viết:
     *   1) nhận fixture { browser } (không phải { page })
     *   2) const context = await browser.newContext();
     *   3) const guestPage = await context.newPage();
     *   4) guestPage.goto(URL đầy đủ admin/viewSystemUsers)
     *   5) expect(guestPage).toHaveURL(/\/auth\/login/)
     *   6) await context.close();
     */
    test('STEP2 should redirect to login when opening Admin without auth', async ({
      browser,
    }) => {
      // TODO: tự viết theo gợi ý TEST A ở trên
      const context = await browser.newContext();
      const guestPage = await context.newPage();
      await guestPage.goto(PATHS.adminUsers);
      await expect(guestPage).toHaveURL(/\/auth\/login/, { timeout: 30_000 });
      await context.close();
    });

    /**
     * TEST B — Từ Dashboard, click sidebar "Admin" → vào System Users
     *
     * Gợi ý viết:
     *   1) page.goto('dashboard/index')
     *   2) expect URL có /dashboard/index
     *   3) click link Admin: page.getByRole('link', { name: 'Admin' })
     *   4) expect URL = URLS.adminUsers
     *   5) expect heading "System Users" visible
     */
    test('STEP2 should navigate to System Users via sidebar Admin', async ({
      page,
    }) => {
      // TODO: tự viết theo gợi ý TEST B ở trên
      await page.goto(PATHS.dashboard);
      await expect(page).toHaveURL(/\/dashboard\/index/);
      await page.getByRole('link',{name:'Admin'}).click();
      await expect(page).toHaveURL(URLS.adminUsers);
      await expect(page.getByRole('heading', { name: 'System Users' })).toBeVisible({
        timeout: 30_000,
      });
    });  

    /**
     * TEST C — Ở màn System Users, bấm Add → sang form Add User
     *
     * Gợi ý viết:
     *   1) click button Add: page.getByRole('button', { name: 'Add' })
     *   2) expect URL = URLS.addUser
     *   3) expect heading /Add User/i visible
     */
    test('STEP2 should navigate to Add User form when clicking Add', async ({
      page,
    }) => {
      // TODO: tự viết theo gợi ý TEST C ở trên
      await page.getByRole('button', {name:'Add'}).click();
      await expect(page).toHaveURL(URLS.addUser);
      await expect(page.getByRole('heading', { name: 'Add User' })).toBeVisible({
        timeout: 30_000,
      });
    });
  });

  // ===========================================================================
  // STEP 3 — UI DISPLAY (dùng AdminUsersPage)
  // Mục tiêu: kiểm tra item trên màn có hiện đúng không
  // Pattern mỗi test: const ui = new AdminUsersPage(page); rồi expect(ui.xxx)...
  // ===========================================================================
  test.describe('STEP3 UI Display', () => {
    /**
     * TEST A — Header
     * expect ui.pageTitle chứa /Admin/i
     * expect ui.systemUsersHeading visible + toHaveText('System Users')
     */
    test('STEP3 should display Admin header and System Users heading', async ({
      page,
    }) => {
      const ui = new AdminUsersPage(page);
      await expect (ui.pageTitle).toContainText(/Admin/i);
      await expect (ui.systemUsersHeading).toBeVisible();
      await expect (ui.systemUsersHeading).toHaveText('System Users');
      // TODO: tự viết
    });

    /**
     * TEST B — 4 label filter
     * Username, User Role, Employee Name, Status → đều toBeVisible()
     */
    test('STEP3 should display search filter labels', async ({ page }) => {
      // TODO: tự viết
      const ui = new AdminUsersPage(page);
      await expect(ui.usernameLabel).toBeVisible();
      await expect(ui.userRoleLabel).toBeVisible();
      await expect(ui.employeeNameLabel).toBeVisible();
      await expect(ui.statusLabel).toBeVisible();
      await expect(ui.usernameLabel).toHaveText('Username');
      await expect(ui.userRoleLabel).toHaveText('User Role');
      await expect(ui.employeeNameLabel).toHaveText('Employee Name');
      await expect(ui.statusLabel).toHaveText('Status');
    });

    /**
     * TEST C — input + dropdown
     * usernameInput visible + editable
     * employeeNameInput visible
     * userRoleDropdown + statusDropdown visible
     */
    test('STEP3 should display filter inputs and dropdowns', async ({ page }) => {
      // TODO: tự viết
      const ui = new AdminUsersPage(page);
      await expect(ui.usernameInput).toBeVisible();
      await expect(ui.employeeNameInput).toBeVisible();
      await expect(ui.userRoleDropdown).toBeVisible();
      await expect(ui.statusDropdown).toBeVisible(); 
      await expect(ui.usernameInput).toBeEditable();
      await expect(ui.employeeNameInput).toBeEditable();
    });

    /**
     * TEST D — 3 nút
     * Reset / Search / Add → visible + enabled
     */
    test('STEP3 should display Reset, Search and Add buttons', async ({
      page,
    }) => {
      // TODO: tự viết
      const ui = new AdminUsersPage(page);
      await expect(ui.resetButton).toBeVisible();
      await expect(ui.searchButton).toBeVisible();
      await expect(ui.addButton).toBeVisible();
      await expect(ui.resetButton).toBeEnabled();
      await expect(ui.searchButton).toBeEnabled();
      await expect(ui.addButton).toBeEnabled();
    });

    /**
     * TEST E — cột bảng
     * table visible
     * headers: Username, User Role, Employee Name, Status, Actions
     * gợi ý: for (const header of [...]) {
     *   await expect(ui.tableHeaders.filter({ hasText: header })).toBeVisible();
     * }
     */
    test('STEP3 should display users table with correct column headers', async ({
      page,
    }) => {
      // TODO: tự viết
      const ui = new AdminUsersPage(page);
      await expect(ui.table).toBeVisible();
      const headers = ['Username', 'User Role', 'Employee Name', 'Status', 'Actions'];
      for (const header of headers) {
        await expect(ui.tableHeaders.filter({ hasText: header })).toBeVisible();
      }
    });

    /**
     * TEST F — có data
     * recordsFound visible (timeout 15_000)
     * tableRows.count() >= 1
     */
    test('STEP3 should display records found and at least one user row', async ({
      page,
    }) => {
      // TODO: tự viết
      const ui = new AdminUsersPage(page);
      await expect(ui.recordsFound).toBeVisible({ timeout: 15_000 });
      expect(await ui.tableRows.count()).toBeGreaterThanOrEqual(1);
    });
  });

  // ===========================================================================
  // STEP 4 — Search / Reset / Add User form
  // Mục tiêu: thao tác thật (fill, click dropdown, search) + assert kết quả
  // Lưu ý: sau Search, text "Records Found" đôi khi ẨN → assert theo ROW bảng
  // ===========================================================================

  test.describe('STEP4 Search and Reset', () => {
    /**
     * TEST A — Search theo Username = Admin
     * 1) const ui = new AdminUsersPage(page)
     * 2) ui.usernameInput.fill('Admin')
     * 3) ui.searchButton.click()
     * 4) tìm row: page.locator('.oxd-table-card').filter({ hasText: 'Admin' }).first()
     * 5) expect row visible + toContainText(/Admin/i)
     */
    test('STEP4 should search user by username Admin', async ({ page }) => {
      // TODO: tự viết
      const ui = new AdminUsersPage(page);
      await ui.usernameInput.fill('Admin');
      await ui.searchButton.click();
      const adminRow = page.locator('.oxd-table-card').filter({ hasText: 'Admin' }).first();
      await expect(adminRow).toBeVisible();
      await expect(adminRow).toContainText(/Admin/i);
    });

    /**
     * TEST B — Filter User Role = Admin
     * 1) ui.userRoleDropdown.click()
     * 2) ui.dropdownOptions.filter({ hasText: /^Admin$/ }).click()
     * 3) ui.searchButton.click()
     * 4) expect ui.tableRows.first() visible + chứa /Admin/i
     * 5) count() >= 1
     */
    test('STEP4 should filter by User Role Admin', async ({ page }) => {
      // TODO: tự viết
      const ui = new AdminUsersPage(page);
      await ui.userRoleDropdown.click();
      await ui.dropdownOptions.filter({ hasText: /^Admin$/ }).click();
      await ui.searchButton.click();
      await expect(ui.tableRows.first()).toBeVisible({timeout: 15_000});
      await expect(ui.tableRows.first()).toContainText(/Admin/i, { timeout: 15_000 });
      expect(await ui.tableRows.count()).toBeGreaterThanOrEqual(1);
    });

    /**
     * TEST C — Filter Status = Enabled
     * Giống TEST B nhưng dùng statusDropdown + option /^Enabled$/
     */
    test('STEP4 should filter by Status Enabled', async ({ page }) => {
      // TODO: tự viết
      const ui = new AdminUsersPage(page);
      await ui.statusDropdown.click();
      await ui.dropdownOptions.filter({ hasText: /^Enabled$/ }).click();
      await ui.searchButton.click();
      await expect(ui.tableRows.first()).toBeVisible({timeout: 15_000});
      await expect(ui.tableRows.first()).toContainText(/Enabled/i, { timeout: 15_000 });
      expect(await ui.tableRows.count()).toBeGreaterThanOrEqual(1);
    });

    /**
     * TEST D — Username không tồn tại → No Records Found
     */
    test('STEP4 should show no records for non-existing username', async ({
      page,
    }) => {
      const ui = new AdminUsersPage(page);
      const fakeUser = `no_user_${Date.now()}`;

      await ui.usernameInput.fill(fakeUser);
      await ui.searchButton.click();

      await expect(page.getByText('No Records Found').first()).toBeVisible({
        timeout: 15_000,
      });
    });

    /**
     * TEST E — Reset
     */
    test('STEP4 should reset search filters', async ({ page }) => {
      const ui = new AdminUsersPage(page);

      await ui.usernameInput.fill('Admin');
      await ui.searchButton.click();
      await expect(
        page.locator('.oxd-table-card').filter({ hasText: 'Admin' }).first(),
      ).toBeVisible({ timeout: 15_000 });

      await ui.resetButton.click();
      await expect(ui.usernameInput).toHaveValue('');
      await expect(ui.tableRows.first()).toBeVisible({ timeout: 15_000 });
      expect(await ui.tableRows.count()).toBeGreaterThanOrEqual(1);
    });
  });

  test.describe('STEP4 Add User form', () => {
    /**
     * TEST F — Mở Add User, check field + nút
     */
    test('STEP4 should display required fields on Add User screen', async ({
      page,
    }) => {
      const ui = new AdminUsersPage(page);
      await ui.addButton.click();

      await expect(page).toHaveURL(URLS.addUser, { timeout: 30_000 });
      await expect(
        page.getByRole('heading', { name: 'Add User' }),
      ).toBeVisible();
      await expect(ui.userRoleLabel).toBeVisible();
      await expect(ui.employeeNameLabel).toBeVisible();
      await expect(ui.statusLabel).toBeVisible();
      await expect(ui.usernameLabel).toBeVisible();
      await expect(
        page.locator('.oxd-label', { hasText: 'Password' }).first(),
      ).toBeVisible();
      await expect(
        page.locator('.oxd-label', { hasText: 'Confirm Password' }),
      ).toBeVisible();
      await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
    });

    /**
     * TEST G — Cancel quay lại System Users
     */
    test('STEP4 should return to System Users when clicking Cancel', async ({
      page,
    }) => {
      const ui = new AdminUsersPage(page);
      await ui.addButton.click();
      await expect(page).toHaveURL(URLS.addUser, { timeout: 30_000 });

      await page.getByRole('button', { name: 'Cancel' }).click();

      await expect(page).toHaveURL(URLS.adminUsers, { timeout: 30_000 });
      await expect(
        page.getByRole('heading', { name: 'System Users' }),
      ).toBeVisible({ timeout: 15_000 });
    });

    /**
     * TEST H — Save form trống → Required
     */
    test('STEP4 should show Required when saving empty Add User form', async ({
      page,
    }) => {
      const ui = new AdminUsersPage(page);
      await ui.addButton.click();
      await expect(page).toHaveURL(URLS.addUser, { timeout: 30_000 });

      await page.getByRole('button', { name: 'Save' }).click();

      const requiredMessages = page.locator('.oxd-input-field-error-message');
      await expect(requiredMessages.first()).toBeVisible({ timeout: 15_000 });
      expect(await requiredMessages.count()).toBeGreaterThanOrEqual(1);
      await expect(page).toHaveURL(URLS.addUser);
    });
  });
});
