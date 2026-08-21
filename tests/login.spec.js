// =============================================================================
// LOAD BIẾN MÔI TRƯỜNG (.env)
// =============================================================================
// require('dotenv').config()
// → Đọc file .env ở thư mục gốc dự án, nạp vào process.env
// → Ví dụ: BASE_URL, TEST_USERNAME, TEST_PASSWORD
require('dotenv').config();

// =============================================================================
// IMPORT PLAYWRIGHT TEST API
// =============================================================================
// test   → dùng để khai báo test case / nhóm test (describe, beforeEach...)
// expect → dùng để assert (kiểm tra kết quả đúng/sai)
const { test, expect } = require('@playwright/test');
const {
  PATHS,
  URLS,
  credentials,
  LoginPage,
  DashboardPage,
} = require('../pages');

/**
 * OrangeHRM Login Page Automation Tests
 * Base URL : https://opensource-demo.orangehrmlive.com/web/index.php
 * Login URL: https://opensource-demo.orangehrmlive.com/web/index.php/auth/login
 * Dashboard: https://opensource-demo.orangehrmlive.com/web/index.php/dashboard/index
 *
 * LƯU Ý PATH:
 * - Path KHÔNG bắt đầu bằng "/" → nối vào baseURL trong playwright.config.js
 * - baseURL phải có trailing slash: .../web/index.php/
 * - Ví dụ: baseURL + 'auth/login' = .../web/index.php/auth/login
 */

// Credential + path nằm ở pages/constants.js; locator màn Login ở pages/LoginPage.js
const username = credentials.username;
const password = credentials.password;

// =============================================================================
// NHÓM TEST LỚN: toàn bộ case của màn Login
// test.describe(tênNhóm, callback) → gom nhiều test lại, dễ đọc report
// =============================================================================
test.describe('OrangeHRM - Login Page', () => {
  // ---------------------------------------------------------------------------
  // HOOK: chạy TRƯỚC MỖI test trong describe này
  // async ({ page }) → Playwright tự tạo browser page mới và truyền vào
  // await           → chờ thao tác bất đồng bộ hoàn thành rồi mới chạy tiếp
  // ---------------------------------------------------------------------------
  test.beforeEach(async ({ page }) => {
    // page.goto(url, options) → điều hướng trình duyệt tới URL
    // waitUntil: 'domcontentloaded' → chờ HTML load xong (nhanh hơn 'networkidle')
    await page.goto(PATHS.login, { waitUntil: 'domcontentloaded' });

    // expect(...).toBeVisible() → assert element ĐANG HIỂN THỊ trên màn hình
    // timeout: 30_000          → chờ tối đa 30 giây (30_000 = 30000, dùng _ cho dễ đọc)
    // Mục đích: đảm bảo form login đã sẵn sàng trước khi test bắt đầu
    await expect(new LoginPage(page).loginButton).toBeVisible({
      timeout: 30_000,
    });
  });

  // ===========================================================================
  // 1. NAVIGATION — kiểm tra điều hướng / URL
  // ===========================================================================
  test.describe('Navigation', () => {
    // test('mô tả', async fn) → 1 test case
    // { page } được Playwright inject tự động (fixture)
    test('should open login page at /auth/login', async ({ page }) => {
      // toHaveURL(regex) → URL hiện tại phải khớp pattern /auth/login
      await expect(page).toHaveURL(/\/auth\/login/);

      // toHaveTitle(regex) → <title> của trang phải chứa "OrangeHRM"
      // cờ /i = ignore case (không phân biệt hoa thường)
      await expect(page).toHaveTitle(/OrangeHRM/i);
    });

    test('should redirect unauthenticated users to login page', async ({
      page, // destructuring: lấy fixture page từ object đầu vào
    }) => {
      // Cố tình vào dashboard KHI CHƯA login
      await page.goto(PATHS.dashboard, { waitUntil: 'domcontentloaded' });

      // Hệ thống phải redirect về trang login
      await expect(page).toHaveURL(/\/auth\/login/, { timeout: 30_000 });
    });

    test('should navigate to Forgot Password page', async ({ page }) => {
      // Gọi hàm locator → nhận object chứa toàn bộ element màn login
      const ui = new LoginPage(page);

      // .click() → click chuột vào element
      await ui.forgotPasswordLink.click();

      // Sau click, URL phải đổi sang trang reset password
      await expect(page).toHaveURL(/\/auth\/requestPasswordResetCode/, {
        timeout: 15_000, // chờ tối đa 15 giây
      });

      // Heading "Reset Password" phải hiện
      // /Reset Password/i → regex, không phân biệt hoa thường
      await expect(
        ui.resetPasswordHeading,
      ).toBeVisible();
    });

    test('should stay on login page when credentials are invalid', async ({
      page,
    }) => {
      const ui = new LoginPage(page);

      // .fill(text) → xóa nội dung cũ (nếu có) rồi gõ text mới vào input
      await ui.usernameInput.fill('wrongUser');
      await ui.passwordInput.fill('wrongPass');

      // Bấm Login với credential SAI
      await ui.loginButton.click();

      // toHaveText(regex) → text của element phải khớp "Invalid credentials"
      await expect(ui.alertError).toHaveText(/Invalid credentials/i, {
        timeout: 15_000,
      });

      // Vẫn phải ở lại trang login (không được vào dashboard)
      await expect(page).toHaveURL(/\/auth\/login/);
    });

    test('should navigate to dashboard after successful login', async ({
      page,
    }) => {
      const ui = new LoginPage(page);

      // Điền đúng username/password lấy từ .env
      await ui.usernameInput.fill(username);
      await ui.passwordInput.fill(password);
      await ui.loginButton.click();

      // Cách 1: so khớp bằng RegExp (linh hoạt hơn)
      await expect(page).toHaveURL(URLS.dashboard, { timeout: 30_000 });

      // Cách 2: so khớp URL đầy đủ (chặt chẽ hơn)
      await expect(page).toHaveURL(
        'https://opensource-demo.orangehrmlive.com/web/index.php/dashboard/index',
      );
    });
  });

  // ===========================================================================
  // 2. UI DISPLAY — kiểm tra các thành phần giao diện có hiển thị không
  // ===========================================================================
  test.describe('UI Display', () => {
    test('should display branding logo and Login heading', async ({ page }) => {
      const ui = new LoginPage(page);

      // Logo branding phải thấy được
      await expect(ui.brandingLogo).toBeVisible();

      // Heading "Login" phải thấy được
      await expect(ui.loginTitle).toBeVisible();

      // toHaveText('Login') → text CHÍNH XÁC phải là "Login"
      await expect(ui.loginTitle).toHaveText('Login');
    });

    test('should display username and password fields with labels', async ({
      page,
    }) => {
      const ui = new LoginPage(page);

      // Label hiển thị
      await expect(ui.usernameLabel).toBeVisible();
      await expect(ui.passwordLabel).toBeVisible();

      // Ô nhập hiển thị
      await expect(ui.usernameInput).toBeVisible();
      await expect(ui.passwordInput).toBeVisible();

      // toBeEditable() → user có thể gõ vào được (không bị disabled/readonly)
      await expect(ui.usernameInput).toBeEditable();
      await expect(ui.passwordInput).toBeEditable();

      // toHaveAttribute(tên, giá trị) → kiểm tra HTML attribute
      // type="password" → ký tự mật khẩu bị ẩn (dấu •)
      await expect(ui.passwordInput).toHaveAttribute('type', 'password');
    });

    test('should display Login button enabled', async ({ page }) => {
      const ui = new LoginPage(page);

      // Nút nhìn thấy được
      await expect(ui.loginButton).toBeVisible();

      // toBeEnabled() → nút KHÔNG bị disabled, click được
      await expect(ui.loginButton).toBeEnabled();
    });

    test('should display Forgot your password link', async ({ page }) => {
      const ui = new LoginPage(page);
      // Link/text "Forgot your password?" phải hiện
      await expect(ui.forgotPasswordLink).toBeVisible();
    });

    test('should display demo credential hints on login page', async ({
      page,
    }) => {
      // getByText(regex) tìm text trên trang
      // \s* = 0 hoặc nhiều khoảng trắng
      // /i  = ignore case
      await expect(page.getByText(/Username\s*:\s*Admin/i)).toBeVisible();
      await expect(page.getByText(/Password\s*:\s*admin123/i)).toBeVisible();
    });

    test('should display copyright footer', async ({ page }) => {
      const ui = new LoginPage(page);

      // .first() → lấy phần tử ĐẦU TIÊN nếu locator khớp nhiều element
      // (trang có 2 dòng .orangehrm-copyright)
      await expect(ui.copyright.first()).toBeVisible();

      // toContainText(regex) → text bên trong CHỨA "OrangeHRM" (không cần exact)
      await expect(ui.copyright.first()).toContainText(/OrangeHRM/i);
    });

    test('should display social media icons in footer', async ({ page }) => {
      const ui = new LoginPage(page);

      // Icon đầu tiên phải hiện
      await expect(ui.socialIcons.first()).toBeVisible();

      // .count() → đếm số element khớp locator (trả về Promise → cần await)
      // expect(...).toBeGreaterThanOrEqual(1) → ít nhất 1 icon
      // Lưu ý: đây là expect của Playwright assertion cho giá trị JS thuần
      expect(await ui.socialIcons.count()).toBeGreaterThanOrEqual(1);
    });
  });

  // ===========================================================================
  // 3. FORM ITEMS — kiểm tra từng item trên form + tương tác nhập liệu
  // ===========================================================================
  test.describe('Login form items', () => {
    test('should show all required login form items', async ({ page }) => {
      const ui = new LoginPage(page);

      // Gom locator vào mảng để duyệt hàng loạt (tránh lặp code)
      const items = [
        ui.brandingLogo,
        ui.loginTitle,
        ui.usernameLabel,
        ui.usernameInput,
        ui.passwordLabel,
        ui.passwordInput,
        ui.loginButton,
        ui.forgotPasswordLink,
      ];

      // for...of → duyệt từng phần tử trong mảng
      // Mỗi item phải visible
      for (const item of items) {
        await expect(item).toBeVisible();
      }
    });

    test('should accept text input in username and password fields', async ({
      page,
    }) => {
      const ui = new LoginPage(page);

      // Nhập thử dữ liệu
      await ui.usernameInput.fill('sampleUser');
      await ui.passwordInput.fill('samplePass');

      // toHaveValue → kiểm tra giá trị hiện tại của <input>
      await expect(ui.usernameInput).toHaveValue('sampleUser');
      await expect(ui.passwordInput).toHaveValue('samplePass');
    });

    test('should clear username field when cleared', async ({ page }) => {
      const ui = new LoginPage(page);

      // Điền rồi xóa
      await ui.usernameInput.fill('Admin');

      // .clear() → xóa hết nội dung trong input
      await ui.usernameInput.clear();

      // Sau khi clear, value phải là chuỗi rỗng ''
      await expect(ui.usernameInput).toHaveValue('');
    });
  });

  // ===========================================================================
  // 4. VALIDATION — case âm (negative): để trống / sai mật khẩu
  // ===========================================================================
  test.describe('Validation', () => {
    test('should show Required when both fields are empty', async ({
      page,
    }) => {
      const ui = new LoginPage(page);

      // Không fill gì, bấm Login luôn
      await ui.loginButton.click();

      // toHaveCount(2) → phải có đúng 2 message "Required" (user + pass)
      await expect(ui.requiredMessages).toHaveCount(2);

      // Message đầu tiên chứa chữ Required
      await expect(ui.requiredMessages.first()).toHaveText(/Required/i);

      // Không được điều hướng đi đâu cả
      await expect(page).toHaveURL(/\/auth\/login/);
    });

    test('should show Required when username is empty', async ({ page }) => {
      const ui = new LoginPage(page);

      // Chỉ điền password, bỏ trống username
      await ui.passwordInput.fill(password);
      await ui.loginButton.click();

      // Chỉ 1 message Required (cho username)
      await expect(ui.requiredMessages).toHaveCount(1);
      await expect(ui.requiredMessages.first()).toHaveText(/Required/i);
      await expect(page).toHaveURL(/\/auth\/login/);
    });

    test('should show Required when password is empty', async ({ page }) => {
      const ui = new LoginPage(page);

      // Chỉ điền username, bỏ trống password
      await ui.usernameInput.fill(username);
      await ui.loginButton.click();

      await expect(ui.requiredMessages).toHaveCount(1);
      await expect(ui.requiredMessages.first()).toHaveText(/Required/i);
      await expect(page).toHaveURL(/\/auth\/login/);
    });

    test('should show Invalid credentials for wrong password', async ({
      page,
    }) => {
      const ui = new LoginPage(page);

      // Username đúng nhưng password SAI
      await ui.usernameInput.fill(username);
      await ui.passwordInput.fill('wrong_password_123');
      await ui.loginButton.click();

      // Alert lỗi phải hiện
      await expect(ui.alertError).toBeVisible({ timeout: 15_000 });

      // Nội dung alert phải là Invalid credentials
      await expect(ui.alertError).toHaveText(/Invalid credentials/i);

      // Vẫn ở trang login
      await expect(page).toHaveURL(/\/auth\/login/);
    });
  });

  // ===========================================================================
  // 5. SUCCESSFUL LOGIN — login đúng → vào Dashboard
  // ===========================================================================
  test.describe('Successful login', () => {
    test('should login with valid credentials and land on dashboard', async ({
      page,
    }) => {
      const ui = new LoginPage(page);

      // Bước 1–3: điền form + submit
      await ui.usernameInput.fill(username);
      await ui.passwordInput.fill(password);
      await ui.loginButton.click();

      // Bước 4: chờ URL đổi sang dashboard (auto-wait tối đa 30s)
      await expect(page).toHaveURL(URLS.dashboard, { timeout: 30_000 });

      // page.url() → lấy URL hiện tại dạng string
      // .toContain(...) → string phải chứa 'dashboard/index'
      // Không cần await vì page.url() là sync; expect thường của Playwright
      expect(page.url()).toContain(PATHS.dashboard);

      // --- Smoke check UI Dashboard ---
      // toContainText → title topbar chứa chữ "Dashboard"
      const dashboard = new DashboardPage(page);
      await expect(dashboard.headerTitle).toContainText(/Dashboard/i);

      // Menu user (avatar / dropdown góc phải) phải hiện
      await expect(dashboard.userDropdown).toBeVisible();

      // Sidebar navigation phải hiện
      await expect(dashboard.sideNav).toBeVisible();
    });

    test('should display dashboard widgets after login', async ({ page }) => {
      const ui = new LoginPage(page);

      await ui.usernameInput.fill(username);
      await ui.passwordInput.fill(password);
      await ui.loginButton.click();

      // Chờ vào đúng URL dashboard
      await expect(page).toHaveURL(URLS.dashboard, { timeout: 30_000 });

      // getByText(regex với |) → khớp 1 trong các text widget phổ biến
      // A|B|C nghĩa là "A hoặc B hoặc C"
      // .first() → lấy widget đầu tiên khớp (tránh strict mode violation
      //            khi nhiều element cùng khớp)
      const dashboard = new DashboardPage(page);
      await expect(dashboard.widgets.first()).toBeVisible({ timeout: 15_000 });
    });
  });
}); // kết thúc describe 'OrangeHRM - Login Page'
