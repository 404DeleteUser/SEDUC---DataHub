import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:1420',
    ...devices['Desktop Chrome'],
  },
  webServer: {
    // Modo "e2e": não lê .env.development.local, então o app roda no modo local (sem login).
    command: 'npx vite --mode e2e',
    url: 'http://localhost:1420',
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
