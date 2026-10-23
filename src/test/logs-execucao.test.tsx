import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from '../App';

const clipboardOriginal = Object.getOwnPropertyDescriptor(
  navigator,
  'clipboard'
);

afterEach(() => {
  if (clipboardOriginal)
    Object.defineProperty(navigator, 'clipboard', clipboardOriginal);
  else Reflect.deleteProperty(navigator, 'clipboard');
});

async function abrir() {
  const user = userEvent.setup();
  render(<App />);
  const link = screen.getByRole('button', { name: 'Logs de Execução' });
  expect(link).toBeEnabled();
  await user.click(link);
  return user;
}

describe('Logs de Execução', () => {
  it('abre a página e exibe a lista ordenada e o contador', async () => {
    await abrir();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Logs de Execução' })
    ).toBeInTheDocument();
    expect(screen.getAllByRole('status')[0]).toHaveTextContent('9 execuções');
    const lista = screen.getByRole('list', { name: 'Execuções' });
    expect(within(lista).getAllByRole('button')).toHaveLength(9);
    expect(within(lista).getAllByRole('button')[0]).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    const painel = screen.getByRole('region', {
      name: /Cruzamento SEAP x Folha/,
    });
    expect(within(painel).getAllByText('Em andamento')[0]).toBeInTheDocument();
    expect(
      screen.getByText('A execução ainda está em andamento.')
    ).toBeInTheDocument();
  });

  it('busca sem acentos e filtra erros com detalhe', async () => {
    const user = await abrir();
    const busca = screen.getByRole('searchbox', { name: 'Buscar execução' });
    await user.type(busca, 'vigência');
    expect(screen.getAllByRole('status')[0]).toHaveTextContent('2 execuções');
    await user.clear(busca);
    await user.type(busca, 'vigencia');
    expect(screen.getAllByRole('status')[0]).toHaveTextContent('2 execuções');
    await user.clear(busca);
    await user.selectOptions(screen.getByLabelText('Status'), 'erro');
    expect(screen.getAllByRole('status')[0]).toHaveTextContent('2 execuções');
    await user.click(screen.getByRole('button', { name: /Lotação por DRE/ }));
    expect(
      screen.getByText('A coluna DRE não existe na aba Lotação.')
    ).toBeInTheDocument();
    expect(screen.getByText('Na etapa 2')).toBeInTheDocument();
  });

  it('exibe avisos e não revela valores do dicionário', async () => {
    const user = await abrir();
    await user.click(
      screen.getAllByRole('button', { name: /Verificação de Vigência/ })[0]
    );
    expect(
      screen.getByText('27 contratos sem data de término')
    ).toBeInTheDocument();
    expect(screen.getByText(/só a primeira aba foi lida/)).toBeInTheDocument();
    expect(screen.getByText('Valores para manter')).toBeInTheDocument();
    expect(screen.getByText('1 valor')).toBeInTheDocument();
    expect(screen.queryByText('ativo')).not.toBeInTheDocument();
  });

  it('limpa filtros e copia caminho com sucesso ou falha', async () => {
    const user = await abrir();
    await user.type(
      screen.getByRole('searchbox', { name: 'Buscar execução' }),
      'xyz'
    );
    expect(
      screen.getByText('Nenhuma execução encontrada.')
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Limpar filtros' }));
    expect(screen.getAllByRole('status')[0]).toHaveTextContent('9 execuções');
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
    await user.click(
      screen.getByRole('button', { name: 'Copiar caminho do log' })
    );
    expect(screen.getAllByRole('status')[1]).toHaveTextContent(
      'Caminho do log copiado.'
    );
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: vi.fn().mockRejectedValue(new Error('negado')) },
    });
    await user.click(
      screen.getByRole('button', { name: 'Copiar caminho do log' })
    );
    expect(screen.getAllByRole('status')[1]).toHaveTextContent(
      'Não foi possível copiar o caminho do log.'
    );
  });

  it('indica execução cancelada e etapa não executada', async () => {
    const user = await abrir();
    await user.click(screen.getByRole('button', { name: /Mesclar Planilhas/ }));
    const detalhe = screen.getByRole('region', { name: 'Mesclar Planilhas' });
    expect(within(detalhe).getByText('Cancelado')).toBeInTheDocument();
    expect(within(detalhe).getByText('Não executada')).toBeInTheDocument();
  });
});
