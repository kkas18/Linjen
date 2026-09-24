// Playwright-tester (kapittel 8): funksjon, tilgjengelighet og skjermbilder på mobil og desktop.
// Kjøres mot ferdig bygg: npm run build && npm test. Sett CHROMIUM_PATH ved behov.
import { defineConfig, devices } from '@playwright/test';

const PORT = 4342;
const BASE = (process.env.BASE_PATH ?? '/Linjen').replace(/\/$/, '');

export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}${BASE}/`,
    launchOptions: { executablePath: process.env.CHROMIUM_PATH },
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'mobil',
      use: {
        ...devices['Galaxy S9+'],
        viewport: { width: 390, height: 844 },
        browserName: 'chromium',
      },
    },
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 }, browserName: 'chromium' } },
  ],
  webServer: {
    command: `node scripts/statisk-server.mjs ${PORT}`,
    url: `http://localhost:${PORT}${BASE}/`,
    reuseExistingServer: !process.env.CI,
  },
});
