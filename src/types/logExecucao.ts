import type { EventoDeExecucao, StatusFinal } from '../domain/eventosExecucao';

/** Status de uma execução registrada: o final do motor ou o deduzido sem `execucao.fim`. */
export type StatusDaExecucao = StatusFinal | 'em_andamento' | 'interrompido';

/** Um arquivo `.jsonl` do registro de logs (engine/datahub_engine/registro.py). */
export type ExecucaoRegistrada = {
  arquivo: string;
  eventos: EventoDeExecucao[];
  /** O motor ainda está rodando (marcador `.em-andamento` com processo vivo). */
  emAndamento?: boolean;
};

/** Espelho de `registro.resumo_do_arquivo` (saída de `datahub-engine logs listar`). */
export type ResumoDaExecucao = {
  execucao: string;
  arquivo: string;
  nome: string;
  origem: 'processo' | 'ferramenta';
  usuario: string;
  inicio: string;
  fim: string | null;
  status: StatusDaExecucao;
  duracao_ms: number | null;
  avisos: number;
  etapas: number;
  saida: string;
  erro: string | null;
};

export type ItemRotulado = { rotulo: string; valor: string };

export type SituacaoDaEtapa =
  'concluida' | 'falhou' | 'em_andamento' | 'nao_executada';

export type EtapaDoDetalhe = {
  indice: number;
  nome: string;
  situacao: SituacaoDaEtapa;
  parametros: ItemRotulado[];
  linhasAntes: number | null;
  linhasDepois: number | null;
  resumo: ItemRotulado[];
  duracaoMs: number | null;
  logs: { nivel: 'info' | 'aviso'; mensagem: string }[];
};

export type DetalheDaExecucao = {
  resumo: ResumoDaExecucao;
  entradas: {
    arquivo: string;
    linhas: number;
    colunas: number;
    abas: number;
  }[];
  etapas: EtapaDoDetalhe[];
  avisosGerais: string[];
  saidaGravada: { nome: string; abas: number; linhas: number } | null;
  erro: { mensagem: string; etapa: number | null } | null;
};

export type FiltroDeExecucoes = {
  busca: string;
  status: StatusDaExecucao | 'todos';
  origem: ResumoDaExecucao['origem'] | 'todas';
};
