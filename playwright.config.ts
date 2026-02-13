import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 60000,
  expect: {
    timeout: 10000,
  },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  use: {
    actionTimeout: 10000,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'tauri',
      use: {
        browserName: 'chromium',
      },
    },
  ],
  webServer: {
    command: 'npm run tauri:dev',
    url: 'http://localhost:1420',
    timeout: 120000,
    reuseExistingServer: !process.env.CI,
  },
});
