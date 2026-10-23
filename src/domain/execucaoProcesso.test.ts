import { describe, expect, it } from 'vitest';
import { roteiroDaExecucao } from './execucaoProcesso';
import type { EtapaProcesso } from '../types/processo';

const condicao = {
  ativa: false,
  tipo: 'coluna-existe' as const,
  arquivoId: '',
  coluna: '',
  valor: '',
};
const etapa = (
  ferramentaId: string,
  parametros?: EtapaProcesso['parametros']
): EtapaProcesso => ({
  id: 1,
  ferramentaId,
  planilhas: [],
  condicao,
  parametros,
});

const nomes: Record<string, string> = {
  'eliminar-duplicatas': 'Eliminar Duplicatas',
  'script-python': 'Script Python conectado',
};
const nomeDaFerramenta = (id: string) => nomes[id] ?? id;

describe('roteiroDaExecucao', () => {
  it('monta o log com o log embutido de cada ferramenta, na ordem das etapas', () => {
    const roteiro = roteiroDaExecucao({
      arquivos: {
        principal: 'base.xlsx',
        complementar: '',
        saida: 'C:\\s.xlsx',
      },
      etapas: [
        etapa('eliminar-duplicatas', {
          ferramentaId: 'eliminar-duplicatas',
          colunasChave: ['CPF'],
        }),
        etapa('script-python'),
      ],
      scriptPython: {
        modo: 'arquivo',
        principal: { nome: 'a.py', rotulo: 'a.py' },
      },
      nomeDaFerramenta,
    });
    expect(roteiro.map((passo) => passo.acao)).toEqual([
      'Carregando a planilha principal (base.xlsx)…',
      'Eliminar Duplicatas: Comparando linhas pelas colunas: CPF…',
      'Eliminar Duplicatas: Sorteando uma linha de cada grupo de duplicatas para permanecer…',
      'Script Python conectado: executando a.py…',
      'Gravando o arquivo de saída (C:\\s.xlsx)…',
      'Processo finalizado com sucesso.',
    ]);
    expect(roteiro.map((passo) => passo.progresso)).toEqual([
      17, 33, 50, 67, 83, 100,
    ]);
  });

  it('inclui a planilha complementar quando informada', () => {
    const roteiro = roteiroDaExecucao({
      arquivos: {
        principal: 'a.xlsx',
        complementar: 'b.xlsx',
        saida: 's.xlsx',
      },
      etapas: [],
      scriptPython: null,
      nomeDaFerramenta,
    });
    expect(roteiro[1].acao).toBe(
      'Carregando a planilha complementar (b.xlsx)…'
    );
  });
});
