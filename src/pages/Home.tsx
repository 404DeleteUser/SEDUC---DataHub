import { useState } from 'react';
import { ArrowUpRight, Clock3, Play, Star, Wrench } from 'lucide-react';
import bannerSeduc from '../assets/seduc-banner.png';
import ExecuteProcessModal from '../components/ExecuteProcessModal';
import PageHeader from '../components/PageHeader';
import ProcessCardAction from '../components/ProcessCardAction';
import {
  ferramentasMaisUsadas,
  logsRecentes,
  processosDestaque,
} from '../mock/homeMock';
import type { ProcessoBase } from '../types/processo';
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
  const [processoEmExecucao, setProcessoEmExecucao] = useState<
    (typeof destaquesAtualizados)[number] | null
  >(null);
  const [configuracaoEmExecucao, setConfiguracaoEmExecucao] =
    useState<ProcessoBase>();
  const [executarAoAbrir, setExecutarAoAbrir] = useState(false);
  function abrirProcesso(
    processo: (typeof destaquesAtualizados)[number],
    executar = false
  ) {
    setExecutarAoAbrir(executar);
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
            <span className="demo-badge">
              <span />
              Demonstração
            </span>
          }
        />
        <div className="page-content home-content">
          <section className="welcome-banner">
            <img
              src={bannerSeduc}
              alt="Sede da Secretaria de Estado de Educação de Mato Grosso"
              width={900}
              height={360}
            />
            <div className="welcome-copy">
              <span className="eyebrow">SEDUC · MATO GROSSO</span>
              <h2>
                Bem-vindo ao <span>DataHub!</span>
              </h2>
              <p>
                Centralize processos, automatize rotinas e facilite a gestão de
                dados em planilhas com mais organização e agilidade.
              </p>
              <div className="institutional-line">
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
          <div className="home-workspace">
            <div className="home-primary">
              <section aria-labelledby="destaques-titulo">
                <div className="section-heading">
                  <h2 id="destaques-titulo">
                    <Star size={17} aria-hidden="true" />
                    Processos em destaque
                  </h2>
                  <button className="text-button" onClick={onProcessos}>
                    Ver todos <ArrowUpRight size={14} />
                  </button>
                </div>
                <div className="featured-grid">
                  {destaquesAtualizados.map((processo) => {
                    const Icone = processo.icone;
                    return (
                      <article key={processo.id} className="featured-process">
                        <ProcessCardAction
                          nome={processo.nome}
                          onAbrir={() => onEditarProcesso(processo.id)}
                        />
                        <div className={`entity-icon ${processo.corIcone}`}>
                          <Icone size={22} aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                          <h3>{processo.nome}</h3>
                          <p>{processo.descricao}</p>
                        </div>
                        <button
                          className="icon-button process-play"
                          onClick={() => abrirProcesso(processo, true)}
                          aria-label={`Executar ${processo.nome}`}
                          title="Executar"
                        >
                          <Play size={16} />
                        </button>
                      </article>
                    );
                  })}
                </div>
              </section>
              <section aria-labelledby="ferramentas-titulo">
                <div className="section-heading">
                  <h2 id="ferramentas-titulo">
                    <Wrench size={17} aria-hidden="true" />
                    Ferramentas mais utilizadas
                  </h2>
                  <button
                    type="button"
                    className="text-button"
                    disabled
                    title="Tela de ferramentas em preparação"
                  >
                    Ver todas <ArrowUpRight size={14} aria-hidden="true" />
                  </button>
                </div>
                <div className="tools-grid">
                  {ferramentasMaisUsadas.slice(0, 4).map((ferramenta) => {
                    const Icone = ferramenta.icone;
                    return (
                      <article key={ferramenta.id} className="tool-item">
                        <div
                          className={`entity-icon entity-icon-small ${ferramenta.corIcone}`}
                        >
                          <Icone size={17} aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                          <h3>{ferramenta.nome}</h3>
                          <p>{ferramenta.descricao}</p>
                          <button
                            className="text-button tool-pending"
                            disabled
                            title="Interface da ferramenta em preparação"
                          >
                            Abrir <ArrowUpRight size={12} />
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            </div>
            <aside className="activity-panel" aria-labelledby="logs-titulo">
              <div className="section-heading">
                <h2 id="logs-titulo">
                  <Clock3 size={17} aria-hidden="true" />
                  Logs de Execução
                </h2>
              </div>
              <p className="activity-caption">Histórico demonstrativo</p>
              <div className="activity-list">
                {logsRecentes.map((log) => {
                  const item = (
                    log.tipo === 'processo'
                      ? processosDestaque
                      : ferramentasMaisUsadas
                  ).find((item) => item.id === log.referenciaId);
                  if (!item) return null;
                  const Icone = item.icone;
                  return (
                    <article key={log.id} className="activity-item">
                      <div
                        className={`entity-icon entity-icon-small ${item.corIcone}`}
                      >
                        <Icone size={16} aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <h3>{item.nome}</h3>
                        <p>{log.detalhe}</p>
                        <div className="activity-meta">
                          <span className={`status-text status-${log.status}`}>
                            {log.status === 'concluido'
                              ? 'Concluído'
                              : log.status === 'atencao'
                                ? 'Atenção'
                                : 'Erro'}
                          </span>
                          <span>{log.duracao}</span>
                        </div>
                        <time>{log.horario}</time>
                      </div>
                    </article>
                  );
                })}
              </div>
            </aside>
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
