import type { ParametrosFerramenta } from './ferramenta';

export type AuxiliarProcesso = {
  id: number;
  nome: string;
  arquivo: File | null;
};

/** Arquivo ou pasta escolhido no explorador (caminho real só no app desktop). */
export type ItemDoExplorador = {
  nome: string;
  caminho?: string;
  rotulo: string;
};

export type ScriptPython = {
  modo: 'arquivo' | 'pasta';
  /** Script executado. Na pasta, `nome` é o caminho relativo a ela. */
  principal: ItemDoExplorador;
  /** Só no modo pasta; `arquivos` (os .py encontrados) só no navegador. */
  pasta?: ItemDoExplorador & { arquivos?: string[] };
};

export type ProcessoBase = {
  origem: 'ferramentas' | 'script-python';
  scriptPython: ScriptPython | null;
  etapas: EtapaProcesso[];
  nome: string;
  descricao: string;

  identidadeVisual: {
    icone: string;
    imagemPersonalizada: File | null;
    cor: string;
  };

  arquivosPrincipais: {
    principal1: File | null;
    principal2: File | null;
    modo: 'concatenar' | 'separados';
  };

  auxiliares: AuxiliarProcesso[];

  saida: {
    nome: string;
    formato: string;
    pastaDestino: string;
  };
};

export type PlanilhaEtapa = {
  arquivoId: string;
  colunas: string[];
};

export type TipoCondicaoEtapa =
  'coluna-existe' | 'igual' | 'diferente' | 'nao-vazio';

export type CondicaoEtapa = {
  ativa: boolean;
  tipo: TipoCondicaoEtapa;
  arquivoId: string;
  coluna: string;
  valor: string;
};

export type EtapaProcesso = {
  id: number;
  ferramentaId: string;

  planilhas: PlanilhaEtapa[];

  condicao: CondicaoEtapa;

  /** Configuração da ferramenta, gravada com o processo (ausente no script Python). */
  parametros?: ParametrosFerramenta;
};

export type ArquivoDisponivel = {
  id: string;
  nome: string;
  tipo: 'principal' | 'auxiliar';
  arquivo: File;
};
