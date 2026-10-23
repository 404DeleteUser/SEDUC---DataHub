// Acesso simulado (temporário): a Entrada aparece, mas qualquer e-mail e senha entram.
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Raiz from '../Raiz';

const sim = vi.hoisted(() => ({ link: null as string | null }));

vi.mock('../services/supabase', () => ({
  acessoSimulado: true,
  supabase: null,
  get linkDeAcesso() {
    return sim.link;
  },
}));

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
  sim.link = null;
});

describe('acesso simulado', () => {
  it('entra sem validação, mostra o app e "Sair" volta para a Entrada', async () => {
    const user = userEvent.setup();
    render(<Raiz />);
    await screen.findByRole('heading', { level: 1, name: 'Entrar' });
    expect(screen.getByText('Simulação')).toBeInTheDocument();

    // Campos vazios: sem validação, entra do mesmo jeito.
    await user.click(screen.getByRole('button', { name: 'Entrar' }));
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Início' })
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /^Perfil/ }));
    await user.click(screen.getByRole('button', { name: 'Sair da conta' }));
    expect(
      screen.getByText(/continuam salvos neste computador/)
    ).toBeInTheDocument();
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Sair' })
    );
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Entrar' })
    ).toBeInTheDocument();
  });

  it('"Esqueci a senha" mostra a mensagem neutra sem enviar nada', async () => {
    const user = userEvent.setup();
    render(<Raiz />);
    await screen.findByRole('heading', { level: 1, name: 'Entrar' });
    await user.click(screen.getByRole('button', { name: 'Esqueci a senha' }));
    await user.click(screen.getByRole('button', { name: 'Enviar link' }));
    expect(
      await screen.findByText(/Se esse e-mail tiver acesso/)
    ).toBeInTheDocument();
  });

  it('/redefinir-senha salva sem validar e abre o app', async () => {
    sim.link = 'recuperacao';
    const user = userEvent.setup();
    render(<Raiz />);
    await screen.findByRole('heading', { level: 1, name: 'Criar nova senha' });
    await user.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Início' })
    ).toBeInTheDocument();
  });

  it('a sessão da aba continua ao recarregar', async () => {
    sessionStorage.setItem('datahub-sessao-simulada', 'nome@edu.mt.gov.br');
    render(<Raiz />);
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Início' })
    ).toBeInTheDocument();
  });
});
