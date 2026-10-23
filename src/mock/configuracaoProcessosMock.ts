import { processosMock } from './processosMock';
import { ferramentasMock } from './ferramentasMock';
import type { EtapaProcesso, ProcessoBase } from '../types/processo';
import { normalizarParametros } from '../domain/ferramentas';

const ferramentasPorProcesso: Record<number, string[]> = {
  1: ['mesclar-planilhas', 'eliminar-duplicatas', 'dicionario'],
  2: ['dicionario', 'eliminar-duplicatas'],
  3: ['mesclar-planilhas', 'zebrar-planilha'],
  4: ['dicionario', 'eliminar-duplicatas'],
  5: ['eliminar-duplicatas', 'zebrar-planilha'],
  6: ['eliminar-duplicatas', 'zebrar-planilha'],
  7: ['dicionario', 'eliminar-duplicatas'],
  8: ['dicionario', 'zebrar-planilha'],
  9: ['mesclar-planilhas', 'eliminar-duplicatas'],
  10: ['zebrar-planilha'],
};

function criarEtapa(ferramentaId: string, indice: number): EtapaProcesso {
  return {
    id: indice + 1,
    ferramentaId,
    planilhas: [],
    condicao: {
      ativa: false,
      tipo: 'coluna-existe',
      arquivoId: '',
      coluna: '',
      valor: '',
    },
    parametros: normalizarParametros(ferramentaId, undefined),
  };
}

export function criarConfiguracaoProcessoMock(id: number): ProcessoBase | null {
  const resumo = processosMock.find((processo) => processo.id === id);
  if (!resumo) return null;

  const ferramentasDoProcesso = (ferramentasPorProcesso[id] ?? []).filter(
    (ferramentaId) =>
      ferramentasMock.some((ferramenta) => ferramenta.id === ferramentaId)
  );
  const etapas = Array.from({ length: resumo.etapas }, (_, indice) =>
    criarEtapa(
      ferramentasDoProcesso[
        indice % Math.max(ferramentasDoProcesso.length, 1)
      ] ?? 'dicionario',
      indice
    )
  );

  return {
    origem: 'ferramentas',
    scriptPython: null,
    etapas,
    nome: resumo.nome,
    descricao: resumo.descricao,
    identidadeVisual: {
      icone: 'planilha',
      imagemPersonalizada: null,
      cor: '#059669',
    },
    arquivosPrincipais: {
      principal1: null,
      principal2: null,
      modo: 'concatenar',
    },
    auxiliares: [],
    saida: {
      nome: '',
      formato: 'xlsx',
      pastaDestino: '',
    },
  };
}
