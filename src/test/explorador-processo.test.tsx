// Campos de caminho só pelo explorador, script Python por pasta e log vindo
// das ferramentas das etapas. O explorador (diálogo do sistema) é simulado.
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from '../App';
import {
  escolherArquivo,
  escolherDestino,
  escolherPasta,
} from '../utils/explorador';

vi.mock('../utils/explorador', () => ({
  escolherArquivo: vi.fn(),
  escolherPasta: vi.fn(),
  escolherDestino: vi.fn(),
}));

const item = (rotulo: string, caminho?: string) => ({
  nome: rotulo.split(/[\\/]/).pop()!,
  caminho,
  rotulo,
});

afterEach(() => {
  vi.mocked(escolherArquivo).mockReset();
  vi.mocked(escolherPasta).mockReset();
  vi.mocked(escolherDestino).mockReset();
  vi.useRealTimers();
});

function renderApp() {
  const user = userEvent.setup({
    advanceTimers: (ms) => {
      if (vi.isFakeTimers()) vi.advanceTimersByTime(ms);
    },
  });
  render(<App />);
  return user;
}

async function novoProcesso(user: ReturnType<typeof userEvent.setup>) {
  const nav = screen.getByRole('navigation', { name: 'Navegação principal' });
  await user.click(within(nav).getByRole('button', { name: 'Processos' }));
  await user.click(screen.getByRole('button', { name: /Novo Processo/ }));
  await user.type(screen.getByLabelText(/Nome do processo/), 'Teste');
  await user.upload(
    screen.getByLabelText(/Principal 1/),
    new File(['CPF\n1'], 'base.csv', { type: 'text/csv' })
  );
  await user.type(screen.getByLabelText(/Nome do arquivo de saída/), 'saida');
  vi.mocked(escolherPasta).mockResolvedValueOnce(
    item('C:\\Saida', 'C:\\Saida')
  );
  await user.click(screen.getByLabelText(/Pasta de destino/));
}

describe('pasta de destino', () => {
  it('é um campo só, que abre o explorador; não aceita digitar', async () => {
    const user = renderApp();
    await novoProcesso(user);
    const campo = screen.getByRole('button', { name: /Pasta de destino/ });
    expect(campo).toHaveTextContent('C:\\Saida');
    expect(escolherPasta).toHaveBeenCalledWith({ titulo: 'Pasta de destino' });
  });
});

describe('script Python', () => {
  it('conecta uma pasta e usa o script principal escolhido', async () => {
    const user = renderApp();
    await novoProcesso(user);
    await user.click(
      screen.getByRole('button', { name: /Conectar script Python/ })
    );
    await user.click(screen.getByRole('button', { name: /Pasta com scripts/ }));
    vi.mocked(escolherPasta).mockResolvedValueOnce({
      ...item('scripts'),
      arquivos: ['main.py', 'util/apoio.py'],
    });
    await user.click(screen.getByLabelText(/Pasta dos scripts/));
    expect(screen.getByText('2 arquivos .py encontrados.')).toBeInTheDocument();
    await user.selectOptions(
      screen.getByLabelText(/Script principal/),
      'util/apoio.py'
    );
    await user.click(screen.getByRole('button', { name: /Próximo/ }));

    expect(
      screen.getByText(/Script Python · scripts · principal: util\/apoio\.py/)
    ).toBeInTheDocument();
  });

  it('acusa pasta sem .py e principal fora da pasta (app desktop)', async () => {
    const user = renderApp();
    await novoProcesso(user);
    await user.click(
      screen.getByRole('button', { name: /Conectar script Python/ })
    );
    await user.click(screen.getByRole('button', { name: /Pasta com scripts/ }));

    vi.mocked(escolherPasta).mockResolvedValueOnce({
      ...item('vazia'),
      arquivos: [],
    });
    await user.click(screen.getByLabelText(/Pasta dos scripts/));
    expect(
      screen.getByText('A pasta vazia não tem arquivos .py.')
    ).toBeInTheDocument();

    vi.mocked(escolherPasta).mockResolvedValueOnce(
      item('C:\\Scripts', 'C:\\Scripts')
    );
    await user.click(screen.getByLabelText(/Pasta dos scripts/));
    vi.mocked(escolherArquivo).mockResolvedValueOnce(
      item('C:\\Outros\\x.py', 'C:\\Outros\\x.py')
    );
    await user.click(screen.getByLabelText(/Script principal/));
    expect(
      screen.getByText(
        'O script principal precisa estar dentro da pasta Scripts.'
      )
    ).toBeInTheDocument();
    expect(escolherArquivo).toHaveBeenLastCalledWith(
      expect.objectContaining({ pastaInicial: 'C:\\Scripts' })
    );
  });
});

describe('logs de execução', () => {
  it('não são configuráveis no processo e vêm do log das ferramentas', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = renderApp();
    await novoProcesso(user);
    await user.click(screen.getByRole('button', { name: /Próximo/ }));
    expect(screen.queryByText('Logs de execução')).not.toBeInTheDocument();
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Ferramenta para adicionar' }),
      'Dividir Por'
    );
    await user.click(screen.getByRole('button', { name: /^Adicionar$/ }));
    await user.click(screen.getByRole('button', { name: /Salvar Processo/ }));

    await user.click(screen.getByRole('button', { name: 'Executar Teste' }));
    const dialog = screen.getByRole('dialog', { name: 'Teste' });
    expect(within(dialog).queryByRole('textbox')).not.toBeInTheDocument();
    await act(async () => {
      vi.advanceTimersByTime(30_000);
    });
    const log = within(dialog).getByRole('log');
    expect(log).toHaveTextContent('Dividir Por: Mantendo a aba consolidada…');
    expect(log).toHaveTextContent(
      'Gravando o arquivo de saída (C:\\Saida\\saida.xlsx)…'
    );
  });
});

describe('modal de execução', () => {
  it('arquivo de saída usa o "Salvar como" com o nome configurado', async () => {
    const user = renderApp();
    const nav = screen.getByRole('navigation', { name: 'Navegação principal' });
    await user.click(within(nav).getByRole('button', { name: 'Processos' }));
    await user.click(screen.getAllByRole('button', { name: /^Executar/ })[0]);
    const dialog = screen.getByRole('dialog');
    vi.mocked(escolherDestino).mockResolvedValueOnce(
      item('C:\\Saida\\final.xlsx', 'C:\\Saida\\final.xlsx')
    );
    await user.click(within(dialog).getByLabelText('Arquivo de saída'));
    expect(escolherDestino).toHaveBeenCalledWith(
      expect.objectContaining({ extensoes: ['xlsx'] })
    );
    expect(within(dialog).getByLabelText('Arquivo de saída')).toHaveTextContent(
      'C:\\Saida\\final.xlsx'
    );

    vi.mocked(escolherArquivo).mockResolvedValueOnce(item('extra.csv'));
    await user.click(within(dialog).getByLabelText('Planilha complementar'));
    await user.click(
      within(dialog).getByRole('button', {
        name: 'Remover planilha complementar',
      })
    );
    expect(
      within(dialog).getByLabelText('Planilha complementar')
    ).toHaveTextContent('Selecionar planilha…');
  });
});
