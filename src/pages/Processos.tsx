import { useState } from 'react';
import {
  Clock3,
  Plus,
  ListChecks,
  Pencil,
  Play,
  Search,
  Trash2,
  FolderSearch,
} from 'lucide-react';
import ExecuteProcessModal from '../components/ExecuteProcessModal';
import PageHeader from '../components/PageHeader';
import ProcessCardAction from '../components/ProcessCardAction';
import { processosMock } from '../mock/processosMock';
import type { ProcessoBase } from '../types/processo';
function normalizarTexto(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}
export default function Processos({
  onNovoProcesso,
  onEditarProcesso,
  processosConfigurados,
  salvamentoSimulado = false,
}: {
  onNovoProcesso: () => void;
  onEditarProcesso: (id: number) => void;
  processosConfigurados: Record<number, ProcessoBase>;
  salvamentoSimulado?: boolean;
}) {
  const [busca, setBusca] = useState('');
  const [processoEmExecucao, setProcessoEmExecucao] = useState<
    (typeof processosMock)[number] | null
  >(null);
  const [configuracaoEmExecucao, setConfiguracaoEmExecucao] =
    useState<ProcessoBase>();
  const [executarAoAbrir, setExecutarAoAbrir] = useState(false);
  function abrirProcesso(
    processo: (typeof processosMock)[number],
    executar = false
  ) {
    setExecutarAoAbrir(executar);
    setConfiguracaoEmExecucao(processosConfigurados[processo.id]);
    setProcessoEmExecucao(processo);
  }
  const processosAtualizados = processosMock.map((processo) => {
    const configuracao = processosConfigurados[processo.id];
    return configuracao
      ? {
          ...processo,
          nome: configuracao.nome,
          descricao: configuracao.descricao,
          etapas: configuracao.etapas.length,
        }
      : processo;
  });
  const processosFiltrados = processosAtualizados.filter((processo) =>
    normalizarTexto(`${processo.nome} ${processo.descricao}`).includes(
      normalizarTexto(busca)
    )
  );
  return (
    <>
      <main id="conteudo-principal" tabIndex={-1} className="page-scroll">
        <PageHeader
          titulo="Processos"
          descricao="Organize suas rotinas e acompanhe cada execução."
          acao={
            <button onClick={onNovoProcesso} className="primary-button">
              <Plus size={17} />
              Novo Processo
            </button>
          }
        />
        <div className="page-content">
          {salvamentoSimulado && (
            <p className="success-feedback" role="status">
              Simulação de configuração concluída. Nenhum processo foi
              persistido.
            </p>
          )}
          <div className="catalog-toolbar">
            <label className="search-field">
              <Search size={18} aria-hidden="true" />
              <span className="sr-only">Buscar processos</span>
              <input
                type="search"
                name="busca-processos"
                autoComplete="off"
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
                placeholder="Buscar processos…"
              />
            </label>
            <span className="catalog-count" role="status">
              {processosFiltrados.length} de {processosAtualizados.length}{' '}
              processos <span className="demo-badge">Mock</span>
            </span>
          </div>
          {processosFiltrados.length ? (
            <section
              className="process-catalog"
              aria-label="Processos disponíveis"
            >
              {processosFiltrados.map((processo) => {
                const Icone = processo.icone;
                return (
                  <article className="process-card" key={processo.id}>
                    <ProcessCardAction
                      nome={processo.nome}
                      onAbrir={() => onEditarProcesso(processo.id)}
                    />
                    <div className="process-card-top">
                      <div className={`entity-icon ${processo.corIcone}`}>
                        <Icone size={23} aria-hidden="true" />
                      </div>
                      <span className="category-tag">{processo.categoria}</span>
                      <div className="process-card-actions">
                        <button
                          className="icon-button"
                          onClick={() => onEditarProcesso(processo.id)}
                          aria-label={`Editar ${processo.nome}`}
                          title="Editar processo"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          className="icon-button"
                          disabled
                          aria-label={`Excluir ${processo.nome} — em preparação`}
                          title="Exclusão em preparação"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                    <h2>{processo.nome}</h2>
                    <p>{processo.descricao}</p>
                    <div className="process-card-meta">
                      <span>
                        <ListChecks size={14} />
                        {processo.etapas} etapas
                      </span>
                      <span>
                        <Clock3 size={14} />
                        {processo.ultimaExecucao}
                      </span>
                    </div>
                    <button
                      className="process-execute"
                      onClick={() => abrirProcesso(processo, true)}
                    >
                      <Play size={13} />
                      Executar
                    </button>
                  </article>
                );
              })}
            </section>
          ) : (
            <div className="catalog-empty" role="status">
              <FolderSearch size={34} aria-hidden="true" />
              <h2>Nenhum processo encontrado.</h2>
              <p>Experimente outro nome ou limpe a busca.</p>
              <button className="secondary-button" onClick={() => setBusca('')}>
                Limpar busca
              </button>
            </div>
          )}
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
