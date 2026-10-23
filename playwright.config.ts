import { defineConfig, devices } from '@playwright/test';
import { SUPABASE_E2E } from './e2e/entrar';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  reporter: [['list']],
  use: devices['Desktop Chrome'],
  projects: [
    {
      // App no modo local (sem login), como sempre foi.
      name: 'local',
      testIgnore: /entrada\.spec\.ts/,
      use: { baseURL: 'http://localhost:1422' },
    },
    {
      // Entrada e /redefinir-senha, com o Supabase configurado.
      name: 'entrada',
      testMatch: /entrada\.spec\.ts/,
      use: { baseURL: 'http://localhost:1421' },
    },
  ],
  webServer: [
    {
      // Modo "e2e": não lê .env.development.local, então o app roda no modo local (sem login).
      // Porta própria e sem reaproveitar: o `npm run dev` (1420) pode estar com o Supabase.
      command: 'npx vite --mode e2e --port 1422 --strictPort',
      url: 'http://localhost:1422',
      reuseExistingServer: false,
      timeout: 60_000,
    },
    {
      // Supabase de teste (E2E_SUPABASE_URL/E2E_SUPABASE_ANON_KEY) ou um endereço
      // fictício: a Entrada abre igual, e só o login de verdade precisa do real.
      command: 'npx vite --mode e2e --port 1421 --strictPort',
      url: 'http://localhost:1421',
      reuseExistingServer: false,
      timeout: 60_000,
      env: {
        VITE_SUPABASE_URL: SUPABASE_E2E.url,
        VITE_SUPABASE_ANON_KEY: SUPABASE_E2E.chave,
      },
    },
  ],
});
