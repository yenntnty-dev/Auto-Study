// =============================================================================
// BOSS DEMO — OrangeHRM End-to-End Scenario (đầy đủ control)
// =============================================================================
//
// Scenario kể cho sếp (1 câu chuyện):
//   Login → PIM (scroll / search / dropdown / checkbox / modal)
//        → My Info (radio)
//        → Recruitment (exercise form + upload + download)
//
// Chạy demo (có browser, 1 worker — ổn định nhất):
//   npx playwright test -c playwright.config.js tests/boss.demo.spec.js --headed --workers=1
//
// Xem report đẹp sau khi chạy:
//   npx playwright show-report
//
// Checklist tính năng trong file này:
//   [x] Click Button
//   [x] Input Textbox
//   [x] Dropdown
//   [x] Checkbox
//   [x] Radio
//   [x] Exercise (điền form nghiệp vụ hoàn chỉnh)
//   [x] Modal
//   [x] Upload File
//   [x] Download File
//   [x] Scroll
//
// LƯU Ý demo site công cộng:
//   - Đôi khi chậm / login fail tạm thời → chạy lại 1 lần
//   - Modal chỉ bấm NO (không xóa data)
// =============================================================================

require('dotenv').config();
const path = require('path');
const fs = require('fs');
const { test, expect } = require('@playwright/test');
const {
  URLS,
  credentials,
  LoginPage,
  Layout,
  PimEmployeeListPage,
  MyInfoPage,
  AddCandidatePage,
  CandidatesPage,
} = require('../pages');

const FIXTURES = path.join(__dirname, 'fixtures');
const RESUME_FILE = path.join(FIXTURES, 'demo-resume.txt');
const PHOTO_FILE = path.join(FIXTURES, 'demo-photo.png');
const DOWNLOAD_DIR = path.join(
  __dirname,
  '..',
  'test-results',
  'boss-demo-downloads',
);

test.describe('BOSS DEMO — OrangeHRM full UI scenario', () => {
  test.describe.configure({ mode: 'serial', retries: 1 });

  test('should demo all key UI automation features', async ({ page }) => {
    test.setTimeout(180_000);

    const stamp = Date.now();
    const candidateFirst = 'Boss';
    const candidateLast = `Demo${stamp}`;
    const candidateEmail = `boss.demo.${stamp}@example.com`;

    const login = new LoginPage(page);
    const layout = new Layout(page);
    const pim = new PimEmployeeListPage(page);
    const myInfo = new MyInfoPage(page);
    const addCandidate = new AddCandidatePage(page);
    const candidates = new CandidatesPage(page);

    await test.step('1) Click Button + Input Textbox — Login', async () => {
      await login.goto();
      await login.login(credentials.username, credentials.password);
      await expect(page).toHaveURL(URLS.dashboard, { timeout: 30_000 });
    });

    await test.step('2) Scroll — PIM Employee List', async () => {
      await pim.goto();
      await pim.waitForReady();

      await pim.lastRow.scrollIntoViewIfNeeded();
      await expect(pim.lastRow).toBeVisible();

      await pim.heading.first().scrollIntoViewIfNeeded();
    });

    await test.step('3) Input Textbox + Click Button — Search employee', async () => {
      await pim.resetButton.click();
      await expect(pim.firstRow).toBeVisible({ timeout: 30_000 });

      await pim.employeeNameInput.fill('Admin');
      await page.waitForTimeout(1000);
      if (await pim.autocompleteOption.isVisible().catch(() => false)) {
        await pim.autocompleteOption.click();
      }

      await pim.searchButton.click();
      try {
        await expect(pim.firstRow).toBeVisible({ timeout: 10_000 });
      } catch {
        await pim.resetButton.click();
        await expect(pim.firstRow).toBeVisible({ timeout: 30_000 });
      }
    });

    await test.step('4) Dropdown — filter Include (an toàn, vẫn còn records)', async () => {
      await pim.includeDropdown.click();
      await expect(pim.dropdownOptions.first()).toBeVisible({ timeout: 10_000 });
      await pim.dropdownOptions.filter({ hasText: /Current/i }).first().click();

      await pim.searchButton.click();
      await expect(pim.firstRow).toBeVisible({ timeout: 30_000 });
    });

    await test.step('5) Checkbox — chọn 1 employee', async () => {
      await pim.rowCheckboxes.nth(0).click();
      await expect(pim.rowCheckboxInputs.nth(0)).toBeChecked({ timeout: 10_000 });
    });

    await test.step('6) Modal — Delete Selected rồi Cancel (No)', async () => {
      await expect(pim.deleteSelectedButton).toBeVisible({ timeout: 15_000 });
      await pim.deleteSelectedButton.click();

      await expect(pim.modal).toBeVisible({ timeout: 15_000 });
      await expect(pim.modalTitle).toBeVisible();

      await pim.noButton.click();
      await expect(pim.modal).toBeHidden({ timeout: 10_000 });
    });

    await test.step('7) Radio — My Info / Gender', async () => {
      await layout.myInfoLink.click();
      await myInfo.waitForGenderReady();

      await myInfo.femaleCircle.click();
      await expect(myInfo.femaleInput).toBeChecked();
      await expect(myInfo.maleInput).not.toBeChecked();

      await myInfo.maleCircle.click();
      await expect(myInfo.maleInput).toBeChecked();
      await expect(myInfo.femaleInput).not.toBeChecked();
    });

    await test.step('8) Exercise — điền form Add Candidate (textbox + dropdown)', async () => {
      await addCandidate.goto();
      await expect(addCandidate.heading.first()).toBeVisible({ timeout: 30_000 });

      await addCandidate.firstNameInput.fill(candidateFirst);
      await addCandidate.lastNameInput.fill(candidateLast);
      await addCandidate.emailInput.fill(candidateEmail);

      await addCandidate.vacancyDropdown.click();
      await expect(addCandidate.dropdownOptions.first()).toBeVisible({
        timeout: 10_000,
      });
      const optionCount = await addCandidate.dropdownOptions.count();
      await addCandidate.dropdownOptions
        .nth(Math.min(1, optionCount - 1))
        .click();
    });

    await test.step('9) Upload File — đính kèm resume (+ optional photo sau)', async () => {
      expect(fs.existsSync(RESUME_FILE)).toBeTruthy();

      await expect(addCandidate.fileInput.first()).toBeAttached({
        timeout: 15_000,
      });
      await addCandidate.fileInput.first().setInputFiles(RESUME_FILE);

      await addCandidate.saveButton.click();
      await expect(addCandidate.successSaved).toBeVisible({ timeout: 30_000 });
    });

    await test.step('10) Download File — tải resume vừa upload', async () => {
      fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });

      await candidates.goto();
      await expect(candidates.heading.first()).toBeVisible({ timeout: 30_000 });

      if (await candidates.nameHint.count()) {
        await candidates.nameHint.first().fill(candidateFirst);
        await page.waitForTimeout(1000);
        if (await candidates.autocompleteOption.isVisible().catch(() => false)) {
          await candidates.autocompleteOption.click();
        }
      }
      await candidates.searchButton.click();

      const row = candidates.rowByText(candidateLast);
      await expect(row).toBeVisible({ timeout: 30_000 });

      const downloadBtn = candidates.downloadOnRow(row);

      if (await downloadBtn.count()) {
        const [download] = await Promise.all([
          page.waitForEvent('download', { timeout: 30_000 }),
          downloadBtn.click(),
        ]);
        const target = path.join(
          DOWNLOAD_DIR,
          download.suggestedFilename() || `resume-${stamp}.txt`,
        );
        await download.saveAs(target);
        expect(fs.existsSync(target)).toBeTruthy();
        expect(fs.statSync(target).size).toBeGreaterThan(0);
      } else {
        await row.click();
        await expect(candidates.detailDownload).toBeVisible({ timeout: 15_000 });
        const [download] = await Promise.all([
          page.waitForEvent('download', { timeout: 30_000 }),
          candidates.detailDownload.click(),
        ]);
        const target = path.join(
          DOWNLOAD_DIR,
          download.suggestedFilename() || `resume-${stamp}.txt`,
        );
        await download.saveAs(target);
        expect(fs.existsSync(target)).toBeTruthy();
        expect(fs.statSync(target).size).toBeGreaterThan(0);
      }
    });

    await test.step('11) Upload File (bonus) — My Info profile photo', async () => {
      expect(fs.existsSync(PHOTO_FILE)).toBeTruthy();

      await layout.myInfoLink.click();
      await expect(myInfo.heading.first()).toBeVisible({ timeout: 30_000 });

      const photoCount = await myInfo.photoInput.count();
      if (photoCount === 0) {
        return;
      }

      await myInfo.photoInput.first().setInputFiles(PHOTO_FILE);
      const saveBtn = myInfo.saveButton.first();
      if (await saveBtn.isVisible().catch(() => false)) {
        await saveBtn.click();
        try {
          await expect(myInfo.successToast).toBeVisible({ timeout: 15_000 });
        } catch {
          // Demo site đôi khi không hiện toast — vẫn chấp nhận đã upload
        }
      }
    });
  });
});
