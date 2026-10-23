import type {
  SituacaoDaEtapa,
  StatusDaExecucao,
} from '../../types/logExecucao';

export const STATUS_DA_LISTA: StatusDaExecucao[] = [
  'concluido',
  'concluido_com_avisos',
  'erro',
  'cancelado',
  'em_andamento',
  'interrompido',
];
export const ROTULOS_DA_SITUACAO: Record<SituacaoDaEtapa, string> = {
  concluida: 'Concluída',
  falhou: 'Falhou',
  em_andamento: 'Em andamento',
  nao_executada: 'Não executada',
};
export const ROTULOS_DA_ORIGEM = {
  processo: 'Processo',
  ferramenta: 'Ferramenta',
} as const;
