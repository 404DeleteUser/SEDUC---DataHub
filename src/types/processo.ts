export type AuxiliarProcesso = {
  id: number;
  nome: string;
  arquivo: File | null;
};

export type ProcessoBase = {
  origem: 'ferramentas' | 'script-python';
  scriptPython: File | null;
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
};

export type ArquivoDisponivel = {
  id: string;
  nome: string;
  tipo: 'principal' | 'auxiliar';
  arquivo: File;
};
