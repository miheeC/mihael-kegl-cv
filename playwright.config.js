import { defineConfig } from '@playwright/test';

// Runs against the production build, in the Chrome that is already installed (no browser download).
export default defineConfig({
  testDir: './tests',
  timeout: 120_000,
  fullyParallel: true,
  workers: 3, // each test renders WebGL; more than a few at once starves the CPU
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4173',
    channel: 'chrome',
    viewport: { width: 1440, height: 860 },
  },
  webServer: {
    command: 'npm run share',
    url: 'http://localhost:4173',
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
