// Conta de teste do Supabase para o e2e, sempre lida do ambiente (nunca no código):
//   E2E_SUPABASE_URL, E2E_SUPABASE_ANON_KEY, E2E_EMAIL, E2E_SENHA.
// Sem elas, os testes de login real são pulados e a Entrada usa um Supabase fictício.
import { expect, type Page } from '@playwright/test';

const ENDERECO_FICTICIO = 'http://127.0.0.1:54399';

export const SUPABASE_E2E = {
  url: process.env.E2E_SUPABASE_URL || ENDERECO_FICTICIO,
  chave: process.env.E2E_SUPABASE_ANON_KEY || 'chave-ficticia-e2e',
};

export const contaDeTeste = {
  email: process.env.E2E_EMAIL ?? '',
  senha: process.env.E2E_SENHA ?? '',
};

export const temContaDeTeste = Boolean(
  process.env.E2E_SUPABASE_URL &&
  process.env.E2E_SUPABASE_ANON_KEY &&
  contaDeTeste.email &&
  contaDeTeste.senha
);

/** Chave em que o supabase-js guarda a sessão (sb-<projeto>-auth-token). */
export const CHAVE_SESSAO = `sb-${new URL(SUPABASE_E2E.url).hostname.split('.')[0]}-auth-token`;

export async function entrar(page: Page) {
  await page.goto('/');
  await page.getByLabel(/^E-mail/).fill(contaDeTeste.email);
  await page.getByLabel(/^Senha/).fill(contaDeTeste.senha);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(
    page.getByRole('heading', { level: 1, name: 'Início' })
  ).toBeVisible();
}

/** Sessão fictícia gravada antes de abrir a página (para ver /redefinir-senha sem e-mail real). */
export async function simularSessao(page: Page, email: string) {
  const agora = Math.floor(Date.now() / 1000);
  const sessao = {
    access_token: 'token-ficticio',
    refresh_token: 'refresh-ficticio',
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: agora + 3600,
    user: {
      id: '00000000-0000-0000-0000-000000000000',
      aud: 'authenticated',
      role: 'authenticated',
      email,
      app_metadata: {},
      user_metadata: {},
      created_at: new Date().toISOString(),
    },
  };
  await page.addInitScript(
    ([chave, valor]) => localStorage.setItem(chave, valor),
    [CHAVE_SESSAO, JSON.stringify(sessao)] as const
  );
}
