import { useState } from 'react';
import { ArrowUpRight, Clock3, Pencil, Play, Star, Wrench } from 'lucide-react';
import bannerSeduc from '../assets/seduc-banner.webp';
import ExecuteProcessModal from '../components/ExecuteProcessModal';
import PageHeader from '../components/PageHeader';
import ProcessCardAction from '../components/ProcessCardAction';
import {
  IconButton,
  SectionTitle,
  SimulationNotice,
  StatusText,
  type StatusExecucao,
} from '../components/ui';
import {
  ferramentasMaisUsadas,
  logsRecentes,
  processosDestaque,
} from '../mock/homeMock';
import type { ProcessoBase } from '../types/processo';

type ProcessoDestaque = (typeof processosDestaque)[number];

const STATUS_VALIDOS: readonly StatusExecucao[] = [
  'concluido',
  'atencao',
  'erro',
];

function paraStatus(status: string): StatusExecucao {
  return STATUS_VALIDOS.find((valido) => valido === status) ?? 'erro';
}

function BannerBoasVindas() {
  return (
    <section className="welcome-banner" aria-labelledby="boas-vindas-titulo">
      <img
        src={bannerSeduc}
        alt="Sede da Secretaria de Estado de Educação de Mato Grosso"
        width={1600}
        height={688}
        loading="eager"
        decoding="async"
      />
      <div className="welcome-copy">
        <span className="eyebrow">SEDUC · MATO GROSSO</span>
        <h2 id="boas-vindas-titulo">
          Bem-vindo ao <span>DataHub!</span>
        </h2>
        <p>
          Centralize processos, automatize rotinas e facilite a gestão de dados
          em planilhas com mais organização e agilidade.
        </p>
        <div className="institutional-line" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>
      <p className="welcome-motto">
        INTERFACE QUE ORGANIZA
        <br />
        PROCESSOS QUE TRANSFORMAM
      </p>
    </section>
  );
}

function ProcessosEmDestaque({
  processos,
  onAbrir,
  onEditar,
  onVerTodos,
}: {
  processos: ProcessoDestaque[];
  onAbrir: (processo: ProcessoDestaque) => void;
  onEditar: (id: number) => void;
  onVerTodos: () => void;
}) {
  return (
    <section className="ui-panel home-panel" aria-labelledby="destaques-titulo">
      <SectionTitle
        id="destaques-titulo"
        title="Processos em destaque"
        icon={Star}
        aside={
          <button type="button" className="home-link" onClick={onVerTodos}>
            Ver todos <ArrowUpRight size={14} aria-hidden="true" />
          </button>
        }
      />
      <ul className="home-process-list">
        {processos.map((processo) => {
          const Icone = processo.icone;
          return (
            <li key={processo.id} className="home-process-row">
              <ProcessCardAction
                nome={processo.nome}
                onAbrir={() => onAbrir(processo)}
              />
              <span className={`home-entity-icon ${processo.corIcone}`}>
                <Icone size={18} aria-hidden="true" />
              </span>
              <div className="home-process-text">
                <h3>{processo.nome}</h3>
                <p>{processo.descricao}</p>
              </div>
              <div className="home-process-actions">
                <IconButton
                  icon={Pencil}
                  label={`Editar ${processo.nome}`}
                  size="sm"
                  onClick={() => onEditar(processo.id)}
                />
                <span className="run-hint" aria-hidden="true">
                  <Play size={14} />
                  Executar
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function FerramentasMaisUsadas() {
  return (
    <section
      className="ui-panel home-panel"
      aria-labelledby="ferramentas-titulo"
    >
      <SectionTitle
        id="ferramentas-titulo"
        title="Ferramentas mais utilizadas"
        icon={Wrench}
        aside={
          <>
            <span className="soon-pill">Em breve</span>
            <button
              type="button"
              className="home-link"
              disabled
              title="Tela de ferramentas em preparação"
            >
              Ver todas <ArrowUpRight size={14} aria-hidden="true" />
            </button>
          </>
        }
      />
      <ul className="home-tool-list">
        {ferramentasMaisUsadas.slice(0, 4).map((ferramenta) => {
          const Icone = ferramenta.icone;
          return (
            <li key={ferramenta.id} className="home-tool-item">
              <span
                className={`home-entity-icon home-entity-icon--sm ${ferramenta.corIcone}`}
              >
                <Icone size={15} aria-hidden="true" />
              </span>
              <div className="home-tool-text">
                <h3>{ferramenta.nome}</h3>
                <p title={ferramenta.descricao}>{ferramenta.descricao}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function LogsDeExecucao() {
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
        {logsRecentes.map((log) => {
          const origem =
            log.tipo === 'processo' ? processosDestaque : ferramentasMaisUsadas;
          const item = origem.find(
            (entrada) => entrada.id === log.referenciaId
          );
          if (!item) return null;
          const Icone = item.icone;
          return (
            <li key={log.id} className="log-entry">
              <span
                className={`home-entity-icon home-entity-icon--sm ${item.corIcone}`}
              >
                <Icone size={15} aria-hidden="true" />
              </span>
              <div className="log-entry-body">
                <div className="log-entry-head">
                  <h3>{item.nome}</h3>
                  <time>{log.horario}</time>
                </div>
                <p>{log.detalhe}</p>
                <div className="log-entry-meta">
                  <StatusText status={paraStatus(log.status)} />
                  <span className="log-duration">{log.duracao}</span>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}

export default function Home({
  onProcessos,
  onEditarProcesso,
  processosConfigurados,
}: {
  onProcessos: () => void;
  onEditarProcesso: (id: number) => void;
  processosConfigurados: Record<number, ProcessoBase>;
}) {
  const destaquesAtualizados = processosDestaque.map((processo) => {
    const configuracao = processosConfigurados[processo.id];
    return configuracao
      ? {
          ...processo,
          nome: configuracao.nome,
          descricao: configuracao.descricao,
        }
      : processo;
  });
  const [processoEmExecucao, setProcessoEmExecucao] =
    useState<ProcessoDestaque | null>(null);
  const [configuracaoEmExecucao, setConfiguracaoEmExecucao] =
    useState<ProcessoBase>();

  // D3a: abrir o processo mostra o modal de execução sem iniciar.
  function abrirProcesso(processo: ProcessoDestaque) {
    setConfiguracaoEmExecucao(processosConfigurados[processo.id]);
    setProcessoEmExecucao(processo);
  }

  return (
    <>
      <main id="conteudo-principal" tabIndex={-1} className="page-scroll">
        <PageHeader
          titulo="Início"
          descricao="Seu espaço de trabalho com dados e processos."
          acao={
            <SimulationNotice detail="Dados de exemplo; nada é executado." />
          }
        />
        <div className="page-content home-content">
          <BannerBoasVindas />
          <div className="home-workspace">
            <div className="home-primary">
              <ProcessosEmDestaque
                processos={destaquesAtualizados}
                onAbrir={abrirProcesso}
                onEditar={onEditarProcesso}
                onVerTodos={onProcessos}
              />
              <FerramentasMaisUsadas />
            </div>
            <LogsDeExecucao />
          </div>
        </div>
      </main>
      <ExecuteProcessModal
        aberto={!!processoEmExecucao}
        processo={processoEmExecucao}
        configuracao={configuracaoEmExecucao}
        onClose={() => setProcessoEmExecucao(null)}
      />
    </>
  );
}
