// Critérios de aceitação visuais e de acessibilidade (docs/ux-ui-modernization-plan.md §8.1).
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const estados: Record<string, (page: Page) => Promise<void>> = {
  inicio: async () => {},
  processos: async (page) => {
    await page
      .getByRole('navigation', { name: 'Navegação principal' })
      .getByRole('button', { name: 'Processos' })
      .click();
  },
  'novo-processo-erros': async (page) => {
    await estados.processos(page);
    await page.getByRole('button', { name: /Novo Processo/ }).click();
    await page.getByRole('button', { name: /Próximo/ }).click();
  },
  'configurar-processo': async (page) => {
    await estados.processos(page);
    await page
      .getByRole('button', { name: 'Editar Cruzamento SEAP x Folha' })
      .last()
      .click();
    await page.getByRole('button', { name: /Próximo/ }).click();
  },
  'modal-execucao': async (page) => {
    await estados.processos(page);
    await page
      .getByRole('button', { name: /^Executar/ })
      .first()
      .click();
    await expect(page.getByRole('dialog')).toBeVisible();
  },
  ferramentas: async (page) => {
    await page
      .getByRole('navigation', { name: 'Navegação principal' })
      .getByRole('button', { name: 'Ferramentas' })
      .click();
  },
  'ferramenta-dicionario-erros': async (page) => {
    await estados.ferramentas(page);
    await page
      .getByRole('list', { name: 'Catálogo de ferramentas' })
      .getByRole('button', { name: /^Dicionário/ })
      .click();
    await page.getByRole('button', { name: /^Executar$/ }).click();
  },
  coordenadorias: async (page) => {
    await page
      .getByRole('button', { name: 'Coordenadorias e Equipes' })
      .click();
    await expect(
      page.getByRole('region', { name: 'Organograma' })
    ).toBeVisible();
  },
  'coordenadorias-selecao': async (page) => {
    await estados.coordenadorias(page);
    await page.getByPlaceholder('Buscar setor…').fill('juína');
    await page
      .getByRole('list', { name: 'Resultados da busca' })
      .getByRole('button')
      .first()
      .click();
  },
  'coordenadorias-equipe': async (page) => {
    await estados.coordenadorias(page);
    // Planilha fictícia: nenhum dado real.
    await page.getByLabel(/Carregar planilha/).setInputFiles({
      name: 'lotacao-ficticia.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from(
        'Lotacao,Nome,EmailCompleto,Funcao,NumFunc\n' +
          'NÚCLEO DE FROTAS,Ana Teste,ana@exemplo.test,Chefe,111\n' +
          'NÚCLEO DE FROTAS,Bruna Teste,bruna@exemplo.test,Apoio,222\n' +
          'SETOR INEXISTENTE,Caio Teste,caio@exemplo.test,Apoio,333\n'
      ),
    });
    await page.getByPlaceholder('Buscar setor…').fill('núcleo de frotas');
    await page
      .getByRole('list', { name: 'Resultados da busca' })
      .getByRole('button')
      .first()
      .click();
    await expect(
      page.getByRole('list', { name: 'Pessoas lotadas' })
    ).toBeVisible();
  },
  sites: async (page) => {
    await page.getByRole('button', { name: 'Sites Institucionais' }).click();
    await expect(
      page.getByRole('heading', { level: 1, name: 'Sites Institucionais' })
    ).toBeVisible();
  },
  'etapa-com-parametros': async (page) => {
    await estados['configurar-processo'](page);
    await page
      .getByRole('button', { name: /Dicionário/, pressed: false })
      .click();
  },
};

const viewports = [
  { nome: 'minimo-tauri', width: 960, height: 640 },
  { nome: 'padrao-tauri', width: 1280, height: 800 },
  { nome: 'amplo', width: 1920, height: 1080 },
];

for (const tema of ['light', 'dark'] as const) {
  for (const vp of viewports) {
    for (const [estado, abrir] of Object.entries(estados)) {
      test(`${estado} · ${vp.nome} · ${tema}`, async ({ page }, testInfo) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.addInitScript(
          (t) => localStorage.setItem('datahub-theme', t),
          tema
        );
        const erros: string[] = [];
        page.on('pageerror', (e) => erros.push(e.message));
        page.on('console', (m) => m.type() === 'error' && erros.push(m.text()));

        await page.goto('/');
        await abrir(page);
        await page.waitForFunction(() =>
          [...document.images].every(
            (img) => img.complete && img.naturalWidth > 0
          )
        );
        await page.waitForTimeout(250);
        await page.screenshot({ path: testInfo.outputPath(`${estado}.png`) });

        const axe = await new AxeBuilder({ page }).analyze();
        const graves = axe.violations.filter(
          (v) => v.impact === 'serious' || v.impact === 'critical'
        );
        expect(
          graves.map(
            (v) =>
              `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`
          )
        ).toEqual([]);

        const textoPequeno = await page.evaluate(() => {
          const achados: string[] = [];
          const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT
          );
          while (walker.nextNode()) {
            const el = walker.currentNode.parentElement;
            const texto = walker.currentNode.textContent?.trim();
            if (!el || !texto || !el.checkVisibility()) continue;
            const tamanho = parseFloat(getComputedStyle(el).fontSize);
            if (tamanho < 12)
              achados.push(`${tamanho}px "${texto.slice(0, 30)}"`);
          }
          return achados;
        });
        expect(textoPequeno).toEqual([]);

        const overflow = await page.evaluate(() =>
          [
            ...document.querySelectorAll<HTMLElement>(
              'main, aside, header, dialog[open], section'
            ),
          ]
            .filter(
              (el) =>
                el.checkVisibility() && el.scrollWidth > el.clientWidth + 1
            )
            .map(
              (el) =>
                `${el.tagName.toLowerCase()}.${el.className.toString().split(' ')[0]} ${el.scrollWidth}>${el.clientWidth}`
            )
        );
        expect(overflow).toEqual([]);
        expect(erros).toEqual([]);
      });
    }
  }
}

test('ordem de teclado chega à ação principal com foco visível', async ({
  page,
}) => {
  await page.goto('/');
  await estados.processos(page);
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press('Tab');
    const foco = await page.evaluate(() => {
      const a = document.activeElement as HTMLElement | null;
      return {
        nome: a?.getAttribute('aria-label') ?? a?.textContent?.trim() ?? '',
        outline: a ? getComputedStyle(a).outlineStyle : 'none',
      };
    });
    expect(foco.outline, `foco sem contorno em "${foco.nome}"`).not.toBe(
      'none'
    );
    if (/Novo Processo/.test(foco.nome)) return;
  }
  throw new Error('"Novo Processo" não foi alcançado por Tab');
});

for (const fechar of ['Escape', 'botão Fechar'] as const) {
  test(`modal: ${fechar} fecha e devolve o foco ao gatilho`, async ({
    page,
  }) => {
    await page.goto('/');
    await estados.processos(page);
    const gatilho = page.getByRole('button', {
      name: 'Executar Cruzamento SEAP x Folha',
    });
    await gatilho.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog')).toBeVisible();
    if (fechar === 'Escape') await page.keyboard.press('Escape');
    else await page.getByRole('button', { name: 'Fechar execução' }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(gatilho).toBeFocused();
  });
}
