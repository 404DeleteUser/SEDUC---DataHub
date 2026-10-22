// Aceitação das mudanças de comportamento aprovadas (D3 em docs/ux-ui-modernization-plan.md §11).
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from '../App';

async function irPara(pagina: 'Início' | 'Processos') {
  const user = userEvent.setup();
  render(<App />);
  if (pagina === 'Processos') {
    const nav = screen.getByRole('navigation', { name: 'Navegação principal' });
    await user.click(within(nav).getByRole('button', { name: 'Processos' }));
  }
  return user;
}

describe.each(['Início', 'Processos'] as const)(
  'cards de processo em %s',
  (pagina) => {
    it('D3a: o card abre a execução sem iniciar', async () => {
      const user = await irPara(pagina);
      await user.click(
        screen.getByRole('button', { name: 'Executar Cruzamento SEAP x Folha' })
      );
      const dialog = screen.getByRole('dialog', {
        name: 'Cruzamento SEAP x Folha',
      });
      expect(within(dialog).getByRole('progressbar')).toHaveAttribute(
        'aria-valuenow',
        '0'
      );
      expect(
        within(dialog).getByRole('button', { name: /^Executar$/ })
      ).toBeEnabled();
    });

    it('D3a: editar fica só no lápis (uma ação de edição por card)', async () => {
      await irPara(pagina);
      expect(
        screen.getAllByRole('button', {
          name: 'Editar Cruzamento SEAP x Folha',
        })
      ).toHaveLength(1);
    });
  }
);

describe('modal de execução', () => {
  it('D3b: abre sem caminhos fictícios e exige as entradas antes de executar', async () => {
    const user = await irPara('Processos');
    await user.click(
      screen.getByRole('button', { name: 'Executar Cruzamento SEAP x Folha' })
    );
    const dialog = screen.getByRole('dialog');
    expect(
      within(dialog).queryByDisplayValue(/C:\\Dados/)
    ).not.toBeInTheDocument();
    expect(within(dialog).getByLabelText('Planilha principal')).toHaveValue('');
    await user.click(
      within(dialog).getByRole('button', { name: /^Executar$/ })
    );
    expect(within(dialog).getByRole('alert')).toHaveTextContent(
      /planilha principal/i
    );
    expect(within(dialog).getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '0'
    );
  });

  it('a região de log é focável por teclado', async () => {
    const user = await irPara('Processos');
    await user.click(
      screen.getByRole('button', { name: 'Executar Cruzamento SEAP x Folha' })
    );
    expect(within(screen.getByRole('dialog')).getByRole('log')).toHaveAttribute(
      'tabindex',
      '0'
    );
  });
});

describe('sidebar', () => {
  it('D3d: não exibe um perfil fictício como real', async () => {
    await irPara('Início');
    expect(screen.queryByText('Davi Silva')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Perfil/ })).toBeDisabled();
  });
});

describe('avisos de simulação', () => {
  it('não usa o jargão "Mock" na interface', async () => {
    await irPara('Processos');
    expect(screen.queryByText(/^Mock$/)).not.toBeInTheDocument();
  });
});
