---
name: playwright-enhanced
description: Advanced Playwright automation with auto-detection, custom fixtures, trace debugging, visual testing, mobile emulation, and production-grade test architecture.
---

# Playwright Enhanced Skill

You are an expert QA automation engineer specializing in advanced Playwright patterns. When asked to write or enhance Playwright tests, follow these production-grade instructions.

## Advanced Configuration

### Multi-Environment Setup

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

const env = process.env.TEST_ENV || 'local';

const environments = {
  local: {
    baseURL: 'http://localhost:3000',
    apiURL: 'http://localhost:8080',
  },
  staging: {
    baseURL: 'https://staging.example.com',
    apiURL: 'https://api-staging.example.com',
  },
  production: {
    baseURL: 'https://example.com',
    apiURL: 'https://api.example.com',
  },
};

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: [
    ['html', { open: 'never', outputFolder: 'test-results/html' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    process.env.CI ? ['github'] : ['list'],
  ],

  use: {
    baseURL: environments[env].baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },

  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/ },

    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      dependencies: ['setup'],
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      dependencies: ['setup'],
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
      dependencies: ['setup'],
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 13'] },
      dependencies: ['setup'],
    },
    {
      name: 'tablet',
      use: { ...devices['iPad Pro'] },
      dependencies: ['setup'],
    },
  ],

  webServer: env === 'local' ? {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  } : undefined,
});
```

## Advanced Custom Fixtures

```typescript
// fixtures/index.ts
import { test as base, Page } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { DashboardPage } from '../pages/dashboard.page';

type MyFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  authenticatedPage: Page;
  adminPage: Page;
  mockApi: MockApiHelper;
  testData: TestDataFactory;
};

export const test = base.extend<MyFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },

  authenticatedPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: 'playwright/.auth/user.json',
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  adminPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: 'playwright/.auth/admin.json',
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  mockApi: async ({ page }, use) => {
    const helper = new MockApiHelper(page);
    await use(helper);
  },

  testData: async ({}, use) => {
    const factory = new TestDataFactory();
    await use(factory);
    await factory.cleanup();
  },
});

export { expect } from '@playwright/test';
```

### Advanced Page Object Pattern

```typescript
// pages/base.page.ts
import { Page, Locator, expect } from '@playwright/test';

export abstract class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigate(path: string): Promise<void> {
    await this.page.goto(path);
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  async waitForElement(selector: string, timeout = 10000): Promise<Locator> {
    return this.page.waitForSelector(selector, { timeout });
  }

  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({
      path: `screenshots/${name}.png`,
      fullPage: true,
    });
  }

  async scrollToElement(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
  }

  async typeWithDelay(locator: Locator, text: string, delay = 100): Promise<void> {
    await locator.type(text, { delay });
  }

  async selectDropdownOption(locator: Locator, option: string): Promise<void> {
    await locator.click();
    await this.page.getByRole('option', { name: option }).click();
  }

  async uploadFile(locator: Locator, filePath: string): Promise<void> {
    await locator.setInputFiles(filePath);
  }

  async waitForApiResponse(urlPattern: string | RegExp): Promise<void> {
    await this.page.waitForResponse((response) =>
      (typeof urlPattern === 'string'
        ? response.url().includes(urlPattern)
        : urlPattern.test(response.url())) && response.status() === 200
    );
  }
}
```

```typescript
// pages/dashboard.page.ts
import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class DashboardPage extends BasePage {
  readonly heading: Locator;
  readonly userMenu: Locator;
  readonly notificationBell: Locator;
  readonly searchInput: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Dashboard' });
    this.userMenu = page.getByRole('button', { name: /user menu/i });
    this.notificationBell = page.getByTestId('notification-bell');
    this.searchInput = page.getByPlaceholder('Search...');
  }

  async goto(): Promise<void> {
    await this.navigate('/dashboard');
    await this.expectToBeLoaded();
  }

  async expectToBeLoaded(): Promise<void> {
    await expect(this.heading).toBeVisible();
    await this.waitForPageLoad();
  }

  async searchFor(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
    await this.waitForApiResponse('/api/search');
  }

  async openUserMenu(): Promise<void> {
    await this.userMenu.click();
  }

  async getNotificationCount(): Promise<number> {
    const badge = this.notificationBell.locator('.badge');
    const text = await badge.textContent();
    return parseInt(text || '0', 10);
  }

  async expectWelcomeMessage(username: string): Promise<void> {
    const message = this.page.getByText(`Welcome, ${username}`);
    await expect(message).toBeVisible();
  }
}
```

## API Mocking Strategies

```typescript
// helpers/mock-api.helper.ts
import { Page, Route } from '@playwright/test';

export class MockApiHelper {
  constructor(private page: Page) {}

  async mockSuccess(endpoint: string, data: any): Promise<void> {
    await this.page.route(endpoint, async (route: Route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(data),
      });
    });
  }

  async mockError(endpoint: string, status: number, message: string): Promise<void> {
    await this.page.route(endpoint, async (route: Route) => {
      await route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify({ error: message }),
      });
    });
  }

  async mockDelay(endpoint: string, delay: number): Promise<void> {
    await this.page.route(endpoint, async (route: Route) => {
      await new Promise((resolve) => setTimeout(resolve, delay));
      await route.continue();
    });
  }

  async interceptAndModify(endpoint: string, modifier: (data: any) => any): Promise<void> {
    await this.page.route(endpoint, async (route: Route) => {
      const response = await route.fetch();
      const json = await response.json();
      const modified = modifier(json);

      await route.fulfill({
        response,
        body: JSON.stringify(modified),
      });
    });
  }
}

// Usage in tests
test('should handle API error gracefully', async ({ page, mockApi }) => {
  await mockApi.mockError('/api/users', 500, 'Internal Server Error');

  await page.goto('/users');
  await expect(page.getByText('Something went wrong')).toBeVisible();
});
```

## Visual Regression Testing

```typescript
test.describe('Visual regression', () => {
  test('homepage snapshot desktop', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('homepage-desktop.png', {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixels: 100,
    });
  });

  test('homepage snapshot mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    await expect(page).toHaveScreenshot('homepage-mobile.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('component snapshot', async ({ page }) => {
    await page.goto('/components/button');

    const button = page.getByRole('button', { name: 'Primary' });
    await expect(button).toHaveScreenshot('button-primary.png');
  });

  test('dark mode snapshot', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');

    await expect(page).toHaveScreenshot('homepage-dark.png', {
      fullPage: true,
    });
  });
});
```

## Mobile Testing Patterns

```typescript
test.describe('Mobile-specific tests', () => {
  test.use({ ...devices['iPhone 13'] });

  test('should handle mobile navigation', async ({ page }) => {
    await page.goto('/');

    // Open hamburger menu
    const menuButton = page.getByRole('button', { name: 'Menu' });
    await expect(menuButton).toBeVisible();
    await menuButton.click();

    // Navigate to section
    await page.getByRole('link', { name: 'Products' }).click();
    await expect(page).toHaveURL('/products');
  });

  test('should handle touch gestures', async ({ page }) => {
    await page.goto('/gallery');

    const image = page.getByTestId('gallery-image');

    // Swipe left
    await image.dragTo(image, {
      sourcePosition: { x: 200, y: 100 },
      targetPosition: { x: 50, y: 100 },
    });

    await expect(page.getByTestId('image-2')).toBeVisible();
  });

  test('should adapt to orientation changes', async ({ page }) => {
    await page.goto('/');

    // Portrait
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByTestId('mobile-menu')).toBeVisible();

    // Landscape
    await page.setViewportSize({ width: 667, height: 375 });
    await expect(page.getByTestId('desktop-menu')).toBeVisible();
  });
});
```

## Network Manipulation

```typescript
test.describe('Network conditions', () => {
  test('should handle slow 3G connection', async ({ page, context }) => {
    await context.route('**/*', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await route.continue();
    });

    await page.goto('/');
    await expect(page.getByTestId('loading-spinner')).toBeVisible();
    await expect(page.getByRole('heading')).toBeVisible({ timeout: 20000 });
  });

  test('should handle offline mode', async ({ page, context }) => {
    await page.goto('/');

    // Go offline
    await context.setOffline(true);
    await page.reload();

    await expect(page.getByText('You are offline')).toBeVisible();

    // Go back online
    await context.setOffline(false);
    await page.reload();
    await expect(page.getByRole('heading')).toBeVisible();
  });
});
```

## Advanced Trace Debugging

```typescript
test('with detailed trace', async ({ page }) => {
  // Start tracing before creating the page
  await page.context().tracing.start({
    screenshots: true,
    snapshots: true,
    sources: true,
  });

  await test.step('Navigate to login page', async () => {
    await page.goto('/login');
  });

  await test.step('Fill login form', async () => {
    await page.fill('#email', 'user@example.com');
    await page.fill('#password', 'password123');
  });

  await test.step('Submit form', async () => {
    await page.click('button[type="submit"]');
  });

  await test.step('Verify dashboard loaded', async () => {
    await expect(page.getByRole('heading')).toHaveText('Dashboard');
  });

  // Stop tracing and save
  await page.context().tracing.stop({ path: 'trace.zip' });
});
```

## Parallel Test Execution Optimization

```typescript
// tests/parallel-safe.spec.ts
import { test, expect } from './fixtures';

test.describe.configure({ mode: 'parallel' });

test.describe('Parallel safe tests', () => {
  test('test 1 with isolated data', async ({ page, testData }) => {
    const user = await testData.createUniqueUser();
    await page.goto(`/users/${user.id}`);
    // Each test gets unique data
  });

  test('test 2 with isolated data', async ({ page, testData }) => {
    const user = await testData.createUniqueUser();
    await page.goto(`/users/${user.id}`);
    // No conflict with test 1
  });
});

// tests/serial-required.spec.ts
test.describe.configure({ mode: 'serial' });

test.describe('Serial tests (order matters)', () => {
  let orderId: string;

  test('step 1: create order', async ({ page }) => {
    // ... create order
    orderId = 'ORDER-123';
  });

  test('step 2: process order', async ({ page }) => {
    // Uses orderId from previous test
    await page.goto(`/orders/${orderId}`);
  });
});
```

## Performance Monitoring

```typescript
import { chromium } from '@playwright/test';

test('measure page performance', async ({ page }) => {
  await page.goto('/');

  const metrics = await page.evaluate(() => {
    const perfData = window.performance.timing;
    return {
      domContentLoaded: perfData.domContentLoadedEventEnd - perfData.navigationStart,
      loadComplete: perfData.loadEventEnd - perfData.navigationStart,
      firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0,
    };
  });

  console.log('Performance metrics:', metrics);

  expect(metrics.domContentLoaded).toBeLessThan(2000);
  expect(metrics.loadComplete).toBeLessThan(5000);
});
```

## Best Practices

1. **Use test.step() for readability** -- Organize complex tests into logical steps.
2. **Implement custom fixtures** -- Share setup logic and state across tests.
3. **Enable trace on failure** -- Visual debugging is invaluable.
4. **Use auto-waiting locators** -- `getByRole` and `getByText` are resilient.
5. **Mock APIs for speed** -- Don't rely on real backends for fast feedback.
6. **Test across browsers** -- Cross-browser issues are real.
7. **Validate with screenshots** -- Visual regression catches CSS bugs.
8. **Isolate test data** -- Each test should create its own data.
9. **Use serial mode wisely** -- Parallelize when possible.
10. **Monitor performance** -- Track load times as part of tests.

## Anti-Patterns to Avoid

1. **Not using Page Object Model** -- Duplicating selectors everywhere.
2. **Hardcoded waits** -- Use auto-waiting instead.
3. **Testing in one browser only** -- Cross-browser bugs are common.
4. **Ignoring flaky tests** -- Fix them or delete them.
5. **Not using fixtures** -- Copy-pasting setup code.
6. **No visual regression** -- UI bugs slip through.
7. **Testing against production** -- Always use test environments.
8. **Shared state between tests** -- Tests must be independent.
9. **Not recording traces** -- Debugging is much harder.
10. **Ignoring mobile** -- Mobile users are a huge segment.

Playwright is powerful. Use its advanced features to build robust, maintainable test suites that catch bugs before production.
