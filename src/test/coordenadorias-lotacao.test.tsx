// Painel "Equipe do setor" com uma planilha fictícia (nenhum dado real).
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { PlanilhaLida } from '../utils/planilhas';

const CABECALHO = ['Lotacao', 'Nome', 'EmailCompleto', 'Funcao', 'NumFunc'];
let proximaPlanilha: PlanilhaLida;

vi.mock('../utils/planilhas', async (original) => ({
  ...(await original<typeof import('../utils/planilhas')>()),
  lerPlanilha: async () => proximaPlanilha,
}));

const { default: App } = await import('../App');

function planilha(colunas: string[], linhas: unknown[][]): PlanilhaLida {
  return {
    colunas,
    linhas,
    indicePorColuna: Object.fromEntries(colunas.map((c, i) => [c, i])),
  };
}

const arquivo = new File(['x'], 'lotacao-ficticia.xlsx');

async function abrirComPlanilha(dados: PlanilhaLida) {
  proximaPlanilha = dados;
  const user = userEvent.setup();
  render(<App />);
  await user.click(
    screen.getByRole('button', { name: 'Coordenadorias e Equipes' })
  );
  await user.upload(screen.getByLabelText(/Carregar planilha/), arquivo);
  return user;
}

async function selecionar(
  user: ReturnType<typeof userEvent.setup>,
  termo: string
) {
  await user.type(
    screen.getByRole('searchbox', { name: 'Buscar setor' }),
    termo
  );
  await user.click(
    within(
      screen.getByRole('list', { name: 'Resultados da busca' })
    ).getAllByRole('button')[0]
  );
}

describe('Equipe do setor', () => {
  it('mostra as pessoas do setor selecionado com matrícula e e-mail', async () => {
    const user = await abrirComPlanilha(
      planilha(CABECALHO, [
        ['NÚCLEO DE FROTAS', 'Bruna Teste', 'b@exemplo.test', 'Apoio', '222'],
        ['NUCLEO DE FROTAS', 'Ana Teste', 'a@exemplo.test', 'Chefe', '111'],
        ['SETOR INEXISTENTE', 'Caio Teste', 'c@exemplo.test', 'Apoio', '333'],
      ])
    );
    expect(
      await screen.findByText('lotacao-ficticia.xlsx')
    ).toBeInTheDocument();
    expect(screen.getByText('3 pessoas')).toBeInTheDocument();

    await selecionar(user, 'nucleo de frotas');
    const lista = screen.getByRole('list', { name: 'Pessoas lotadas' });
    const itens = within(lista).getAllByRole('listitem');
    expect(
      itens.map((item) => item.querySelector('strong')?.textContent)
    ).toEqual(['Ana Teste', 'Bruna Teste']);
    expect(within(itens[0]).getByText('111')).toBeInTheDocument();
    expect(within(itens[0]).getByText('a@exemplo.test')).toBeInTheDocument();

    expect(
      screen.getByText(/Lotações fora do organograma \(1\)/)
    ).toBeInTheDocument();
    expect(screen.getByText('SETOR INEXISTENTE')).toBeInTheDocument();
  });

  it('copia os e-mails do setor', async () => {
    const user = await abrirComPlanilha(
      planilha(CABECALHO, [
        ['NÚCLEO DE FROTAS', 'Ana Teste', 'a@exemplo.test', 'Chefe', '111'],
        ['NÚCLEO DE FROTAS', 'Bruna Teste', 'b@exemplo.test', 'Apoio', '222'],
      ])
    );
    await selecionar(user, 'nucleo de frotas');
    const escrever = vi
      .spyOn(navigator.clipboard, 'writeText')
      .mockResolvedValue(undefined);
    await user.click(screen.getByRole('button', { name: 'Copiar e-mails' }));

    expect(escrever).toHaveBeenCalledWith('a@exemplo.test; b@exemplo.test');
    expect(screen.getByText('2 e-mails copiados.')).toBeInTheDocument();
  });

  it('acusa colunas que faltam e permite remover a planilha', async () => {
    await abrirComPlanilha(planilha(['Lotacao', 'Nome'], []));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'A planilha não tem as colunas: EmailCompleto, Funcao, NumFunc.'
    );

    proximaPlanilha = planilha(CABECALHO, []);
    const user = userEvent.setup();
    await user.upload(screen.getByLabelText(/Carregar planilha/), arquivo);
    await user.click(
      await screen.findByRole('button', { name: 'Remover planilha' })
    );
    expect(screen.getByLabelText(/Carregar planilha/)).toBeInTheDocument();
  });
});
