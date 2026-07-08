# Playwright Project Structure

```
tests/
├── [feature]/
│   ├── pages/
│   │   ├── base.page.ts          — Abstract base with common actions
│   │   ├── login.page.ts         — Login page object
│   │   └── [screen].page.ts     — One per screen
│   ├── fixtures/
│   │   ├── auth.fixture.ts       — Login + storageState reuse
│   │   ├── data-factory.fixture.ts — Test data creation
│   │   └── api.fixture.ts        — API helper for setup/teardown
│   ├── specs/
│   │   ├── [epic]-happy.spec.ts
│   │   ├── [epic]-negative.spec.ts
│   │   └── [epic]-edge.spec.ts
│   ├── security/
│   │   └── auth-bypass.spec.ts
│   ├── data/
│   │   └── test-data.json
│   └── helpers/
│       └── selectors.ts
├── shared/
│   ├── constants.ts
│   └── utils.ts
├── playwright.config.ts
└── package.json
```

## Config: Multi-Environment
```typescript
const ENV = process.env.TEST_ENV || 'staging';
const envConfig = {
  local: { baseURL: 'http://localhost:4200' },
  staging: { baseURL: 'https://staging.example.com' },
  production: { baseURL: 'https://app.example.com' }
};
```

## Config: CI Settings
- retries: 2 on CI / 0 local
- trace: on-first-retry
- screenshot: only-on-failure
- workers: 4 on CI / 1 local
