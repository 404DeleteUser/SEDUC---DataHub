import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { parametrosPadrao } from '../../domain/ferramentas';
import type {
  FerramentaId,
  ParametrosFerramenta,
} from '../../types/ferramenta';
import { FormularioFerramenta } from './FormularioFerramenta';

function Controlado({
  id,
  colunas = ['Tipo', 'CPF', 'Nome'],
  espiao,
  ...resto
}: {
  id: FerramentaId;
  colunas?: string[];
  espiao?: (p: ParametrosFerramenta) => void;
} & Partial<Parameters<typeof FormularioFerramenta>[0]>) {
  const [parametros, setParametros] = useState(parametrosPadrao(id));
  return (
    <FormularioFerramenta
      idBase="teste"
      colunas={colunas}
      {...resto}
      parametros={parametros}
      onChange={(p) => {
        setParametros(p);
        espiao?.(p);
      }}
    />
  );
}

describe('Zebrar Planilha', () => {
  it('edita as três cores pelo código hexadecimal', async () => {
    const espiao = vi.fn();
    render(<Controlado id="zebrar-planilha" espiao={espiao} />);
    const cabecalho = screen.getByRole('textbox', { name: 'Cor do cabeçalho' });
    await userEvent.clear(cabecalho);
    await userEvent.type(cabecalho, '#ff0000');
    expect(espiao).toHaveBeenLastCalledWith(
      expect.objectContaining({ corCabecalho: '#ff0000' })
    );
    expect(
      screen.getByRole('textbox', { name: 'Cor das linhas ímpares' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('textbox', { name: 'Cor das linhas pares' })
    ).toBeInTheDocument();
  });
});

describe('Eliminar Duplicatas', () => {
  it('escolhe colunas-chave; a linha que fica é sorteada, sem opção', async () => {
    const espiao = vi.fn();
    render(<Controlado id="eliminar-duplicatas" espiao={espiao} />);
    await userEvent.click(screen.getByRole('button', { name: 'CPF' }));
    expect(espiao).toHaveBeenLastCalledWith(
      expect.objectContaining({ colunasChave: ['CPF'] })
    );
    expect(screen.queryByText(/Qual ocorrência manter/)).toBeNull();
    expect(screen.getByText(/sorteia uma linha/)).toBeInTheDocument();
  });

  it('sem arquivo, explica de onde vêm as colunas', () => {
    render(<Controlado id="eliminar-duplicatas" colunas={[]} />);
    expect(
      screen.getByText(/Selecione um arquivo para listar as colunas/)
    ).toBeInTheDocument();
  });
});

describe('Dicionário', () => {
  it('escolhe coluna, modo e adiciona/remove valores', async () => {
    const espiao = vi.fn();
    render(<Controlado id="dicionario" espiao={espiao} />);
    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: 'Coluna' }),
      'Tipo'
    );
    await userEvent.click(screen.getByRole('button', { name: /Valor exato/ }));
    await userEvent.type(
      screen.getByRole('textbox', { name: 'Valor 1' }),
      'celular'
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Adicionar valor' })
    );
    await userEvent.type(
      screen.getByRole('textbox', { name: 'Valor 2' }),
      'ipad'
    );
    expect(espiao).toHaveBeenLastCalledWith({
      ferramentaId: 'dicionario',
      coluna: 'Tipo',
      modo: 'exato',
      valores: ['celular', 'ipad'],
    });
    await userEvent.click(
      screen.getByRole('button', { name: 'Remover valor 1' })
    );
    expect(espiao).toHaveBeenLastCalledWith(
      expect.objectContaining({ valores: ['ipad'] })
    );
  });

  it('o último valor não pode ser removido', () => {
    render(<Controlado id="dicionario" />);
    expect(
      screen.getByRole('button', { name: 'Remover valor 1' })
    ).toBeDisabled();
  });
});

describe('Mesclar Planilhas', () => {
  it('alterna entre empilhar e uma aba por arquivo', async () => {
    const espiao = vi.fn();
    render(<Controlado id="mesclar-planilhas" espiao={espiao} />);
    expect(
      screen.getByRole('button', { name: /Empilhar linhas/ })
    ).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(
      screen.getByRole('button', { name: /Uma aba por arquivo/ })
    );
    expect(espiao).toHaveBeenLastCalledWith({
      ferramentaId: 'mesclar-planilhas',
      modo: 'abas',
    });
  });
});

describe('Dividir Por', () => {
  it('mostra a prévia das abas com a consolidada primeiro', () => {
    render(
      <Controlado
        id="dividir-por"
        previaAbas={[
          { nome: 'Celular', linhas: 2 },
          { nome: 'Outros', linhas: 1 },
        ]}
      />
    );
    const previa = screen.getByRole('list', { name: 'Abas que serão criadas' });
    const itens = within(previa)
      .getAllByRole('listitem')
      .map((item) => item.textContent);
    expect(itens[0]).toMatch(/Consolidada/);
    expect(itens[1]).toMatch(/Celular.*2 linhas/);
    expect(itens[2]).toMatch(/Outros.*1 linha/);
  });
});

describe('erros', () => {
  it('liga a mensagem de erro ao campo correspondente', () => {
    render(
      <Controlado
        id="dividir-por"
        erros={[
          {
            campo: 'coluna',
            mensagem: 'Escolha a coluna usada para criar as abas.',
          },
        ]}
      />
    );
    expect(screen.getByRole('combobox', { name: 'Coluna' })).toHaveAttribute(
      'aria-invalid',
      'true'
    );
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Escolha a coluna usada'
    );
  });
});
