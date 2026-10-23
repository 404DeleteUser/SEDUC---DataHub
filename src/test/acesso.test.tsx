// Acesso com Supabase (F2): tela de login/cadastro/recuperação e o bloqueio do app
// sem conta. O serviço é simulado; os e-mails são fictícios.
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../App';
import TelaAcesso from '../components/acesso/TelaAcesso';
import * as conta from '../services/conta';
import type { Conta, EventoDeSessao } from '../services/conta';

vi.mock('../services/conta', () => ({
  contaConfigurada: vi.fn(() => true),
  contaAtual: vi.fn(async () => null),
  aoMudarSessao: vi.fn(() => () => {}),
  entrar: vi.fn(),
  cadastrar: vi.fn(),
  enviarRecuperacaoDeSenha: vi.fn(),
  definirNovaSenha: vi.fn(),
  sair: vi.fn(),
  carregarPerfil: vi.fn(async () => ({ nome: 'Pessoa Teste', foto: null })),
  salvarNome: vi.fn(),
  salvarFoto: vi.fn(),
  removerFoto: vi.fn(),
}));

const CONTA: Conta = { id: 'id-ficticio', email: 'pessoa.teste@edu.mt.gov.br' };

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(conta.contaConfigurada).mockReturnValue(true);
  vi.mocked(conta.contaAtual).mockResolvedValue(null);
  vi.mocked(conta.aoMudarSessao).mockReturnValue(() => {});
});

describe('tela de acesso', () => {
  it('recusa e-mail fora do domínio institucional sem chamar o servidor', async () => {
    const user = userEvent.setup();
    render(<TelaAcesso />);
    await user.type(screen.getByLabelText(/E-mail/), 'pessoa@gmail.com');
    await user.type(screen.getByLabelText(/^Senha/), 'senha-ficticia');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));
    // O subtítulo e o erro do campo trazem o mesmo texto.
    expect(
      screen.getAllByText('Use seu e-mail institucional (@edu.mt.gov.br).')
    ).toHaveLength(2);
    expect(screen.getByLabelText(/E-mail/)).toHaveFocus();
    expect(conta.entrar).not.toHaveBeenCalled();
  });

  it('mostra a mensagem de credenciais inválidas vinda do servidor', async () => {
    vi.mocked(conta.entrar).mockRejectedValue({ code: 'invalid_credentials' });
    const user = userEvent.setup();
    render(<TelaAcesso />);
    await user.type(screen.getByLabelText(/E-mail/), CONTA.email);
    await user.type(screen.getByLabelText(/^Senha/), 'senha-ficticia');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));
    expect(await screen.findByRole('alert')).not.toBeEmptyDOMElement();
    expect(conta.entrar).toHaveBeenCalledWith(CONTA.email, 'senha-ficticia');
  });

  it('no cadastro, confere as senhas e avisa para confirmar o e-mail', async () => {
    vi.mocked(conta.cadastrar).mockResolvedValue(null);
    const user = userEvent.setup();
    render(<TelaAcesso />);
    await user.click(screen.getByRole('button', { name: 'Criar conta' }));
    await user.type(screen.getByLabelText(/^Nome/), 'Pessoa Teste');
    await user.type(screen.getByLabelText(/E-mail/), CONTA.email);
    await user.type(screen.getByLabelText(/^Senha/), 'senha-ficticia');
    await user.type(screen.getByLabelText(/Confirme a senha/), 'outra-senha');
    const formulario = screen
      .getByRole('button', { name: 'Criar conta' })
      .closest('form')!;
    await user.click(
      within(formulario).getByRole('button', { name: 'Criar conta' })
    );
    expect(screen.getByText('As senhas não são iguais.')).toBeInTheDocument();
    expect(conta.cadastrar).not.toHaveBeenCalled();

    await user.clear(screen.getByLabelText(/Confirme a senha/));
    await user.type(
      screen.getByLabelText(/Confirme a senha/),
      'senha-ficticia'
    );
    await user.click(
      within(formulario).getByRole('button', { name: 'Criar conta' })
    );
    expect(
      await screen.findByText(/Enviamos um link de confirmação/)
    ).toBeInTheDocument();
    expect(conta.cadastrar).toHaveBeenCalledWith(
      CONTA.email,
      'senha-ficticia',
      'Pessoa Teste'
    );
    expect(
      screen.getByRole('heading', { name: 'Entrar no DataHub' })
    ).toBeInTheDocument();
  });

  it('na recuperação, envia o link sem revelar se a conta existe', async () => {
    vi.mocked(conta.enviarRecuperacaoDeSenha).mockResolvedValue();
    const user = userEvent.setup();
    render(<TelaAcesso />);
    await user.click(screen.getByRole('button', { name: 'Esqueci a senha' }));
    await user.type(screen.getByLabelText(/E-mail/), CONTA.email);
    await user.click(screen.getByRole('button', { name: 'Enviar link' }));
    expect(
      await screen.findByText(/Se existir uma conta com este e-mail/)
    ).toBeInTheDocument();
  });
});

describe('app com Supabase configurado', () => {
  it('sem sessão, mostra só a tela de acesso', async () => {
    render(<App />);
    expect(
      await screen.findByRole('heading', { name: 'Entrar no DataHub' })
    ).toBeInTheDocument();
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
  });

  it('com sessão, abre o app com o perfil da conta e sai de verdade', async () => {
    vi.mocked(conta.contaAtual).mockResolvedValue(CONTA);
    const user = userEvent.setup();
    render(<App />);
    const botaoPerfil = await screen.findByRole('button', { name: /^Perfil/ });
    await waitFor(() => expect(conta.carregarPerfil).toHaveBeenCalled());
    await user.click(botaoPerfil);
    expect(
      await screen.findByRole('heading', { level: 2, name: 'Pessoa Teste' })
    ).toBeInTheDocument();
    expect(screen.getByText(CONTA.email)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Sair da conta' }));
    expect(
      screen.getByText(/continuam salvos na sua conta/)
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Sair' }));
    expect(conta.sair).toHaveBeenCalled();
  });

  it('o link de recuperação abre a tela de nova senha', async () => {
    let avisar: (evento: EventoDeSessao, c: Conta | null) => void = () => {};
    vi.mocked(conta.aoMudarSessao).mockImplementation((cb) => {
      avisar = cb;
      return () => {};
    });
    render(<App />);
    await screen.findByRole('heading', { name: 'Entrar no DataHub' });
    avisar('recuperando-senha', CONTA);
    expect(
      await screen.findByRole('heading', { name: 'Criar nova senha' })
    ).toBeInTheDocument();
  });
});
