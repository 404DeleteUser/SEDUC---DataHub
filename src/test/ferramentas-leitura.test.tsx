// Regressões da revisão: leituras assíncronas de arquivo na execução avulsa.
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { PlanilhaLida } from '../utils/planilhas';

// Cada leitura fica pendente até o teste resolvê-la, na ordem que quiser.
const pendentes = new Map<string, (planilha: PlanilhaLida) => void>();
vi.mock('../utils/planilhas', async (original) => ({
  ...(await original<typeof import('../utils/planilhas')>()),
  lerPlanilha: (arquivo: File) =>
    new Promise<PlanilhaLida>((resolver) =>
      pendentes.set(arquivo.name, resolver)
    ),
}));

const { default: App } = await import('../App');

const planilha = (
  colunas: string[],
  linhas: unknown[][] = []
): PlanilhaLida => ({
  colunas,
  linhas,
  indicePorColuna: Object.fromEntries(colunas.map((coluna, i) => [coluna, i])),
});

async function abrir(nome: string) {
  const user = userEvent.setup();
  render(<App />);
  const nav = screen.getByRole('navigation', { name: 'Navegação principal' });
  await user.click(within(nav).getByRole('button', { name: 'Ferramentas' }));
  await user.click(
    within(
      screen.getByRole('list', { name: 'Catálogo de ferramentas' })
    ).getByRole('button', { name: new RegExp(`^${nome}`) })
  );
  return user;
}

const arquivo = (nome: string) => new File(['x'], nome, { type: 'text/csv' });

describe('leitura de arquivos na ferramenta avulsa', () => {
  it('uma leitura antiga não sobrescreve o arquivo escolhido depois', async () => {
    const user = await abrir('Dividir Por');
    const campo = screen.getByLabelText(/Arquivo de entrada/);
    await user.upload(campo, arquivo('grande.xlsx'));
    await user.upload(campo, arquivo('pequeno.csv'));
    await act(async () => pendentes.get('pequeno.csv')!(planilha(['Tipo'])));
    await act(async () =>
      pendentes.get('grande.xlsx')!(planilha(['Escola', 'Turno']))
    );

    const opcoes = within(screen.getByRole('combobox', { name: 'Coluna' }))
      .getAllByRole('option')
      .map((opcao) => opcao.textContent);
    expect(opcoes).toEqual(['Selecione a coluna…', 'Tipo']);
    expect(screen.getByText('1 colunas identificadas.')).toBeInTheDocument();
  });

  it('não executa enquanto um arquivo ainda está sendo lido', async () => {
    const user = await abrir('Mesclar Planilhas');
    await user.upload(screen.getByLabelText(/Arquivo 1/), arquivo('a.csv'));
    await user.upload(screen.getByLabelText(/Arquivo 2/), arquivo('b.csv'));
    await act(async () => pendentes.get('a.csv')!(planilha(['CPF'])));
    await user.type(
      screen.getByLabelText(/Nome do arquivo de saída/),
      'uniao.xlsx'
    );
    await user.click(screen.getByRole('button', { name: /^Executar$/ }));

    expect(
      screen.getByText('Aguarde a leitura de b.csv terminar.')
    ).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('acusa coluna que não existe no arquivo atual', async () => {
    const user = await abrir('Dividir Por');
    const campo = screen.getByLabelText(/Arquivo de entrada/);
    await user.upload(campo, arquivo('a.csv'));
    await act(async () =>
      pendentes.get('a.csv')!(planilha(['Escola'], [['E1']]))
    );
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Coluna' }),
      'Escola'
    );
    await user.upload(campo, arquivo('b.csv'));
    await act(async () => pendentes.get('b.csv')!(planilha(['Tipo'])));
    await user.type(
      screen.getByLabelText(/Nome do arquivo de saída/),
      'saida.xlsx'
    );
    await user.click(screen.getByRole('button', { name: /^Executar$/ }));

    expect(
      screen.getByText(
        'A coluna Escola não existe em b.csv. Escolha outra coluna.'
      )
    ).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Coluna' })).toHaveFocus();
  });

  it('Eliminar Duplicatas informa no log quantas linhas sairiam', async () => {
    const user = await abrir('Eliminar Duplicatas');
    await user.upload(
      screen.getByLabelText(/Arquivo de entrada/),
      arquivo('base.csv')
    );
    await act(async () =>
      pendentes.get('base.csv')!(
        planilha(
          ['Sequência', 'Número'],
          [
            ['1234', 4],
            ['1234', 4],
            ['1234', 3],
            ['1234 ', 4],
          ]
        )
      )
    );
    await user.click(screen.getByRole('button', { name: 'Sequência' }));
    await user.click(screen.getByRole('button', { name: 'Número' }));
    await user.type(
      screen.getByLabelText(/Nome do arquivo de saída/),
      'sem-duplicatas.xlsx'
    );
    await user.click(screen.getByRole('button', { name: /^Executar$/ }));

    expect(
      await screen.findByText(/1 linhas duplicadas encontradas/, undefined, {
        timeout: 3000,
      })
    ).toBeInTheDocument();
  });
});
