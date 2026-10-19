import { processosMock } from './processosMock';
import { ferramentasMock } from './ferramentasMock';
import type { EtapaProcesso, ProcessoBase } from '../types/processo';

const ferramentasPorProcesso: Record<number, string[]> = {
  1: ['juntar-planilhas', 'remover-duplicatas', 'validar-dados'],
  2: ['validar-dados', 'remover-vazios'],
  3: ['juntar-planilhas', 'formatar-planilha'],
  4: ['validar-dados', 'remover-duplicatas'],
  5: ['remover-vazios', 'formatar-planilha'],
  6: ['remover-duplicatas', 'formatar-planilha'],
  7: ['validar-dados', 'remover-duplicatas'],
  8: ['validar-dados', 'zebrar-planilha'],
  9: ['juntar-planilhas', 'remover-duplicatas'],
  10: ['formatar-planilha'],
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
      ] ?? 'validar-dados',
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
