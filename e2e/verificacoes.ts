// Verificações comuns a toda tela: captura, axe (sério/crítico), texto ≥ 12px e overflow.
import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, type TestInfo } from '@playwright/test';

export async function verificarQualidade(
  page: Page,
  testInfo: TestInfo,
  estado: string
) {
  await page.screenshot({ path: testInfo.outputPath(`${estado}.png`) });

  const axe = await new AxeBuilder({ page }).analyze();
  const graves = axe.violations.filter(
    (v) => v.impact === 'serious' || v.impact === 'critical'
  );
  expect(
    graves.map(
      (v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`
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
      if (tamanho < 12) achados.push(`${tamanho}px "${texto.slice(0, 30)}"`);
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
        (el) => el.checkVisibility() && el.scrollWidth > el.clientWidth + 1
      )
      .map(
        (el) =>
          `${el.tagName.toLowerCase()}.${el.className.toString().split(' ')[0]} ${el.scrollWidth}>${el.clientWidth}`
      )
  );
  expect(overflow).toEqual([]);
}
