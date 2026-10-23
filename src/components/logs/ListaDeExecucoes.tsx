import { Button } from '../ui';
import { formatarDataHora, formatarDuracao } from '../../domain/logsExecucao';
import type { ResumoDaExecucao } from '../../types/logExecucao';
import StatusDaExecucao from './StatusDaExecucao';
import { ROTULOS_DA_ORIGEM } from './constantes';

type Props = {
  itens: ResumoDaExecucao[];
  selecionada?: string;
  aoSelecionar: (id: string) => void;
  aoLimpar: () => void;
};
export default function ListaDeExecucoes({
  itens,
  selecionada,
  aoSelecionar,
  aoLimpar,
}: Props) {
  if (!itens.length)
    return (
      <section className="logs-lista">
        <div className="ui-empty">
          Nenhuma execução encontrada.
          <Button variant="secondary" size="sm" onClick={aoLimpar}>
            Limpar filtros
          </Button>
        </div>
      </section>
    );
  return (
    <section className="logs-lista" aria-label="Lista de execuções">
      <ul aria-label="Execuções">
        {itens.map((item) => (
          <li key={item.execucao}>
            <button
              className="logs-item"
              type="button"
              aria-pressed={selecionada === item.execucao}
              onClick={() => aoSelecionar(item.execucao)}
            >
              <strong>{item.nome}</strong>
              <span className="logs-item__meta">
                {ROTULOS_DA_ORIGEM[item.origem]} ·{' '}
                <time dateTime={item.inicio}>
                  {formatarDataHora(item.inicio)}
                </time>
              </span>
              <span className="logs-item__meta">
                {formatarDuracao(item.duracao_ms)}
                {item.avisos
                  ? ` · ${item.avisos} ${item.avisos === 1 ? 'aviso' : 'avisos'}`
                  : ''}
              </span>
              <StatusDaExecucao status={item.status} />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
