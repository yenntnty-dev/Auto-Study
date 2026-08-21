// =============================================================================
// FILE HỌC: API TESTING CƠ BẢN VỚI PLAYWRIGHT
//
// API testing = gọi HTTP trực tiếp (GET/POST/PUT/PATCH/DELETE), không mở browser.
// Nhanh hơn UI, ổn định hơn, dùng để:
//   - Kiểm tra backend (status, JSON, header)
//   - Setup data trước khi test UI (login bằng API, tạo user...)
//   - Kết hợp UI + API (hybrid)
//
// Playwright có sẵn fixture `request` — KHÔNG cần cài axios/supertest.
//
// Chạy toàn bộ:
//   npx playwright test -c playwright.config.js tests/api.learn.spec.js
//
// Chạy 1 bước:
//   npx playwright test -c playwright.config.js tests/api.learn.spec.js -g "STEP1"
//
// Public API dùng để học (không cần login):
//   https://jsonplaceholder.typicode.com
// =============================================================================

require('dotenv').config();
const { test, expect } = require('@playwright/test');

// JSONPlaceholder — REST API giả lập, luôn trả JSON, phù hợp học
const API = 'https://jsonplaceholder.typicode.com';

const username = process.env.TEST_USERNAME || 'Admin';
const password = process.env.TEST_PASSWORD || 'admin123';

// -----------------------------------------------------------------------------
// STEP1 — GET: lấy 1 resource, assert status + JSON
// -----------------------------------------------------------------------------
// request.get(url)  → gửi HTTP GET
// response.ok()     → true nếu status 200–299
// response.status() → mã HTTP (200, 404, 500...)
// response.json()   → parse body thành object
test('STEP1 GET — lấy bài viết id=1, status 200 và đúng shape JSON', async ({
  request,
}) => {
  const response = await request.get(`${API}/posts/1`);

  expect(response.status()).toBe(200);
  expect(response.ok()).toBeTruthy();

  const body = await response.json();
  // body mẫu: { userId, id, title, body }
  expect(body).toMatchObject({
    id: 1,
    userId: 1,
  });
  expect(typeof body.title).toBe('string');
  expect(body.title.length).toBeGreaterThan(0);
});

// -----------------------------------------------------------------------------
// STEP2 — GET list + query params
// -----------------------------------------------------------------------------
// params: { userId: 1 }  → URL thành /posts?userId=1
test('STEP2 GET list — query params lọc posts theo userId', async ({
  request,
}) => {
  const response = await request.get(`${API}/posts`, {
    params: { userId: 1 },
  });

  expect(response.status()).toBe(200);

  const posts = await response.json();
  expect(Array.isArray(posts)).toBeTruthy();
  expect(posts.length).toBeGreaterThan(0);
  // Mọi phần tử đều thuộc userId = 1
  for (const post of posts) {
    expect(post.userId).toBe(1);
  }
});

// -----------------------------------------------------------------------------
// STEP3 — POST: tạo resource, gửi JSON body
// -----------------------------------------------------------------------------
// data: { ... }  → Playwright serialize thành JSON + set Content-Type
// JSONPlaceholder fake-create: luôn trả 201 + id mới (thường là 101)
test('STEP3 POST — tạo post mới, nhận 201 và echo data', async ({ request }) => {
  const payload = {
    title: 'API learn',
    body: 'Playwright request fixture',
    userId: 1,
  };

  const response = await request.post(`${API}/posts`, {
    data: payload,
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
    },
  });

  expect(response.status()).toBe(201);

  const created = await response.json();
  expect(created).toMatchObject(payload);
  expect(created.id).toBeDefined();
});

// -----------------------------------------------------------------------------
// STEP4 — PUT / PATCH / DELETE
// -----------------------------------------------------------------------------
// PUT    = thay toàn bộ resource
// PATCH  = cập nhật một phần
// DELETE = xóa (JSONPlaceholder trả 200, body rỗng {})
test('STEP4 PUT PATCH DELETE — cập nhật và xóa post id=1', async ({
  request,
}) => {
  const putRes = await request.put(`${API}/posts/1`, {
    data: {
      id: 1,
      title: 'updated title',
      body: 'updated body',
      userId: 1,
    },
  });
  expect(putRes.status()).toBe(200);
  const putBody = await putRes.json();
  expect(putBody.title).toBe('updated title');

  const patchRes = await request.patch(`${API}/posts/1`, {
    data: { title: 'patched only' },
  });
  expect(patchRes.status()).toBe(200);
  const patchBody = await patchRes.json();
  expect(patchBody.title).toBe('patched only');

  const delRes = await request.delete(`${API}/posts/1`);
  expect(delRes.status()).toBe(200);
});

// -----------------------------------------------------------------------------
// STEP5 — Negative case: 404 khi resource không tồn tại
// -----------------------------------------------------------------------------
test('STEP5 GET 404 — post không tồn tại', async ({ request }) => {
  const response = await request.get(`${API}/posts/999999`);
  expect(response.status()).toBe(404);
  expect(response.ok()).toBeFalsy();
});

// -----------------------------------------------------------------------------
// STEP6 — Header + thời gian phản hồi (smoke)
// -----------------------------------------------------------------------------
test('STEP6 Header — Content-Type là JSON', async ({ request }) => {
  const response = await request.get(`${API}/posts/1`);
  const headers = response.headers();
  // header name luôn lowercase trong Playwright
  expect(headers['content-type']).toContain('application/json');
});

// -----------------------------------------------------------------------------
// STEP7 — Hybrid UI + API (OrangeHRM)
// -----------------------------------------------------------------------------
// page.request  = API client DÙNG CHUNG cookie với browser
// Dùng khi: login bằng UI rồi gọi API nội bộ, hoặc gọi API rồi mở UI.
//
// Sau login OrangeHRM, frontend gọi REST /api/v2/...
// Test này: login UI → GET employees qua API (cùng session).
test('STEP7 Hybrid — login UI rồi gọi OrangeHRM API bằng cookie session', async ({
  page,
}) => {
  await page.goto('auth/login', { waitUntil: 'domcontentloaded' });
  await page.getByPlaceholder('Username').fill(username);
  await page.getByPlaceholder('Password').fill(password);
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/\/dashboard\/index/, { timeout: 30_000 });

  // page.request kế thừa cookie đăng nhập → không cần token thủ công
  const apiRes = await page.request.get(
    'https://opensource-demo.orangehrmlive.com/web/index.php/api/v2/pim/employees',
    {
      params: { limit: 5, offset: 0 },
    },
  );

  expect(apiRes.status()).toBe(200);
  const json = await apiRes.json();
  // OrangeHRM v2 thường: { data: [...], meta: { total } }
  expect(json).toHaveProperty('data');
  expect(Array.isArray(json.data)).toBeTruthy();
});
