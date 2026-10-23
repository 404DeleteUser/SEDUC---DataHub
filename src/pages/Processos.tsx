import { useState } from 'react';
import {
  CheckCircle2,
  Clock3,
  FileSpreadsheet,
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
import { iconesDisponiveis } from './novo-processo/constantes';
import type { ProcessoBase } from '../types/processo';

type ProcessoCatalogo = (typeof processosMock)[number] & {
  /** Cor personalizada (fora das cores-padrão) de um processo criado na sessão. */
  corHex?: string;
};

// Cores do Novo Processo (coresPadrao) com as classes de identidade equivalentes.
const classePorCor: Record<string, string> = {
  '#059669': 'bg-emerald-600 text-white',
  '#7c3aed': 'bg-violet-600 text-white',
  '#ea580c': 'bg-orange-600 text-white',
  '#0891b2': 'bg-cyan-600 text-white',
  '#2563eb': 'bg-blue-600 text-white',
  '#dc2626': 'bg-red-600 text-white',
  '#db2777': 'bg-pink-600 text-white',
};

/** Processos criados nesta sessão (ainda não persistidos em disco). */
function processosNovos(
  configurados: Record<number, ProcessoBase>
): ProcessoCatalogo[] {
  return Object.entries(configurados)
    .filter(([id]) => !processosMock.some((item) => item.id === Number(id)))
    .map(([id, configuracao]) => ({
      id: Number(id),
      nome: configuracao.nome,
      descricao: configuracao.descricao,
      icone:
        iconesDisponiveis.find(
          (item) => item.id === configuracao.identidadeVisual.icone
        )?.icone ?? FileSpreadsheet,
      corIcone:
        classePorCor[configuracao.identidadeVisual.cor.toLowerCase()] ??
        // Reserva para o modal de execução, que só usa a classe.
        'bg-slate-600 text-white',
      corHex: classePorCor[configuracao.identidadeVisual.cor.toLowerCase()]
        ? undefined
        : configuracao.identidadeVisual.cor,
      etapas: configuracao.etapas.length,
      ultimaExecucao: 'Nunca executado',
      categoria: 'Novo',
      favorito: false,
    }));
}

function normalizarTexto(texto: string) {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

function LinhaProcesso({
  processo,
  onAbrir,
  onExecutar,
  onEditar,
}: {
  processo: ProcessoCatalogo;
  onAbrir: () => void;
  onExecutar: () => void;
  onEditar: () => void;
}) {
  const Icone = processo.icone;
  return (
    <li className="process-row">
      <ProcessCardAction nome={processo.nome} onAbrir={onAbrir} />
      <div className="process-row-main">
        <span
          className={`process-row-icon ${processo.corIcone}`}
          style={processo.corHex ? { background: processo.corHex } : undefined}
        >
          <Icone size={18} aria-hidden="true" />
        </span>
        <div className="process-row-text">
          <h2>{processo.nome}</h2>
          <p>{processo.descricao}</p>
        </div>
      </div>
      <div className="process-row-meta">
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
      <button
        type="button"
        className="run-hint"
        aria-label={`Executar ${processo.nome}`}
        onClick={onExecutar}
      >
        <Play size={14} aria-hidden="true" />
        Executar
      </button>
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

  const [executarAoAbrir, setExecutarAoAbrir] = useState(false);

  // Clicar na linha só abre o modal; o botão Executar abre e já executa.
  function abrirProcesso(processo: ProcessoCatalogo, executar = false) {
    setConfiguracaoEmExecucao(processosConfigurados[processo.id]);
    setExecutarAoAbrir(executar);
    setProcessoEmExecucao(processo);
  }

  const processosAtualizados = [
    ...processosMock.map((processo) => {
      const configuracao = processosConfigurados[processo.id];
      return configuracao
        ? {
            ...processo,
            nome: configuracao.nome,
            descricao: configuracao.descricao,
            etapas: configuracao.etapas.length,
          }
        : processo;
    }),
    ...processosNovos(processosConfigurados),
  ];
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
                Processo salvo nesta sessão. Nenhum processo foi persistido em
                disco.
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
              <SimulationNotice detail="Processos de exemplo e criados nesta sessão; nada é gravado em disco." />
            </div>
          </div>
          {processosFiltrados.length ? (
            <section
              className="process-list"
              aria-label="Processos disponíveis"
            >
              <div className="process-list-header" aria-hidden="true">
                <span>Processo</span>
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
                    onExecutar={() => abrirProcesso(processo, true)}
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
        executarAoAbrir={executarAoAbrir}
        onClose={() => setProcessoEmExecucao(null)}
      />
    </>
  );
}
