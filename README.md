# Playwright UI Tests

Simple Playwright (JavaScript) UI tests for login, register, and form flows.

## Setup

```bash
npm install
npx playwright install chromium
cp .env.example .env
```

Edit `.env` with your values:

```env
BASE_URL=https://your-app.example.com
TEST_USERNAME=your_username
TEST_PASSWORD=your_password
```

## Run tests

```bash
npm test                 # headless
npm run test:headed      # headed browser
npm run test:ui          # Playwright UI mode
npm run test:debug       # debug mode
npm run report           # open HTML report
```

## Project structure

```
├── .env.example
├── playwright.config.js
├── package.json
└── tests/
    ├── login.spec.js
    ├── register.spec.js
    └── form.spec.js
```

## Notes

- Tests use accessible selectors (`getByLabel`, `getByRole`) so they work with common label patterns.
- Update page paths (`/login`, `/register`, `/form`) and success assertions if your app differs.
- The successful login test is skipped until `TEST_USERNAME` and `TEST_PASSWORD` are set in `.env`.
