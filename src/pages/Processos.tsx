import { useState } from 'react';
import {
  CheckCircle2,
  Clock3,
  FolderSearch,
  ListChecks,
  Pencil,
  Play,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import ExecuteProcessModal from '../components/ExecuteProcessModal';
import PageHeader from '../components/PageHeader';
import ProcessCardAction from '../components/ProcessCardAction';
import { Button, IconButton, SimulationNotice } from '../components/ui';
import { processosMock } from '../mock/processosMock';
import type { ProcessoBase } from '../types/processo';

type ProcessoCatalogo = (typeof processosMock)[number];

function normalizarTexto(texto: string) {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

function LinhaProcesso({
  processo,
  onAbrir,
  onEditar,
}: {
  processo: ProcessoCatalogo;
  onAbrir: () => void;
  onEditar: () => void;
}) {
  const Icone = processo.icone;
  return (
    <li className="process-row">
      <ProcessCardAction nome={processo.nome} onAbrir={onAbrir} />
      <div className="process-row-main">
        <span className={`process-row-icon ${processo.corIcone}`}>
          <Icone size={18} aria-hidden="true" />
        </span>
        <div className="process-row-text">
          <h2>{processo.nome}</h2>
          <p>{processo.descricao}</p>
        </div>
      </div>
      <div className="process-row-meta">
        <span className="category-tag">{processo.categoria}</span>
        <span className="process-row-steps">
          <ListChecks size={14} aria-hidden="true" />
          {processo.etapas} etapas
        </span>
        <span className="process-row-last">
          <Clock3 size={14} aria-hidden="true" />
          {processo.ultimaExecucao}
        </span>
      </div>
      <div className="process-row-actions">
        <IconButton
          icon={Pencil}
          label={`Editar ${processo.nome}`}
          size="sm"
          onClick={onEditar}
        />
        <IconButton
          icon={Trash2}
          label={`Excluir ${processo.nome} (em preparação)`}
          size="sm"
          variant="danger"
          disabled
        />
      </div>
      <span className="run-hint" aria-hidden="true">
        <Play size={14} />
        Executar
      </span>
    </li>
  );
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
  const [processoEmExecucao, setProcessoEmExecucao] =
    useState<ProcessoCatalogo | null>(null);
  const [configuracaoEmExecucao, setConfiguracaoEmExecucao] =
    useState<ProcessoBase>();

  // D3a: abrir o processo mostra o modal de execução sem iniciar.
  function abrirProcesso(processo: ProcessoCatalogo) {
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
  const termoBusca = normalizarTexto(busca);
  const processosFiltrados = processosAtualizados.filter((processo) =>
    normalizarTexto(`${processo.nome} ${processo.descricao}`).includes(
      termoBusca
    )
  );

  return (
    <>
      <main id="conteudo-principal" tabIndex={-1} className="page-scroll">
        <PageHeader
          titulo="Processos"
          descricao="Organize suas rotinas e acompanhe cada execução."
          acao={
            <Button variant="primary" icon={Plus} onClick={onNovoProcesso}>
              Novo Processo
            </Button>
          }
        />
        <div className="page-content processos-content">
          {salvamentoSimulado && (
            <p className="ui-alert ui-alert--success" role="status">
              <CheckCircle2 size={18} aria-hidden="true" />
              <span>
                Simulação de configuração concluída. Nenhum processo foi
                persistido.
              </span>
            </p>
          )}
          <div className="catalog-toolbar">
            <div className="catalog-search">
              <Search size={16} aria-hidden="true" />
              <label htmlFor="busca-processos" className="sr-only">
                Buscar processos
              </label>
              <input
                id="busca-processos"
                type="search"
                name="busca-processos"
                className="ui-input"
                autoComplete="off"
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
                placeholder="Buscar por nome ou descrição…"
              />
            </div>
            <div className="catalog-toolbar-info">
              <span className="catalog-count" role="status">
                {processosFiltrados.length} de {processosAtualizados.length}{' '}
                processos
              </span>
              <SimulationNotice detail="Catálogo de exemplo; nada é salvo." />
            </div>
          </div>
          {processosFiltrados.length ? (
            <section
              className="process-list"
              aria-label="Processos disponíveis"
            >
              <div className="process-list-header" aria-hidden="true">
                <span>Processo</span>
                <span>Categoria</span>
                <span>Etapas</span>
                <span>Última execução</span>
                <span>Ações</span>
                <span />
              </div>
              <ul>
                {processosFiltrados.map((processo) => (
                  <LinhaProcesso
                    key={processo.id}
                    processo={processo}
                    onAbrir={() => abrirProcesso(processo)}
                    onEditar={() => onEditarProcesso(processo.id)}
                  />
                ))}
              </ul>
            </section>
          ) : (
            <div className="ui-empty catalog-empty">
              <FolderSearch size={32} aria-hidden="true" />
              <h2>Nenhum processo encontrado.</h2>
              <p>Experimente outro nome ou limpe a busca.</p>
              <Button onClick={() => setBusca('')}>Limpar busca</Button>
            </div>
          )}
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
