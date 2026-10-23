// Entrada com Supabase Auth: o cliente do Supabase é simulado; os e-mails são fictícios.
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Raiz from '../Raiz';
import type { LinkDeAcesso } from '../domain/entrada';
import { CHAVE_MANTER_CONECTADO } from '../services/armazenamentoSessao';

type Sessao = { user: { id: string; email: string } } | null;
type Ouvinte = (evento: string, sessao: Sessao) => void;

const sim = vi.hoisted(() => ({
  link: null as LinkDeAcesso,
  ouvintes: [] as Ouvinte[],
}));

const auth = vi.hoisted(() => ({
  getSession: vi.fn(),
  onAuthStateChange: vi.fn(),
  signInWithPassword: vi.fn(),
  resetPasswordForEmail: vi.fn(),
  updateUser: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock('../services/supabase', () => {
  const consulta = {
    select: () => consulta,
    update: () => consulta,
    eq: () => consulta,
    maybeSingle: async () => ({
      data: { nome: 'Pessoa Teste', foto_caminho: null },
      error: null,
    }),
  };
  return {
    get linkDeAcesso() {
      return sim.link;
    },
    acessoSimulado: false,
    supabase: { auth, from: () => consulta },
  };
});

const EMAIL = 'pessoa.teste@edu.mt.gov.br';
const SESSAO: Sessao = { user: { id: 'id-ficticio', email: EMAIL } };

function emitir(evento: string, sessao: Sessao) {
  act(() => sim.ouvintes.forEach((ouvir) => ouvir(evento, sessao)));
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
  sim.link = null;
  sim.ouvintes = [];
  auth.getSession.mockResolvedValue({ data: { session: null } });
  auth.onAuthStateChange.mockImplementation((ouvir: Ouvinte) => {
    sim.ouvintes.push(ouvir);
    return { data: { subscription: { unsubscribe: vi.fn() } } };
  });
  auth.signOut.mockResolvedValue({ error: null });
});

async function abrirEntrada() {
  const user = userEvent.setup();
  render(<Raiz />);
  await screen.findByRole('heading', { level: 1, name: 'Entrar' });
  return user;
}

const campoEmail = () => screen.getByLabelText(/^E-mail/);
const campoSenha = () => screen.getByLabelText(/^Senha/);
const botaoEntrar = () =>
  screen.getByRole('button', { name: /Entrar|Entrando/ });

describe('abertura', () => {
  it('enquanto lê a sessão, mostra só o fundo', () => {
    auth.getSession.mockReturnValue(new Promise(() => {}));
    const { container } = render(<Raiz />);
    expect(container.querySelector('[aria-busy="true"]')).not.toBeNull();
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('sem sessão, mostra a Entrada com foco no e-mail e sem registro', async () => {
    await abrirEntrada();
    expect(campoEmail()).toHaveFocus();
    expect(campoEmail()).toHaveAttribute('autocomplete', 'username');
    expect(campoSenha()).toHaveAttribute('autocomplete', 'current-password');
    expect(
      screen.getByRole('checkbox', { name: 'Manter conectado' })
    ).toBeChecked();
    expect(screen.queryByText(/criar conta|cadastr|registr/i)).toBeNull();
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
  });

  it('com sessão, abre direto o app', async () => {
    auth.getSession.mockResolvedValue({ data: { session: SESSAO } });
    render(<Raiz />);
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Início' })
    ).toBeInTheDocument();
  });
});

describe('validação na tela', () => {
  it('recusa domínio parecido e leva o foco ao campo', async () => {
    const user = await abrirEntrada();
    await user.type(campoEmail(), 'pessoa@seduc.mt.gov.br');
    await user.type(campoSenha(), 'senha-ficticia');
    await user.click(botaoEntrar());
    expect(
      screen.getByText('Use seu e-mail @edu.mt.gov.br.')
    ).toBeInTheDocument();
    expect(campoEmail()).toHaveAttribute('aria-invalid', 'true');
    expect(campoEmail()).toHaveFocus();
    expect(auth.signInWithPassword).not.toHaveBeenCalled();
  });

  it('pede a senha quando está vazia', async () => {
    const user = await abrirEntrada();
    await user.type(campoEmail(), EMAIL);
    await user.click(botaoEntrar());
    expect(screen.getByText('Informe a senha.')).toBeInTheDocument();
    expect(campoSenha()).toHaveFocus();
  });
});

describe('entrar', () => {
  it('normaliza o e-mail, entra e mostra o app', async () => {
    auth.signInWithPassword.mockResolvedValue({
      data: { user: SESSAO!.user },
      error: null,
    });
    const user = await abrirEntrada();
    await user.type(campoEmail(), '  Pessoa.Teste@EDU.mt.gov.br ');
    await user.type(campoSenha(), 'senha-ficticia');
    await user.click(botaoEntrar());
    expect(auth.signInWithPassword).toHaveBeenCalledWith({
      email: EMAIL,
      password: 'senha-ficticia',
    });
    expect(localStorage.getItem(CHAVE_MANTER_CONECTADO)).toBe('sim');

    emitir('SIGNED_IN', SESSAO);
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Início' })
    ).toBeInTheDocument();
  });

  it('enquanto espera, mostra "Entrando…" e trava os campos', async () => {
    auth.signInWithPassword.mockReturnValue(new Promise(() => {}));
    const user = await abrirEntrada();
    await user.type(campoEmail(), EMAIL);
    await user.type(campoSenha(), 'senha-ficticia');
    await user.click(
      screen.getByRole('checkbox', { name: 'Manter conectado' })
    );
    await user.click(botaoEntrar());
    expect(screen.getByRole('button', { name: 'Entrando…' })).toBeDisabled();
    expect(campoEmail()).toHaveAttribute('readonly');
    expect(campoSenha()).toHaveAttribute('readonly');
    expect(localStorage.getItem(CHAVE_MANTER_CONECTADO)).toBe('nao');
  });

  it('credencial errada mostra só a mensagem genérica', async () => {
    auth.signInWithPassword.mockResolvedValue({
      data: { user: null },
      error: {
        code: 'invalid_credentials',
        status: 400,
        message: 'Invalid login credentials',
      },
    });
    const user = await abrirEntrada();
    await user.type(campoEmail(), EMAIL);
    await user.type(campoSenha(), 'senha-errada');
    await user.click(botaoEntrar());
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'E-mail ou senha incorretos.'
    );
    expect(screen.queryByText(/Invalid login/)).toBeNull();
    expect(botaoEntrar()).toBeEnabled();
  });

  it('falha de rede mostra a mensagem de serviço', async () => {
    auth.signInWithPassword.mockResolvedValue({
      data: { user: null },
      error: {
        name: 'AuthRetryableFetchError',
        status: 0,
        message: 'Failed to fetch',
      },
    });
    const user = await abrirEntrada();
    await user.type(campoEmail(), EMAIL);
    await user.type(campoSenha(), 'senha-ficticia');
    await user.click(botaoEntrar());
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível entrar agora. Tente de novo em instantes.'
    );
    expect(screen.queryByText(/Failed to fetch/)).toBeNull();
  });
});

describe('esqueci a senha', () => {
  it('envia o link para /redefinir-senha e responde sempre igual', async () => {
    auth.resetPasswordForEmail.mockResolvedValue({ data: {}, error: null });
    const user = await abrirEntrada();
    const alternar = screen.getByRole('button', { name: 'Esqueci a senha' });
    expect(alternar).toHaveAttribute('aria-expanded', 'false');
    await user.click(alternar);
    expect(alternar).toHaveAttribute('aria-expanded', 'true');

    await user.click(screen.getByRole('button', { name: 'Enviar link' }));
    expect(screen.getByText('Informe o e-mail.')).toBeInTheDocument();
    expect(auth.resetPasswordForEmail).not.toHaveBeenCalled();

    await user.type(campoEmail(), EMAIL);
    await user.click(screen.getByRole('button', { name: 'Enviar link' }));
    expect(auth.resetPasswordForEmail).toHaveBeenCalledWith(EMAIL, {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });
    expect(
      await screen.findByText(
        'Se esse e-mail tiver acesso, você vai receber um link para criar uma nova senha.'
      )
    ).toBeInTheDocument();
  });
});

describe('sair da conta', () => {
  it('encerra a sessão e volta para a Entrada', async () => {
    auth.getSession.mockResolvedValue({ data: { session: SESSAO } });
    const user = userEvent.setup();
    render(<Raiz />);
    await user.click(await screen.findByRole('button', { name: /^Perfil/ }));
    expect(await screen.findByText(EMAIL)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Sair da conta' }));
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Sair' })
    );
    expect(auth.signOut).toHaveBeenCalled();
    emitir('SIGNED_OUT', null);
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Entrar' })
    ).toBeInTheDocument();
  });
});

describe('/redefinir-senha', () => {
  it('pelo link de recuperação, salva a nova senha e abre o app', async () => {
    sim.link = 'recuperacao';
    auth.getSession.mockResolvedValue({ data: { session: SESSAO } });
    auth.updateUser.mockResolvedValue({ data: {}, error: null });
    const user = userEvent.setup();
    render(<Raiz />);
    await screen.findByRole('heading', { level: 1, name: 'Criar nova senha' });

    await user.type(screen.getByLabelText(/^Nova senha/), 'senha-ficticia');
    await user.type(screen.getByLabelText(/^Confirmar senha/), 'outra-senha');
    await user.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(screen.getByText('As senhas não são iguais.')).toBeInTheDocument();
    expect(auth.updateUser).not.toHaveBeenCalled();

    await user.clear(screen.getByLabelText(/^Confirmar senha/));
    await user.type(
      screen.getByLabelText(/^Confirmar senha/),
      'senha-ficticia'
    );
    await user.click(screen.getByRole('button', { name: 'Salvar' }));
    expect(auth.updateUser).toHaveBeenCalledWith({
      password: 'senha-ficticia',
    });
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Início' })
    ).toBeInTheDocument();
  });

  it('pelo convite, pede para criar a senha', async () => {
    sim.link = 'convite';
    auth.getSession.mockResolvedValue({ data: { session: SESSAO } });
    render(<Raiz />);
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Criar sua senha' })
    ).toBeInTheDocument();
  });

  it('com link vencido, avisa e volta para a Entrada', async () => {
    sim.link = 'invalido';
    const user = userEvent.setup();
    render(<Raiz />);
    await screen.findByRole('heading', { level: 1, name: 'Link vencido' });
    await user.click(
      screen.getByRole('button', { name: 'Voltar para a entrada' })
    );
    expect(
      screen.getByRole('heading', { level: 1, name: 'Entrar' })
    ).toBeInTheDocument();
  });
});
