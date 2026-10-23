export type TipoSetor =
  | 'gabinete'
  | 'superintendencia'
  | 'coordenadoria'
  | 'nucleo'
  | 'unidade'
  | 'diretoria'
  | 'gerencia'
  | 'conselho'
  | 'camara'
  | 'colegiado'
  | 'comissao'
  | 'ouvidoria'
  | 'secretaria'
  | 'centro';

/** Linha cheia no organograma é subordinação; tracejada é vinculação. */
export type VinculoSetor = 'subordinacao' | 'vinculacao';

export type Setor = {
  /** Estável: é a chave para ligar contatos e lotações no futuro. */
  id: string;
  nome: string;
  tipo: TipoSetor;
  /** Ausente nos colegiados, que não têm linha no organograma. */
  paiId?: string;
  /** Padrão: subordinação. */
  vinculo?: VinculoSetor;
};
