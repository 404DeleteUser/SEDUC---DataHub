// Testes de caracterização: fixam o comportamento que o redesign precisa preservar.
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import App from '../App';

function renderApp() {
  const user = userEvent.setup({
    advanceTimers: (ms) => {
      if (vi.isFakeTimers()) vi.advanceTimersByTime(ms);
    },
  });
  render(<App />);
  return user;
}

async function irParaProcessos(user: ReturnType<typeof userEvent.setup>) {
  const nav = screen.getByRole('navigation', { name: 'Navegação principal' });
  await user.click(within(nav).getByRole('button', { name: 'Processos' }));
}

describe('navegação e tema', () => {
  it('abre a Home por padrão e navega para Processos', async () => {
    const user = renderApp();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Início' })
    ).toBeInTheDocument();
    await irParaProcessos(user);
    expect(
      screen.getByRole('heading', { level: 1, name: 'Processos' })
    ).toBeInTheDocument();
  });

  it('alterna o tema e persiste a escolha', async () => {
    const user = renderApp();
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    await user.click(screen.getByRole('button', { name: 'Ativar modo claro' }));
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
    expect(localStorage.getItem('datahub-theme')).toBe('light');
  });

  it('mantém Processos ativo na sidebar durante o fluxo de criação', async () => {
    const user = renderApp();
    await irParaProcessos(user);
    await user.click(screen.getByRole('button', { name: /Novo Processo/ }));
    const nav = screen.getByRole('navigation', { name: 'Navegação principal' });
    expect(
      within(nav).getByRole('button', { name: 'Processos' })
    ).toHaveAttribute('aria-current', 'page');
  });
});

describe('catálogo de processos', () => {
  it('busca sem diferenciar acentos e mostra estado vazio recuperável', async () => {
    const user = renderApp();
    await irParaProcessos(user);
    const busca = screen.getByRole('searchbox', { name: /Buscar processos/ });
    await user.type(busca, 'vigencia');
    expect(
      screen.getByRole('heading', { name: 'Verificação de Vigência' })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Cruzamento SEAP x Folha' })
    ).not.toBeInTheDocument();

    await user.clear(busca);
    await user.type(busca, 'zzzz');
    expect(screen.getByText(/Nenhum processo encontrado/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Limpar busca' }));
    expect(
      screen.getByRole('heading', { name: 'Cruzamento SEAP x Folha' })
    ).toBeInTheDocument();
  });

  it('o lápis abre a edição do processo', async () => {
    const user = renderApp();
    await irParaProcessos(user);
    const editar = screen.getAllByRole('button', {
      name: 'Editar Cruzamento SEAP x Folha',
    });
    await user.click(editar[editar.length - 1]);
    expect(
      screen.getByRole('heading', { level: 1, name: 'Editar Processo' })
    ).toBeInTheDocument();
  });
});

describe('novo processo — validação', () => {
  it('lista os obrigatórios e foca o primeiro campo inválido', async () => {
    const user = renderApp();
    await irParaProcessos(user);
    await user.click(screen.getByRole('button', { name: /Novo Processo/ }));
    await user.click(screen.getByRole('button', { name: /Próximo/ }));

    expect(screen.getByText('Informe o nome do processo.')).toBeInTheDocument();
    expect(
      screen.getByText('Selecione o arquivo principal.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Informe o nome do arquivo de saída.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Selecione a pasta de destino.')
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Nome do processo/)).toHaveFocus();
    expect(screen.getByLabelText(/Nome do processo/)).toHaveAttribute(
      'aria-invalid',
      'true'
    );
  });

  it('exige o script quando a origem é Python', async () => {
    const user = renderApp();
    await irParaProcessos(user);
    await user.click(screen.getByRole('button', { name: /Novo Processo/ }));
    await user.click(
      screen.getByRole('button', { name: /Conectar script Python/ })
    );
    await user.click(screen.getByRole('button', { name: /Próximo/ }));
    expect(
      screen.getByText('Selecione o script Python que deseja conectar.')
    ).toBeInTheDocument();
  });

  it('limita os arquivos auxiliares a três', async () => {
    const user = renderApp();
    await irParaProcessos(user);
    await user.click(screen.getByRole('button', { name: /Novo Processo/ }));
    const adicionar = screen.getByRole('button', {
      name: /Adicionar auxiliar/,
    });
    await user.click(adicionar);
    await user.click(adicionar);
    await user.click(adicionar);
    expect(adicionar).toBeDisabled();
    expect(
      screen.getAllByRole('button', { name: 'Remover auxiliar' })
    ).toHaveLength(3);
  });

  it('avança para a configuração com os campos obrigatórios preenchidos', async () => {
    const user = renderApp();
    await irParaProcessos(user);
    await user.click(screen.getByRole('button', { name: /Novo Processo/ }));
    await user.type(
      screen.getByLabelText(/Nome do processo/),
      'Auditoria de Faltas'
    );
    await user.upload(
      screen.getByLabelText(/Principal 1/),
      new File(['a;b'], 'base.csv', { type: 'text/csv' })
    );
    await user.type(
      screen.getByLabelText(/Nome do arquivo de saída/),
      'Saida.xlsx'
    );
    await user.type(
      screen.getByLabelText(/Pasta de destino/),
      'C:\\Resultados'
    );
    await user.click(screen.getByRole('button', { name: /Próximo/ }));
    expect(
      screen.getByRole('heading', { level: 1, name: 'Configurar Ferramentas' })
    ).toBeInTheDocument();
  });
});

describe('configuração do processo — fluxo', () => {
  async function abrirConfiguracao(user: ReturnType<typeof userEvent.setup>) {
    await irParaProcessos(user);
    const editar = screen.getAllByRole('button', {
      name: 'Editar Cruzamento SEAP x Folha',
    });
    await user.click(editar[editar.length - 1]);
    await user.click(screen.getByRole('button', { name: /Próximo/ }));
  }

  it('reordena etapas pelos botões e remove etapas', async () => {
    const user = renderApp();
    await abrirConfiguracao(user);
    const nomesDasEtapas = () =>
      screen
        .getAllByRole('button', { name: /^Reordenar etapa/ })
        .map((grip) => grip.closest('li')?.textContent ?? '');
    const antes = nomesDasEtapas();
    expect(antes.length).toBeGreaterThan(1);

    await user.click(
      screen.getByRole('button', { name: 'Mover etapa 1 para baixo' })
    );
    const depois = nomesDasEtapas();
    expect(depois[0]).toContain(antes[1].replace(/^\d+/, '').slice(0, 12));
    expect(depois[1]).toContain(antes[0].replace(/^\d+/, '').slice(0, 12));

    await user.click(screen.getByRole('button', { name: 'Remover etapa 1' }));
    expect(nomesDasEtapas()).toHaveLength(antes.length - 1);
  });

  it('adiciona uma ferramenta ao fluxo', async () => {
    const user = renderApp();
    await abrirConfiguracao(user);
    const antes = screen.getAllByRole('button', {
      name: /^Reordenar etapa/,
    }).length;
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Ferramenta para adicionar' }),
      'Zebrar Planilha'
    );
    await user.click(screen.getByRole('button', { name: /^Adicionar$/ }));
    expect(
      screen.getAllByRole('button', { name: /^Reordenar etapa/ })
    ).toHaveLength(antes + 1);
  });

  it('salvar volta ao catálogo com aviso de simulação', async () => {
    const user = renderApp();
    await abrirConfiguracao(user);
    await user.click(screen.getByRole('button', { name: /Salvar Processo/ }));
    expect(
      screen.getByRole('heading', { level: 1, name: 'Processos' })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Nenhum processo foi\s+persistido/)
    ).toBeInTheDocument();
  });
});

describe('modal de execução (simulada)', () => {
  it('executa a simulação até 100% e permite repetir', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = renderApp();
    await irParaProcessos(user);
    await user.click(screen.getAllByRole('button', { name: /^Executar/ })[0]);
    const dialog = screen.getByRole('dialog');
    await user.type(
      within(dialog).getByLabelText('Planilha principal'),
      'C:\\Bases\\seap.xlsx'
    );
    await user.type(
      within(dialog).getByLabelText('Arquivo de saída'),
      'C:\\Saida\\resultado.xlsx'
    );
    await user.click(
      within(dialog).getByRole('button', { name: /^Executar$/ })
    );
    for (let tick = 0; tick < 9; tick++) {
      await act(async () => {
        vi.advanceTimersByTime(1200);
      });
    }
    expect(within(dialog).getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '100'
    );
    expect(
      within(dialog).getByRole('button', { name: /Executar novamente/ })
    ).toBeEnabled();
    vi.useRealTimers();
  });

  it('não quebra quando vários ticks da simulação se acumulam (janela em segundo plano)', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = renderApp();
    await irParaProcessos(user);
    await user.click(screen.getAllByRole('button', { name: /^Executar/ })[0]);
    const dialog = screen.getByRole('dialog');
    await user.type(
      within(dialog).getByLabelText('Planilha principal'),
      'C:\\Bases\\seap.xlsx'
    );
    await user.type(
      within(dialog).getByLabelText('Arquivo de saída'),
      'C:\\Saida\\resultado.xlsx'
    );
    await user.click(
      within(dialog).getByRole('button', { name: /^Executar$/ })
    );
    await act(async () => {
      vi.advanceTimersByTime(30_000);
    });
    expect(within(dialog).getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '100'
    );
    vi.useRealTimers();
  });

  it('fecha o modal pelo botão Fechar', async () => {
    const user = renderApp();
    await irParaProcessos(user);
    await user.click(screen.getAllByRole('button', { name: /^Executar/ })[0]);
    await user.click(screen.getByRole('button', { name: 'Fechar execução' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
