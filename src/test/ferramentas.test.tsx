// Aba Ferramentas: execução avulsa (não salva) e parâmetros gravados na etapa do processo.
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import App from '../App';

// O explorador de arquivos é do sistema: aqui a escolha é simulada.
vi.mock('../utils/explorador', () => ({
  escolherArquivo: vi.fn(async () => ({
    nome: 'seap.xlsx',
    caminho: 'C:\\Bases\\seap.xlsx',
    rotulo: 'C:\\Bases\\seap.xlsx',
  })),
  escolherPasta: vi.fn(async () => ({
    nome: 'Resultados',
    caminho: 'C:\\Resultados',
    rotulo: 'C:\\Resultados',
  })),
  escolherDestino: vi.fn(async () => ({
    nome: 'resultado.xlsx',
    caminho: 'C:\\Saida\\resultado.xlsx',
    rotulo: 'C:\\Saida\\resultado.xlsx',
  })),
}));

const csv = (nome: string, conteudo: string) =>
  new File([conteudo], nome, { type: 'text/csv' });

function renderApp() {
  const user = userEvent.setup({
    advanceTimers: (ms) => {
      if (vi.isFakeTimers()) vi.advanceTimersByTime(ms);
    },
  });
  render(<App />);
  return user;
}

const nav = () =>
  screen.getByRole('navigation', { name: 'Navegação principal' });

async function irParaFerramentas(user: ReturnType<typeof userEvent.setup>) {
  await user.click(within(nav()).getByRole('button', { name: 'Ferramentas' }));
}

const catalogo = () =>
  screen.getByRole('list', { name: 'Catálogo de ferramentas' });

async function escolher(
  user: ReturnType<typeof userEvent.setup>,
  nome: string
) {
  await user.click(
    within(catalogo()).getByRole('button', { name: new RegExp(`^${nome}`) })
  );
}

describe('aba Ferramentas', () => {
  it('fica disponível na sidebar e lista só as 5 ferramentas do catálogo', async () => {
    const user = renderApp();
    await irParaFerramentas(user);
    expect(
      screen.getByRole('heading', { level: 1, name: 'Ferramentas' })
    ).toBeInTheDocument();
    expect(
      within(nav()).getByRole('button', { name: 'Ferramentas' })
    ).toHaveAttribute('aria-current', 'page');
    const nomes = within(catalogo())
      .getAllByRole('button')
      .map(
        (botao) => botao.querySelector('.ferramentas-item__nome')?.textContent
      );
    expect(nomes).toEqual([
      'Zebrar Planilha',
      'Eliminar Duplicatas',
      'Dicionário',
      'Mesclar Planilhas',
      'Dividir Por',
    ]);
  });

  it('avulsa: as configurações não são salvas ao trocar de ferramenta ou sair da aba', async () => {
    const user = renderApp();
    await irParaFerramentas(user);
    await escolher(user, 'Dicionário');
    await user.type(
      screen.getByRole('textbox', { name: 'Valor 1' }),
      'celular'
    );
    expect(screen.getByRole('textbox', { name: 'Valor 1' })).toHaveValue(
      'celular'
    );

    await escolher(user, 'Zebrar Planilha');
    await escolher(user, 'Dicionário');
    expect(screen.getByRole('textbox', { name: 'Valor 1' })).toHaveValue('');

    await user.type(screen.getByRole('textbox', { name: 'Valor 1' }), 'ipad');
    await user.click(within(nav()).getByRole('button', { name: 'Início' }));
    await irParaFerramentas(user);
    await escolher(user, 'Dicionário');
    expect(screen.getByRole('textbox', { name: 'Valor 1' })).toHaveValue('');
  });

  it('avulsa: valida antes de executar e depois simula a execução', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = renderApp();
    await irParaFerramentas(user);
    await escolher(user, 'Dividir Por');
    await user.click(screen.getByRole('button', { name: /^Executar$/ }));
    expect(
      screen.getByText('Selecione o arquivo de entrada.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Escolha a coluna usada para criar as abas.')
    ).toBeInTheDocument();

    await user.upload(
      screen.getByLabelText(/Arquivo de entrada/),
      csv('eletronicos.csv', 'Tipo,Modelo\nCelular,A\niPad,B\ncelular,C\n,D\n')
    );
    const coluna = await screen.findByRole('option', { name: 'Tipo' });
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Coluna' }),
      coluna
    );
    const previa = await screen.findByRole('list', {
      name: 'Abas que serão criadas',
    });
    expect(
      within(previa)
        .getAllByRole('listitem')
        .map((item) => item.textContent)
    ).toEqual([
      'Consolidadatodas as linhas',
      'Celular2 linhas',
      'iPad1 linha',
      'Outros1 linha',
    ]);

    await user.type(
      screen.getByLabelText(/Nome do arquivo de saída/),
      'por-tipo.xlsx'
    );
    await user.click(screen.getByRole('button', { name: /^Executar$/ }));
    for (let tick = 0; tick < 8; tick++) {
      await act(async () => {
        vi.advanceTimersByTime(900);
      });
    }
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '100'
    );
    expect(screen.getByRole('log')).toHaveTextContent('Celular');
    vi.useRealTimers();
  });

  it('mesclar empilhando acusa cabeçalhos divergentes', async () => {
    const user = renderApp();
    await irParaFerramentas(user);
    await escolher(user, 'Mesclar Planilhas');
    await user.upload(
      screen.getByLabelText(/Arquivo 1/),
      csv('a.csv', 'CPF,Nome\n1,Ana')
    );
    await user.upload(
      screen.getByLabelText(/Arquivo 2/),
      csv('b.csv', 'CPF,Cargo\n2,Prof')
    );
    await user.type(
      screen.getByLabelText(/Nome do arquivo de saída/),
      'uniao.xlsx'
    );
    await user.click(screen.getByRole('button', { name: /^Executar$/ }));
    expect(
      await screen.findByText(
        /Os cabeçalhos não coincidem\. b\.csv: falta Nome; sobra Cargo\./
      )
    ).toBeInTheDocument();
  });

  it('o Início abre a aba e a ferramenta escolhida', async () => {
    const user = renderApp();
    await user.click(screen.getByRole('button', { name: 'Abrir Dicionário' }));
    expect(
      screen.getByRole('heading', { level: 1, name: 'Ferramentas' })
    ).toBeInTheDocument();
    expect(
      within(catalogo()).getByRole('button', { name: /^Dicionário/ })
    ).toHaveAttribute('aria-pressed', 'true');
    await user.click(within(nav()).getByRole('button', { name: 'Início' }));
    await user.click(screen.getByRole('button', { name: /Ver todas/ }));
    expect(
      screen.getByRole('heading', { level: 1, name: 'Ferramentas' })
    ).toBeInTheDocument();
  });
});

describe('ferramenta dentro do processo', () => {
  async function abrirConfiguracaoDoCruzamento(
    user: ReturnType<typeof userEvent.setup>
  ) {
    await user.click(within(nav()).getByRole('button', { name: 'Processos' }));
    await user.click(
      screen.getByRole('button', { name: 'Editar Cruzamento SEAP x Folha' })
    );
    await user.click(screen.getByRole('button', { name: /Próximo/ }));
  }

  it('grava os parâmetros da etapa ao salvar o processo', async () => {
    const user = renderApp();
    await abrirConfiguracaoDoCruzamento(user);
    await user.click(
      screen.getByRole('button', { name: /Dicionário/, pressed: false })
    );
    await user.click(screen.getByRole('button', { name: /Valor exato/ }));
    await user.type(screen.getByRole('textbox', { name: 'Valor 1' }), 'ativo');
    await user.click(screen.getByRole('button', { name: /Salvar Processo/ }));

    await abrirConfiguracaoDoCruzamento(user);
    await user.click(
      screen.getByRole('button', { name: /Dicionário/, pressed: false })
    );
    expect(screen.getByRole('textbox', { name: 'Valor 1' })).toHaveValue(
      'ativo'
    );
    expect(screen.getByRole('button', { name: /Valor exato/ })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });

  it('uma etapa adicionada já vem com os parâmetros padrão da ferramenta', async () => {
    const user = renderApp();
    await abrirConfiguracaoDoCruzamento(user);
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Ferramenta para adicionar' }),
      'Zebrar Planilha'
    );
    await user.click(screen.getByRole('button', { name: /^Adicionar$/ }));
    expect(
      screen.getByRole('textbox', { name: 'Cor do cabeçalho' })
    ).toHaveValue('#1f4e79');
  });

  it('salvar um processo novo o inclui no catálogo e mantém a configuração', async () => {
    const user = renderApp();
    await user.click(within(nav()).getByRole('button', { name: 'Processos' }));
    await user.click(screen.getByRole('button', { name: /Novo Processo/ }));
    await user.type(
      screen.getByLabelText(/Nome do processo/),
      'Auditoria de Faltas'
    );
    await user.upload(
      screen.getByLabelText(/Principal 1/),
      csv('faltas.csv', 'CPF\n1')
    );
    await user.type(
      screen.getByLabelText(/Nome do arquivo de saída/),
      'faltas.xlsx'
    );
    await user.click(screen.getByLabelText(/Pasta de destino/));
    await user.click(screen.getByRole('button', { name: /Próximo/ }));
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Ferramenta para adicionar' }),
      'Dividir Por'
    );
    await user.click(screen.getByRole('button', { name: /^Adicionar$/ }));
    await user.click(screen.getByRole('button', { name: /Salvar Processo/ }));

    expect(
      screen.getByRole('heading', { level: 2, name: 'Auditoria de Faltas' })
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole('button', { name: 'Editar Auditoria de Faltas' })
    );
    expect(screen.getByLabelText(/Nome do processo/)).toHaveValue(
      'Auditoria de Faltas'
    );
    await user.click(screen.getByRole('button', { name: /Próximo/ }));
    expect(
      screen.getAllByRole('button', { name: /^Reordenar etapa/ })
    ).toHaveLength(1);
  });

  it('Executar de um processo configurado já roda a simulação', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = renderApp();
    await user.click(within(nav()).getByRole('button', { name: 'Processos' }));
    await user.click(screen.getByRole('button', { name: /Novo Processo/ }));
    await user.type(screen.getByLabelText(/Nome do processo/), 'Folha Mensal');
    await user.upload(
      screen.getByLabelText(/Principal 1/),
      csv('folha.csv', 'CPF\n1')
    );
    await user.type(
      screen.getByLabelText(/Nome do arquivo de saída/),
      'folha.xlsx'
    );
    await user.click(screen.getByLabelText(/Pasta de destino/));
    await user.click(screen.getByRole('button', { name: /Próximo/ }));
    await user.click(screen.getByRole('button', { name: /Salvar Processo/ }));

    await user.click(
      screen.getByRole('button', { name: 'Executar Folha Mensal' })
    );
    const dialog = screen.getByRole('dialog', { name: 'Folha Mensal' });
    await act(async () => {
      vi.advanceTimersByTime(2500);
    });
    expect(
      Number(
        within(dialog).getByRole('progressbar').getAttribute('aria-valuenow')
      )
    ).toBeGreaterThan(0);
    expect(within(dialog).queryByRole('alert')).not.toBeInTheDocument();
    vi.useRealTimers();
  });
});
