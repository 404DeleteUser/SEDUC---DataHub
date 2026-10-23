// Tela de Perfil: foto, nome (salvos neste computador no modo local) e dados de exemplo.
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from '../App';
import { CHAVE_PERFIL, reduzirFoto } from '../utils/perfilLocal';

vi.mock('../utils/perfilLocal', async (original) => ({
  ...(await original<typeof import('../utils/perfilLocal')>()),
  // jsdom não desenha em canvas: a redução da foto é coberta no e2e.
  reduzirFoto: vi.fn(async () => 'data:image/jpeg;base64,FOTO'),
}));

afterEach(() => {
  vi.mocked(reduzirFoto).mockClear();
});

async function abrirPerfil(opcoes?: Parameters<typeof userEvent.setup>[0]) {
  const user = userEvent.setup(opcoes);
  render(<App />);
  await user.click(screen.getByRole('button', { name: /^Perfil/ }));
  return user;
}

const sidebar = () => screen.getByRole('complementary');

describe('sidebar', () => {
  it('não tem mais Configurações e o Perfil leva à tela', async () => {
    await abrirPerfil();
    expect(
      within(sidebar()).queryByRole('button', { name: /Configurações/ })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Perfil' })
    ).toBeInTheDocument();
    expect(
      within(sidebar()).getByRole('button', { name: 'Perfil' })
    ).toHaveAttribute('aria-current', 'page');
  });
});

describe('tela de Perfil', () => {
  it('mostra os dados funcionais como Simulação', async () => {
    await abrirPerfil();
    expect(screen.getByText('Nome não definido')).toBeInTheDocument();
    const dados = screen.getByRole('region', { name: 'Dados funcionais' });
    expect(within(dados).getByText('Simulação')).toBeInTheDocument();
    for (const rotulo of ['Matrícula', 'Vínculo', 'E-mail institucional']) {
      expect(within(dados).getByText(rotulo)).toBeInTheDocument();
    }
    expect(within(dados).getByText(/@edu\.mt\.gov\.br$/)).toBeInTheDocument();
  });

  it('define o nome, valida e guarda neste computador', async () => {
    const user = await abrirPerfil();
    await user.click(screen.getByRole('button', { name: 'Definir nome' }));
    const campo = screen.getByRole('textbox', { name: 'Nome' });
    expect(campo).toHaveFocus();
    await user.type(campo, 'Ana 2');
    await user.click(screen.getByRole('button', { name: 'Salvar nome' }));
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Use só letras, espaços, hífen ou apóstrofo.'
    );

    await user.clear(campo);
    await user.type(campo, '  Ana   Clara Teste ');
    await user.click(screen.getByRole('button', { name: 'Salvar nome' }));
    expect(
      screen.getByRole('heading', { level: 2, name: 'Ana Clara Teste' })
    ).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Nome atualizado.');
    expect(
      within(sidebar()).getByRole('button', { name: 'Perfil: Ana Clara Teste' })
    ).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(CHAVE_PERFIL)!).nome).toBe(
      'Ana Clara Teste'
    );
  });

  it('Esc cancela a edição do nome', async () => {
    const user = await abrirPerfil();
    await user.click(screen.getByRole('button', { name: 'Definir nome' }));
    await user.type(screen.getByRole('textbox', { name: 'Nome' }), 'Beto');
    await user.keyboard('{Escape}');
    expect(screen.getByText('Nome não definido')).toBeInTheDocument();
    expect(localStorage.getItem(CHAVE_PERFIL)).toBeNull();
  });

  it('troca e remove a foto; recusa formato inválido', async () => {
    // Sem o filtro do explorador: a pessoa pode escolher "Todos os arquivos".
    const user = await abrirPerfil({ applyAccept: false });
    const campoFoto = screen.getByLabelText('Trocar foto');
    await user.upload(
      campoFoto,
      new File(['gif'], 'foto.gif', { type: 'image/gif' })
    );
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Use uma imagem JPG, PNG ou WebP.'
    );

    await user.upload(
      campoFoto,
      new File(['png'], 'foto.png', { type: 'image/png' })
    );
    expect(
      await screen.findByRole('img', { name: 'Sua foto de perfil' })
    ).toHaveAttribute('src', 'data:image/jpeg;base64,FOTO');
    expect(sidebar().querySelector('.profile-avatar img')).not.toBeNull();

    await user.click(screen.getByRole('button', { name: 'Remover foto' }));
    expect(
      screen.queryByRole('img', { name: 'Sua foto de perfil' })
    ).not.toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(CHAVE_PERFIL)!).foto).toBeNull();
  });
});

describe('sair da conta', () => {
  it('no modo local (sem Supabase) não há sessão para encerrar', async () => {
    await abrirPerfil();
    expect(
      screen.queryByRole('button', { name: 'Sair da conta' })
    ).not.toBeInTheDocument();
  });
});
