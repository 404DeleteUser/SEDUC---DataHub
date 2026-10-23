import { describe, expect, it } from 'vitest';
import { passosDaFerramenta } from './logFerramentas';
import { parametrosPadrao } from './ferramentas';

describe('passosDaFerramenta', () => {
  it('usa os parâmetros configurados', () => {
    expect(
      passosDaFerramenta(
        {
          ferramentaId: 'eliminar-duplicatas',
          colunasChave: ['CPF', 'Matrícula'],
        },
        { arquivos: ['base.xlsx'], duplicadasRemovidas: 3 }
      )
    ).toEqual([
      'Comparando linhas pelas colunas: CPF, Matrícula…',
      '3 linhas duplicadas encontradas; sorteando uma de cada grupo para permanecer…',
    ]);
    expect(
      passosDaFerramenta(
        {
          ferramentaId: 'dicionario',
          coluna: 'Cargo',
          modo: 'exato',
          valores: ['Professor', ' ', 'Diretor'],
        },
        { arquivos: ['a.xlsx'] }
      )
    ).toEqual(['Filtrando a coluna Cargo (valor exato): Professor, Diretor…']);
  });

  it('dividir por sem prévia das abas descreve a regra', () => {
    expect(
      passosDaFerramenta(
        { ferramentaId: 'dividir-por', coluna: 'Escola' },
        { arquivos: ['a.xlsx'] }
      )
    ).toEqual([
      'Mantendo a aba consolidada…',
      'Criando uma aba para cada valor da coluna Escola…',
    ]);
  });

  it('parâmetros ainda não configurados não geram texto quebrado', () => {
    const contexto = { arquivos: ['a.xlsx'] };
    expect(
      passosDaFerramenta(parametrosPadrao('eliminar-duplicatas'), contexto)
    ).toEqual([
      'Comparando linhas pelas colunas: nenhuma coluna configurada…',
      'Sorteando uma linha de cada grupo de duplicatas para permanecer…',
    ]);
    expect(
      passosDaFerramenta(parametrosPadrao('dicionario'), contexto)[0]
    ).toBe('Filtrando a coluna (não configurada) (contém): nenhum valor…');
  });
});
