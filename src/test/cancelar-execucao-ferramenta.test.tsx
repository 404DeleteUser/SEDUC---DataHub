import { act, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from '../App';
import { useExecucaoSimulada } from '../components/ferramentas/ExecucaoSimulada';

vi.mock('../utils/explorador', () => ({
  escolherArquivo: vi.fn(async () => ({
    nome: 'dados.csv',
    caminho: 'C:\\dados.csv',
    rotulo: 'C:\\dados.csv',
  })),
  escolherPasta: vi.fn(async () => ({
    nome: 'Saida',
    caminho: 'C:\\Saida',
    rotulo: 'C:\\Saida',
  })),
  escolherDestino: vi.fn(async () => ({
    nome: 'resultado.xlsx',
    caminho: 'C:\\resultado.xlsx',
    rotulo: 'C:\\resultado.xlsx',
  })),
}));

afterEach(() => vi.useRealTimers());

describe('cancelamento da simulação de ferramenta', () => {
  it('cancela, congela o progresso, devolve o foco e permite executar de novo', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Ferramentas' }));
    await user.click(screen.getByRole('button', { name: /^Dividir Por/ }));
    const entrada = screen.getByLabelText(/Arquivo de entrada/);
    await user.upload(
      entrada,
      new File(['Tipo,Nome\nA,Ana\nB,Bia'], 'dados.csv', { type: 'text/csv' })
    );
    await screen.findByRole('option', { name: 'Tipo' });
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Coluna' }),
      'Tipo'
    );
    await user.type(
      screen.getByLabelText(/Nome do arquivo de saída/),
      'saida.xlsx'
    );
    const executar = screen.getByRole('button', { name: /^Executar$/ });
    await user.click(executar);
    const cancelar = await screen.findByRole('button', {
      name: 'Cancelar execução',
    });
    await act(async () => {
      vi.advanceTimersByTime(1400);
    });
    const barra = screen.getByRole('progressbar');
    const progresso = barra.getAttribute('aria-valuenow');
    await user.click(cancelar);
    expect(
      await screen.findByRole('button', { name: 'Executar' })
    ).toHaveFocus();
    expect(
      screen.queryByRole('button', { name: 'Cancelar execução' })
    ).not.toBeInTheDocument();
    expect(barra).toHaveAttribute('aria-valuenow', progresso);
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });
    expect(barra).toHaveAttribute('aria-valuenow', progresso);
    expect(screen.getByRole('log')).toHaveTextContent(
      '[simulação] Execução cancelada pelo usuário. Nenhum arquivo de saída foi gravado.'
    );
    expect(
      screen.getByText('Cancelado: a execução foi interrompida.')
    ).toBeInTheDocument();
    expect(screen.queryByText(/concluída/i)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Executar' }));
    await act(async () => {
      vi.advanceTimersByTime(20000);
    });
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '100'
    );
    expect(
      document.querySelector('.ferramenta-execucao__topo p')!
    ).toHaveTextContent(/conclu/i);
  });

  it('o hook limpa cancelado ao iniciar uma nova simulação', () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const { result } = renderHook(() => useExecucaoSimulada());
    act(() => result.current.iniciar(['um', 'dois', 'três']));
    act(() => result.current.cancelar());
    expect(result.current.cancelado).toBe(true);
    expect(result.current.executando).toBe(false);
    act(() => result.current.iniciar(['novo']));
    expect(result.current.cancelado).toBe(false);
    expect(result.current.progresso).toBe(0);
    act(() => vi.advanceTimersByTime(700));
    expect(result.current.progresso).toBe(100);
  });
});
