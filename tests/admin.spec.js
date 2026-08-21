require('dotenv').config();
const { test, expect } = require('@playwright/test');
const {
  PATHS,
  URLS,
  loginAsAdmin,
  AdminUsersPage,
  AddUserPage,
} = require('../pages');

/**
 * OrangeHRM Admin - System Users Automation Tests
 * Page URL: https://opensource-demo.orangehrmlive.com/web/index.php/admin/viewSystemUsers
 *
 * Coverage:
 * 1. Navigation / URL
 * 2. UI display (header, filter form, buttons, table, menus)
 * 3. Search / Reset
 * 4. Add User navigation + form UI
 *
 * Page Object: pages/AdminUsersPage.js, pages/AddUserPage.js
 */

test.describe('OrangeHRM - Admin System Users', () => {
  // Demo site đôi khi flaky → retry 1 lần khi fail
  test.describe.configure({ retries: 1 });

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    const ui = new AdminUsersPage(page);
    await ui.goto();
    await ui.waitForReady();
  });

  // ===========================================================================
  // 1. Navigation
  // ===========================================================================
  test.describe('Navigation', () => {
    test('should open System Users page at /admin/viewSystemUsers', async ({
      page,
    }) => {
      await expect(page).toHaveURL(URLS.adminUsers);
      await expect(page).toHaveTitle(/OrangeHRM/i);
    });

    test('should redirect to login when opening Admin URL without auth', async ({
      browser,
    }) => {
      // Context mới = chưa login
      const context = await browser.newContext();
      const guestPage = await context.newPage();

      await guestPage.goto(PATHS.adminUsers, { waitUntil: 'domcontentloaded' });

      await expect(guestPage).toHaveURL(/\/auth\/login/, { timeout: 30_000 });
      await context.close();
    });

    test('should navigate to System Users via sidebar Admin menu', async ({
      page,
    }) => {
      // Về dashboard rồi click Admin trên sidebar
      await page.goto(PATHS.dashboard, { waitUntil: 'domcontentloaded' });
      await expect(page).toHaveURL(URLS.dashboard, { timeout: 30_000 });

      const ui = new AdminUsersPage(page);
      await ui.sideMenuAdmin.click();

      await expect(page).toHaveURL(URLS.adminUsers, { timeout: 30_000 });
      await expect(ui.systemUsersHeading).toBeVisible();
    });

    test('should navigate to Add User form when clicking Add', async ({
      page,
    }) => {
      const ui = new AdminUsersPage(page);
      await ui.addButton.click();

      await expect(page).toHaveURL(URLS.addUser, { timeout: 30_000 });
      await expect(new AddUserPage(page).heading).toBeVisible();
    });
  });

  // ===========================================================================
  // 2. UI Display
  // ===========================================================================
  test.describe('UI Display', () => {
    test('should display Admin header and System Users heading', async ({
      page,
    }) => {
      const ui = new AdminUsersPage(page);

      await expect(ui.pageTitle).toContainText(/Admin/i);
      await expect(ui.systemUsersHeading).toBeVisible();
      await expect(ui.systemUsersHeading).toHaveText('System Users');
    });

    test('should display search filter labels', async ({ page }) => {
      const ui = new AdminUsersPage(page);

      await expect(ui.usernameLabel).toBeVisible();
      await expect(ui.userRoleLabel).toBeVisible();
      await expect(ui.employeeNameLabel).toBeVisible();
      await expect(ui.statusLabel).toBeVisible();
    });

    test('should display filter inputs and dropdowns', async ({ page }) => {
      const ui = new AdminUsersPage(page);

      await expect(ui.usernameInput).toBeVisible();
      await expect(ui.usernameInput).toBeEditable();
      await expect(ui.employeeNameInput).toBeVisible();
      await expect(ui.userRoleDropdown).toBeVisible();
      await expect(ui.statusDropdown).toBeVisible();
    });

    test('should display Reset, Search and Add buttons', async ({ page }) => {
      const ui = new AdminUsersPage(page);

      await expect(ui.resetButton).toBeVisible();
      await expect(ui.resetButton).toBeEnabled();
      await expect(ui.searchButton).toBeVisible();
      await expect(ui.searchButton).toBeEnabled();
      await expect(ui.addButton).toBeVisible();
      await expect(ui.addButton).toBeEnabled();
    });

    test('should display Admin top navigation menus', async ({ page }) => {
      const ui = new AdminUsersPage(page);
      const expectedMenus = [
        'User Management',
        'Job',
        'Organization',
        'Qualifications',
        'Nationalities',
        'Corporate Branding',
        'Configuration',
      ];

      for (const name of expectedMenus) {
      await expect(
        ui.topNav.getByText(name, { exact: true }),
      ).toBeVisible();
      }

      expect(await ui.topMenus.count()).toBeGreaterThanOrEqual(
        expectedMenus.length,
      );
    });

    test('should display users table with correct column headers', async ({
      page,
    }) => {
      const ui = new AdminUsersPage(page);
      const expectedHeaders = [
        'Username',
        'User Role',
        'Employee Name',
        'Status',
        'Actions',
      ];

      await expect(ui.table).toBeVisible();

      for (const header of expectedHeaders) {
        await expect(ui.tableHeaders.filter({ hasText: header })).toBeVisible();
      }
    });

    test('should display records found and at least one user row', async ({
      page,
    }) => {
      const ui = new AdminUsersPage(page);

      await expect(ui.recordsFound).toBeVisible({ timeout: 15_000 });
      expect(await ui.tableRows.count()).toBeGreaterThanOrEqual(1);
    });
  });

  // ===========================================================================
  // 3. Search / Reset
  // ===========================================================================
  test.describe('Search and Reset', () => {
    test('should search user by username Admin', async ({ page }) => {
      const ui = new AdminUsersPage(page);

      await ui.usernameInput.fill('Admin');
      await ui.searchButton.click();

      // Sau Search: assert theo row trong bảng (text Records Found có thể ẩn)
      const adminRow = ui.rowByText('Admin');
      await expect(adminRow).toBeVisible({ timeout: 15_000 });
      await expect(adminRow).toContainText(/Admin/i);
    });

    test('should filter by User Role Admin', async ({ page }) => {
      const ui = new AdminUsersPage(page);

      await ui.userRoleDropdown.click();
      await ui.dropdownOptions.filter({ hasText: /^Admin$/ }).click();
      await ui.searchButton.click();

      await expect(ui.tableRows.first()).toBeVisible({ timeout: 15_000 });
      expect(await ui.tableRows.count()).toBeGreaterThanOrEqual(1);
      await expect(ui.tableRows.first()).toContainText(/Admin/i);
    });

    test('should filter by Status Enabled', async ({ page }) => {
      const ui = new AdminUsersPage(page);

      await ui.statusDropdown.click();
      await ui.dropdownOptions.filter({ hasText: /^Enabled$/ }).click();
      await ui.searchButton.click();

      await expect(ui.tableRows.first()).toBeVisible({ timeout: 15_000 });
      expect(await ui.tableRows.count()).toBeGreaterThanOrEqual(1);
      await expect(ui.tableRows.first()).toContainText(/Enabled/i);
    });

    test('should show no records for non-existing username', async ({
      page,
    }) => {
      const ui = new AdminUsersPage(page);
      const fakeUser = `no_user_${Date.now()}`;

      await ui.usernameInput.fill(fakeUser);
      await ui.searchButton.click();

      // Có thể hiện ở bảng + toast → dùng .first() tránh strict mode violation
      await expect(ui.noRecordsFound.first()).toBeVisible({
        timeout: 15_000,
      });
    });

    test('should reset search filters', async ({ page }) => {
      const ui = new AdminUsersPage(page);

      await ui.usernameInput.fill('Admin');
      await ui.searchButton.click();
      await expect(ui.rowByText('Admin')).toBeVisible({ timeout: 15_000 });

      await ui.resetButton.click();

      // Sau Reset: ô Username trống + danh sách load lại
      await expect(ui.usernameInput).toHaveValue('');
      await expect(ui.tableRows.first()).toBeVisible({ timeout: 15_000 });
      expect(await ui.tableRows.count()).toBeGreaterThanOrEqual(1);
    });
  });

  // ===========================================================================
  // 4. Add User form UI (điều hướng + kiểm tra item, không commit data)
  // ===========================================================================
  test.describe('Add User form', () => {
    test('should display required fields on Add User screen', async ({
      page,
    }) => {
      const ui = new AdminUsersPage(page);
      await ui.addButton.click();

      const form = new AddUserPage(page);
      await expect(page).toHaveURL(URLS.addUser, { timeout: 30_000 });
      await expect(form.heading).toBeVisible();

      await expect(form.userRoleLabel).toBeVisible();
      await expect(form.employeeNameLabel).toBeVisible();
      await expect(form.statusLabel).toBeVisible();
      await expect(form.usernameLabel).toBeVisible();
      await expect(form.passwordLabel.first()).toBeVisible();
      await expect(form.confirmPasswordLabel).toBeVisible();
      await expect(form.saveButton).toBeVisible();
      await expect(form.cancelButton).toBeVisible();
    });

    test('should return to System Users when clicking Cancel on Add User', async ({
      page,
    }) => {
      const ui = new AdminUsersPage(page);
      await ui.addButton.click();
      await expect(page).toHaveURL(URLS.addUser, { timeout: 30_000 });

      const form = new AddUserPage(page);
      await form.cancelButton.click();

      await expect(page).toHaveURL(URLS.adminUsers, { timeout: 30_000 });
      await expect(ui.systemUsersHeading).toBeVisible();
    });

    test('should show Required validation when saving empty Add User form', async ({
      page,
    }) => {
      const ui = new AdminUsersPage(page);
      await ui.addButton.click();
      await expect(page).toHaveURL(URLS.addUser, { timeout: 30_000 });

      const form = new AddUserPage(page);
      await form.saveButton.click();

      await expect(form.requiredMessages.first()).toBeVisible();
      expect(await form.requiredMessages.count()).toBeGreaterThanOrEqual(1);
      await expect(page).toHaveURL(URLS.addUser);
    });
  });
});
