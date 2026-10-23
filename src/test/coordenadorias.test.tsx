// Página Coordenadorias e Equipes: organograma em caixas, busca e seleção.
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import App from '../App';

async function abrir() {
  const user = userEvent.setup();
  render(<App />);
  await user.click(
    screen.getByRole('button', { name: 'Coordenadorias e Equipes' })
  );
  return user;
}

describe('Coordenadorias e Equipes', () => {
  it('mostra uma caixa por setor e a fonte do decreto', async () => {
    await abrir();
    const organograma = screen.getByRole('region', { name: 'Organograma' });
    expect(within(organograma).getAllByRole('button')).toHaveLength(347);
    expect(screen.getByText(/Decreto nº 2\.236/)).toBeInTheDocument();
  });

  it('a busca ignora acento, seleciona o setor e limpa o campo', async () => {
    const user = await abrir();
    const campo = screen.getByRole('searchbox', { name: 'Buscar setor' });
    await user.type(campo, 'camara de educacao basica');
    await user.click(
      within(
        screen.getByRole('list', { name: 'Resultados da busca' })
      ).getByRole('button', { name: /Câmara de Educação Básica/ })
    );

    expect(campo).toHaveValue('');
    expect(
      screen.getByText(/subordinado a Coordenadoria de Apoio às Câmaras/)
    ).toBeInTheDocument();
  });

  it('avisa quando a busca não encontra nada', async () => {
    const user = await abrir();
    await user.type(
      screen.getByRole('searchbox', { name: 'Buscar setor' }),
      'xyzw'
    );
    expect(screen.getByText('Nenhum setor encontrado.')).toBeInTheDocument();
  });

  it('clicar numa caixa seleciona o setor e indica a vinculação', async () => {
    const user = await abrir();
    const organograma = screen.getByRole('region', { name: 'Organograma' });
    await user.click(
      within(organograma).getByRole('button', {
        name: 'Diretoria Regional de Educação de Sinop',
      })
    );

    expect(
      within(organograma).getByRole('button', {
        name: 'Diretoria Regional de Educação de Sinop',
        pressed: true,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /vinculado a Gabinete do Secretário Adjunto de Gestão Regional/
      )
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Limpar seleção' }));
    expect(screen.getByText(/347 setores/)).toBeInTheDocument();
  });

  it('tem controles de zoom', async () => {
    await abrir();
    const zoom = screen.getByRole('group', { name: 'Zoom' });
    for (const rotulo of [
      'Aumentar zoom',
      'Diminuir zoom',
      'Ajustar à tela',
      'Voltar ao topo',
    ]) {
      expect(
        within(zoom).getByRole('button', { name: rotulo })
      ).toBeInTheDocument();
    }
  });
});
