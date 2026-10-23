/** Pessoa lotada num setor, lida da planilha de lotação (só em memória). */
export type Pessoa = {
  nome: string;
  matricula: string;
  email: string;
  funcao: string;
  /** Nome do setor como veio na planilha. */
  lotacao: string;
};
