export type FerramentaId =
  | 'zebrar-planilha'
  | 'eliminar-duplicatas'
  | 'dicionario'
  | 'mesclar-planilhas'
  | 'dividir-por';

export type ParametrosZebrar = {
  ferramentaId: 'zebrar-planilha';
  corCabecalho: string;
  corLinhaA: string;
  corLinhaB: string;
};

export type ParametrosEliminarDuplicatas = {
  ferramentaId: 'eliminar-duplicatas';
  colunasChave: string[];
};

export type ModoDicionario = 'contem' | 'exato';

export type ParametrosDicionario = {
  ferramentaId: 'dicionario';
  coluna: string;
  modo: ModoDicionario;
  valores: string[];
};

export type ParametrosMesclar = {
  ferramentaId: 'mesclar-planilhas';
  modo: 'vertical' | 'abas';
};

export type ParametrosDividirPor = {
  ferramentaId: 'dividir-por';
  coluna: string;
};

export type ParametrosFerramenta =
  | ParametrosZebrar
  | ParametrosEliminarDuplicatas
  | ParametrosDicionario
  | ParametrosMesclar
  | ParametrosDividirPor;

export type CabecalhoArquivo = {
  arquivo: string;
  colunas: string[];
};

export type ErroParametro = {
  campo: string;
  mensagem: string;
};
