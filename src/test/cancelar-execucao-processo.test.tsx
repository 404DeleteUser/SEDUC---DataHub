import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from '../App';

vi.mock('../utils/explorador', () => ({
  escolherArquivo: vi.fn(async () => ({
    nome: 'seap.xlsx',
    caminho: 'C:\\Bases\\seap.xlsx',
    rotulo: 'C:\\Bases\\seap.xlsx',
  })),
  escolherDestino: vi.fn(async () => ({
    nome: 'resultado.xlsx',
    caminho: 'C:\\Saida\\resultado.xlsx',
    rotulo: 'C:\\Saida\\resultado.xlsx',
  })),
  escolherPasta: vi.fn(async () => ({
    nome: 'Resultados',
    caminho: 'C:\\Resultados',
    rotulo: 'C:\\Resultados',
  })),
}));

afterEach(() => vi.useRealTimers());

async function abrirModal() {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  render(<App />);
  const nav = within(
    screen.getByRole('navigation', { name: 'Navegação principal' })
  );
  await user.click(nav.getByRole('button', { name: 'Processos' }));
  await user.click(screen.getAllByRole('button', { name: /^Executar/ })[0]);
  const dialog = within(screen.getByRole('dialog'));
  await user.click(dialog.getByLabelText('Planilha principal'));
  await user.click(dialog.getByLabelText('Arquivo de saída'));
  return { user, dialog };
}

async function iniciar(
  user: ReturnType<typeof userEvent.setup>,
  dialog: ReturnType<typeof within>
) {
  await user.click(
    dialog.getByRole('button', { name: /^Executar(?: novamente)?$/ })
  );
}

describe('cancelamento da execução simulada', () => {
  it('cancela mantendo progresso e logs e permite executar novamente até concluir', async () => {
    const { user, dialog } = await abrirModal();
    await iniciar(user, dialog);
    expect(
      dialog.getByRole('button', { name: 'Cancelar execução' })
    ).toBeInTheDocument();
    await act(async () => {
      vi.advanceTimersByTime(2400);
    });
    const progresso = dialog.getByRole('progressbar');
    const valorParado = progresso.getAttribute('aria-valuenow');
    const logs = dialog.getByRole('log').textContent;

    await user.click(dialog.getByRole('button', { name: 'Cancelar execução' }));
    const repetir = dialog.getByRole('button', { name: 'Executar novamente' });
    expect(repetir).toHaveFocus();
    expect(
      dialog.queryByRole('button', { name: 'Cancelar execução' })
    ).not.toBeInTheDocument();
    expect(progresso).toHaveAttribute('aria-valuenow', valorParado);
    expect(
      dialog.getByText(
        /Execução cancelada pelo usuário\. Nenhum arquivo de saída foi gravado\./
      )
    ).toBeInTheDocument();
    expect(dialog.getByRole('status')).toHaveTextContent('Cancelado');
    expect(dialog.getByRole('status')).not.toHaveTextContent('concluído');
    const logCancelado = dialog.getByRole('log').textContent;
    await act(async () => {
      vi.advanceTimersByTime(30_000);
    });
    expect(progresso).toHaveAttribute('aria-valuenow', valorParado);
    expect(dialog.getByRole('log')).toHaveTextContent(logs ?? '');
    expect(dialog.getByRole('log').textContent).toBe(logCancelado);

    await iniciar(user, dialog);
    expect(progresso).toHaveAttribute('aria-valuenow', '0');
    await act(async () => {
      vi.advanceTimersByTime(30_000);
    });
    expect(progresso).toHaveAttribute('aria-valuenow', '100');
    expect(dialog.getByRole('status')).toHaveTextContent(
      'Processo finalizado com sucesso.'
    );
  });
});
