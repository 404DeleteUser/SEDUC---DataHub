import type { LucideIcon } from 'lucide-react';
import { ArrowUpRight, Clock3, FolderCog, Wrench } from 'lucide-react';

import { SectionTitle, SimulationNotice } from '../ui';
import {
  descricaoCurtaDaExecucao,
  detalheDaExecucao,
  formatarDataCurta,
  formatarDataHora,
  formatarDuracao,
} from '../../domain/logsExecucao';
import { ferramentasMock } from '../../mock/ferramentasMock';
import { logsExecucaoMock } from '../../mock/logsExecucaoMock';
import { processosMock } from '../../mock/processosMock';
import type {
  DetalheDaExecucao,
  ResumoDaExecucao,
} from '../../types/logExecucao';
import StatusDaExecucao from './StatusDaExecucao';

const QUANTIDADE_NO_INICIO = 5;

type Identidade = { icone: LucideIcon; corIcone: string };

/** Ícone e cor do processo ou da ferramenta, como no resto do app. */
function identidadeDe({ nome, origem }: ResumoDaExecucao): Identidade {
  if (origem === 'processo') {
    const processo = processosMock.find((item) => item.nome === nome);
    return (
      processo ?? { icone: FolderCog, corIcone: 'bg-slate-600 text-white' }
    );
  }
  const ferramenta = ferramentasMock.find((item) => item.nome === nome);
  return ferramenta
    ? { icone: ferramenta.icone, corIcone: `${ferramenta.cor} text-white` }
    : { icone: Wrench, corIcone: 'bg-slate-600 text-white' };
}

/** As execuções mais recentes, da mesma fonte da página Logs de Execução. */
function execucoesRecentes(): DetalheDaExecucao[] {
  return logsExecucaoMock
    .map(detalheDaExecucao)
    .filter((detalhe): detalhe is DetalheDaExecucao => detalhe !== null)
    .sort((a, b) => b.resumo.inicio.localeCompare(a.resumo.inicio))
    .slice(0, QUANTIDADE_NO_INICIO);
}

function EntradaDoLog({
  detalhe,
  onAbrir,
}: {
  detalhe: DetalheDaExecucao;
  onAbrir: (execucao: string) => void;
}) {
  const { resumo } = detalhe;
  const { icone: Icone, corIcone } = identidadeDe(resumo);
  const quando = formatarDataCurta(resumo.inicio);
  return (
    <li className="log-entry">
      <button
        type="button"
        className="process-card-open"
        aria-label={`Ver log de ${resumo.nome}, ${formatarDataHora(resumo.inicio)}`}
        onClick={() => onAbrir(resumo.execucao)}
      />
      <span className={`home-entity-icon home-entity-icon--sm ${corIcone}`}>
        <Icone size={15} aria-hidden="true" />
      </span>
      <div className="log-entry-body">
        <div className="log-entry-head">
          <h3>{resumo.nome}</h3>
          <time dateTime={resumo.inicio}>{quando}</time>
        </div>
        <p>{descricaoCurtaDaExecucao(detalhe)}</p>
        <div className="log-entry-meta">
          <StatusDaExecucao status={resumo.status} />
          <span className="log-duration">
            {formatarDuracao(resumo.duracao_ms)}
          </span>
        </div>
      </div>
    </li>
  );
}

export default function LogsRecentes({
  onAbrir,
  onVerTodos,
}: {
  onAbrir: (execucao: string) => void;
  onVerTodos: () => void;
}) {
  return (
    <aside
      className="ui-panel home-panel home-logs"
      aria-labelledby="logs-titulo"
    >
      <SectionTitle
        id="logs-titulo"
        title="Logs de Execução"
        icon={Clock3}
        aside={
          <SimulationNotice detail="Histórico de exemplo; nada foi executado." />
        }
      />
      <ol className="log-timeline">
        {execucoesRecentes().map((detalhe) => (
          <EntradaDoLog
            key={detalhe.resumo.execucao}
            detalhe={detalhe}
            onAbrir={onAbrir}
          />
        ))}
      </ol>
      <button
        type="button"
        className="home-link home-logs__todos"
        onClick={onVerTodos}
      >
        Ver todos os logs <ArrowUpRight size={14} aria-hidden="true" />
      </button>
    </aside>
  );
}
