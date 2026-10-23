import { useState } from 'react';
import { ArrowUpRight, Pencil, Play, Star, Wrench } from 'lucide-react';
import AsciiSeduc from '../components/ascii/AsciiSeduc';
import ExecuteProcessModal from '../components/ExecuteProcessModal';
import PageHeader from '../components/PageHeader';
import ProcessCardAction from '../components/ProcessCardAction';
import { IconButton, SectionTitle, SimulationNotice } from '../components/ui';
import LogsRecentes from '../components/logs/LogsRecentes';
import { ferramentasMaisUsadas, processosDestaque } from '../mock/homeMock';
import type { FerramentaId } from '../types/ferramenta';
import type { ProcessoBase } from '../types/processo';

type ProcessoDestaque = (typeof processosDestaque)[number];

function BannerBoasVindas() {
  return (
    <section className="welcome-banner" aria-labelledby="boas-vindas-titulo">
      <AsciiSeduc />
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
  onAbrir: (processo: ProcessoDestaque, executar?: boolean) => void;
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
                <button
                  type="button"
                  className="run-hint"
                  aria-label={`Executar ${processo.nome}`}
                  onClick={() => onAbrir(processo, true)}
                >
                  <Play size={14} aria-hidden="true" />
                  Executar
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function FerramentasMaisUsadas({
  onAbrir,
  onVerTodas,
}: {
  onAbrir: (ferramentaId: FerramentaId) => void;
  onVerTodas: () => void;
}) {
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
          <button type="button" className="home-link" onClick={onVerTodas}>
            Ver todas <ArrowUpRight size={14} aria-hidden="true" />
          </button>
        }
      />
      <ul className="home-tool-list">
        {ferramentasMaisUsadas.slice(0, 4).map((ferramenta) => {
          const Icone = ferramenta.icone;
          return (
            <li key={ferramenta.id} className="home-tool-item">
              <button
                type="button"
                className="process-card-open"
                aria-label={`Abrir ${ferramenta.nome}`}
                onClick={() => onAbrir(ferramenta.id)}
              />
              <span
                className={`home-entity-icon home-entity-icon--sm ${ferramenta.corIcone}`}
              >
                <Icone size={15} aria-hidden="true" />
              </span>
              <div className="home-tool-text">
                <h3>{ferramenta.nome}</h3>
                <p>{ferramenta.descricao}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default function Home({
  onProcessos,
  onEditarProcesso,
  onAbrirFerramenta,
  onFerramentas,
  onLogs,
  onAbrirLog,
  processosConfigurados,
}: {
  onProcessos: () => void;
  onAbrirFerramenta: (ferramentaId: FerramentaId) => void;
  onFerramentas: () => void;
  onLogs: () => void;
  onAbrirLog: (execucao: string) => void;
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

  const [executarAoAbrir, setExecutarAoAbrir] = useState(false);

  // Clicar na linha só abre o modal; o botão Executar abre e já executa.
  function abrirProcesso(processo: ProcessoDestaque, executar = false) {
    setConfiguracaoEmExecucao(processosConfigurados[processo.id]);
    setExecutarAoAbrir(executar);
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
              <FerramentasMaisUsadas
                onAbrir={onAbrirFerramenta}
                onVerTodas={onFerramentas}
              />
            </div>
            <LogsRecentes onAbrir={onAbrirLog} onVerTodos={onLogs} />
          </div>
        </div>
      </main>
      <ExecuteProcessModal
        aberto={!!processoEmExecucao}
        processo={processoEmExecucao}
        configuracao={configuracaoEmExecucao}
        executarAoAbrir={executarAoAbrir}
        onClose={() => setProcessoEmExecucao(null)}
      />
    </>
  );
}
