import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from '../App';
import { abrirLinkExterno } from '../utils/abrirLink';

vi.mock('../utils/abrirLink', () => ({ abrirLinkExterno: vi.fn() }));

afterEach(() => {
  vi.mocked(abrirLinkExterno).mockReset();
  vi.restoreAllMocks();
});

async function abrirPagina() {
  const user = userEvent.setup();
  render(<App />);
  await user.click(
    screen.getByRole('button', { name: 'Sites Institucionais' })
  );
  return user;
}

describe('Sites Institucionais', () => {
  it('lista os 12 sites agrupados por órgão', async () => {
    await abrirPagina();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Sites Institucionais' })
    ).toBeInTheDocument();
    for (const orgao of [
      'SEDUC-MT',
      'SEPLAG-MT',
      'Governo de MT',
      'Parceiros',
    ]) {
      expect(
        screen.getByRole('heading', { level: 2, name: orgao })
      ).toBeInTheDocument();
    }
    expect(
      screen.getAllByRole('button', { name: /abre no navegador/ })
    ).toHaveLength(12);
  });

  it('abre o site escolhido pelo utilitário de link externo', async () => {
    const user = await abrirPagina();
    await user.click(screen.getByRole('button', { name: /^FIPLAN/ }));
    expect(abrirLinkExterno).toHaveBeenCalledWith(
      'https://www.fiplan.mt.gov.br/Fiplan.jsp'
    );
  });

  it('avisa quando não consegue abrir', async () => {
    vi.mocked(abrirLinkExterno).mockRejectedValueOnce(new Error('falhou'));
    const user = await abrirPagina();
    await user.click(screen.getByRole('button', { name: /^EduHub/ }));
    expect(screen.getByRole('status')).toHaveTextContent(
      'Não foi possível abrir EduHub. Copie o link e cole no navegador.'
    );
  });

  it('busca sem diferenciar acento e mostra quando nada é encontrado', async () => {
    const user = await abrirPagina();
    const busca = screen.getByRole('searchbox', { name: 'Buscar site' });
    await user.type(busca, 'servico');
    const resultados = screen.getAllByRole('button', {
      name: /abre no navegador/,
    });
    expect(
      resultados.map(
        (botao) =>
          within(botao).getByText(/./, { selector: 'strong' }).textContent
      )
    ).toEqual(['Portal de Serviços SEDUC', 'Portal do Servidor']);
    await user.clear(busca);
    await user.type(busca, 'xyz');
    expect(screen.getByText('Nenhum site encontrado.')).toBeInTheDocument();
  });

  it('copia o link e marca o site sem HTTPS', async () => {
    const user = await abrirPagina();
    const escrever = vi
      .spyOn(navigator.clipboard, 'writeText')
      .mockResolvedValue(undefined);
    await user.click(
      screen.getByRole('button', { name: 'Copiar link de SIGPAS' })
    );
    expect(escrever).toHaveBeenCalledWith('https://sigpas.seplag.mt.gov.br/');
    expect(screen.getByRole('status')).toHaveTextContent(
      'Link de SIGPAS copiado.'
    );
    expect(screen.getAllByText('Sem HTTPS')).toHaveLength(1);
  });
});
