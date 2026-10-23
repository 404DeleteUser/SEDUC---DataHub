// Entrada e /redefinir-senha: visual e acessibilidade (sempre) e login real (com conta de teste).
import { expect, test, type Page } from '@playwright/test';
import {
  SUPABASE_E2E,
  contaDeTeste,
  entrar,
  simularSessao,
  temContaDeTeste,
} from './entrar';
import { verificarQualidade } from './verificacoes';

const EMAIL_FICTICIO = 'pessoa.teste@edu.mt.gov.br';

const telas: Record<
  string,
  { caminho: string; abrir: (page: Page) => Promise<void> }
> = {
  entrada: {
    caminho: '/',
    abrir: async (page) => {
      await expect(page.getByLabel(/^E-mail/)).toBeFocused();
    },
  },
  'entrada-com-erros': {
    caminho: '/',
    abrir: async (page) => {
      await page.getByRole('button', { name: 'Entrar' }).click();
      await expect(page.getByText('Informe o e-mail.')).toBeVisible();
    },
  },
  'entrada-esqueci-a-senha': {
    caminho: '/',
    abrir: async (page) => {
      // Nunca envia e-mail de verdade no teste visual.
      await page.route(`${SUPABASE_E2E.url}/auth/v1/recover**`, (rota) =>
        rota.fulfill({
          status: 200,
          contentType: 'application/json',
          body: '{}',
        })
      );
      await page.getByLabel(/^E-mail/).fill(EMAIL_FICTICIO);
      await page.getByRole('button', { name: 'Esqueci a senha' }).click();
      await page.getByRole('button', { name: 'Enviar link' }).click();
      await expect(page.getByText(/Se esse e-mail tiver acesso/)).toBeVisible();
    },
  },
  'redefinir-senha': {
    caminho: '/redefinir-senha',
    abrir: async (page) => {
      await expect(
        page.getByRole('heading', { level: 1, name: 'Criar nova senha' })
      ).toBeVisible();
    },
  },
  'link-vencido': {
    caminho: '/redefinir-senha#error=access_denied&error_code=otp_expired',
    abrir: async (page) => {
      await expect(
        page.getByRole('heading', { level: 1, name: 'Link vencido' })
      ).toBeVisible();
    },
  },
};

const viewports = [
  { nome: 'minimo', width: 960, height: 640 },
  { nome: 'padrao', width: 1280, height: 800 },
  { nome: 'amplo', width: 1920, height: 1080 },
  { nome: 'estreito', width: 390, height: 844 },
];

for (const tema of ['light', 'dark'] as const) {
  for (const vp of viewports) {
    for (const [nome, tela] of Object.entries(telas)) {
      test(`${nome} · ${vp.nome} · ${tema}`, async ({ page }, testInfo) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.addInitScript(
          (t) => localStorage.setItem('datahub-theme', t),
          tema
        );
        if (nome === 'redefinir-senha')
          await simularSessao(page, EMAIL_FICTICIO);
        const erros: string[] = [];
        page.on('pageerror', (e) => erros.push(e.message));

        await page.goto(tela.caminho);
        await tela.abrir(page);
        await page.waitForTimeout(250);
        await verificarQualidade(page, testInfo, nome);

        if (vp.width >= 720) {
          // Janela inteira, sem rolagem.
          const rola = await page.evaluate(() => {
            const main = document.querySelector('main')!;
            return (
              document.documentElement.scrollHeight > window.innerHeight ||
              main.scrollHeight > main.clientHeight + 1
            );
          });
          expect(rola).toBe(false);
        }
        expect(erros).toEqual([]);
      });
    }
  }
}

test.describe('login real com a conta de teste', () => {
  test.skip(
    !temContaDeTeste,
    'Defina E2E_SUPABASE_URL, E2E_SUPABASE_ANON_KEY, E2E_EMAIL e E2E_SENHA.'
  );

  test('entra, mostra o e-mail da sessão no Perfil e sai', async ({ page }) => {
    await entrar(page);
    await page.getByRole('button', { name: /^Perfil/ }).click();
    await expect(page.getByText(contaDeTeste.email)).toBeVisible();
    await page.getByRole('button', { name: 'Sair da conta' }).click();
    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Sair', exact: true })
      .click();
    await expect(
      page.getByRole('heading', { level: 1, name: 'Entrar' })
    ).toBeVisible();
  });

  test('senha errada mostra a mensagem genérica', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel(/^E-mail/).fill(contaDeTeste.email);
    await page.getByLabel(/^Senha/).fill('senha-errada-de-proposito');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page.getByRole('alert')).toHaveText(
      'E-mail ou senha incorretos.'
    );
  });
});
