// Log embutido de cada ferramenta: os passos que ela registra ao executar,
// já com os parâmetros configurados. Usado na aba Ferramentas e nos processos.
import type { AbaPrevista } from './ferramentas';
import type { ParametrosFerramenta } from '../types/ferramenta';

export type ContextoDoLog = {
  arquivos: string[];
  previaAbas?: AbaPrevista[];
  duplicadasRemovidas?: number;
};

const COLUNA_NAO_CONFIGURADA = '(não configurada)';

function lista(itens: string[], vazio: string) {
  const preenchidos = itens.map((item) => item.trim()).filter(Boolean);
  return preenchidos.length ? preenchidos.join(', ') : vazio;
}

export function passosDaFerramenta(
  parametros: ParametrosFerramenta,
  { arquivos, previaAbas, duplicadasRemovidas }: ContextoDoLog
): string[] {
  switch (parametros.ferramentaId) {
    case 'zebrar-planilha':
      return [
        `Pintando o cabeçalho com ${parametros.corCabecalho}…`,
        `Alternando as linhas entre ${parametros.corLinhaA} e ${parametros.corLinhaB}…`,
      ];
    case 'eliminar-duplicatas':
      return [
        `Comparando linhas pelas colunas: ${lista(parametros.colunasChave, 'nenhuma coluna configurada')}…`,
        duplicadasRemovidas === undefined
          ? 'Sorteando uma linha de cada grupo de duplicatas para permanecer…'
          : `${duplicadasRemovidas} linhas duplicadas encontradas; sorteando uma de cada grupo para permanecer…`,
      ];
    case 'dicionario':
      return [
        `Filtrando a coluna ${parametros.coluna || COLUNA_NAO_CONFIGURADA} (${parametros.modo === 'contem' ? 'contém' : 'valor exato'}): ${lista(parametros.valores, 'nenhum valor')}…`,
      ];
    case 'mesclar-planilhas':
      return [
        parametros.modo === 'vertical'
          ? `Empilhando as linhas de ${arquivos.length} arquivos…`
          : `Criando uma aba por arquivo: ${arquivos.join(', ')}…`,
      ];
    case 'dividir-por': {
      const coluna = parametros.coluna || COLUNA_NAO_CONFIGURADA;
      return [
        'Mantendo a aba consolidada…',
        previaAbas?.length
          ? `Criando abas pela coluna ${coluna}: ${previaAbas.map((aba) => aba.nome).join(', ')}…`
          : `Criando uma aba para cada valor da coluna ${coluna}…`,
      ];
    }
  }
}
