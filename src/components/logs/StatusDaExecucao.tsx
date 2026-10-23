import { ROTULOS_DE_STATUS } from '../../domain/logsExecucao';
import type { StatusDaExecucao as Status } from '../../types/logExecucao';

const classeStatus: Partial<Record<Status, string>> = {
  concluido_com_avisos: 'logs-status--concluido_com_avisos',
  cancelado: 'logs-status--cancelado',
  interrompido: 'logs-status--interrompido',
  em_andamento: 'logs-status--em_andamento',
};

export default function StatusDaExecucao({ status }: { status: Status }) {
  const modificador = classeStatus[status] ?? `ui-status--${status}`;
  return (
    <span className={`ui-status ${modificador}`}>
      {ROTULOS_DE_STATUS[status]}
    </span>
  );
}
