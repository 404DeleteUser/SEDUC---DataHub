import { useEffect, useId, useRef, useState } from 'react';
import type { ComponentType } from 'react';
import type { ProcessoBase } from '../types/processo';
import {
  CheckCircle2,
  Clock3,
  FileSpreadsheet,
  FolderOpen,
  Info,
  Play,
  TerminalSquare,
  X,
} from 'lucide-react';

type ProcessoModal = {
  id: number;
  nome: string;
  descricao: string;
  corIcone: string;
  icone: ComponentType<{
    size?: number;
    className?: string;
    strokeWidth?: number;
  }>;
};
type CamposArquivos = {
  principal: string;
  complementar: string;
  saida: string;
};
const camposIniciais: CamposArquivos = {
  principal: 'C:\\Dados\\Orgao_Referencia.xlsx',
  complementar: 'C:\\Dados\\Unidades_Complementares.xlsx',
  saida: 'C:\\Resultados\\Relatorio_Consolidado.xlsx',
};
const etapasSimuladas = [
  { progresso: 8, acao: 'Carregando planilha principal…' },
  { progresso: 18, acao: 'Planilha principal carregada.' },
  { progresso: 30, acao: 'Carregando planilha complementar…' },
  { progresso: 42, acao: 'Planilha complementar carregada.' },
  { progresso: 58, acao: 'Validando estrutura dos dados…' },
  { progresso: 72, acao: 'Processando registros…' },
  { progresso: 86, acao: 'Gerando arquivo consolidado…' },
  { progresso: 100, acao: 'Processo finalizado com sucesso.' },
];
function formatarTempo(segundos: number) {
  return [
    Math.floor(segundos / 3600),
    Math.floor((segundos % 3600) / 60),
    segundos % 60,
  ]
    .map((valor) => String(valor).padStart(2, '0'))
    .join(':');
}
export default function ExecuteProcessModal({
  aberto,
  processo,
  configuracao,
  onClose,
  executarAoAbrir = false,
}: {
  aberto: boolean;
  processo: ProcessoModal | null;
  configuracao?: ProcessoBase;
  onClose: () => void;
  executarAoAbrir?: boolean;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const logsRef = useRef<HTMLDivElement>(null);
  const tituloId = useId();
  const [campos, setCampos] = useState<CamposArquivos>(camposIniciais);
  const [progresso, setProgresso] = useState(0);
  const [acaoAtual, setAcaoAtual] = useState('Aguardando execução…');
  const [tempoDecorrido, setTempoDecorrido] = useState(0);
  const [logs, setLogs] = useState<string[]>([
    '[simulação] Processo pronto para execução.',
  ]);
  const [executando, setExecutando] = useState(false);
  const [erro, setErro] = useState('');
  useEffect(() => {
    if (!aberto || !processo) {
      setExecutando(false);
      return;
    }
    const nomeSaida = configuracao?.saida.nome.trim() ?? '';
    const pastaDestino = configuracao?.saida.pastaDestino.trim() ?? '';
    const arquivoComplementar =
      configuracao?.arquivosPrincipais.principal2 ??
      configuracao?.auxiliares.find((auxiliar) => auxiliar.arquivo)?.arquivo ??
      null;
    setCampos(
      configuracao
        ? {
            principal: configuracao.arquivosPrincipais.principal1?.name ?? '',
            complementar: arquivoComplementar?.name ?? '',
            saida:
              [pastaDestino, nomeSaida].filter(Boolean).join('\\') ||
              camposIniciais.saida,
          }
        : camposIniciais
    );
    setProgresso(0);
    setTempoDecorrido(0);
    setExecutando(executarAoAbrir);
    setErro('');
    setAcaoAtual(
      executarAoAbrir ? 'Iniciando execução…' : 'Aguardando execução…'
    );
    setLogs([
      executarAoAbrir
        ? '[simulação] Iniciando execução do processo…'
        : '[simulação] Processo pronto para execução.',
    ]);
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => {
      dialog?.close();
    };
  }, [aberto, processo, configuracao, executarAoAbrir]);
  useEffect(() => {
    if (!executando) return;
    let indice = 0;
    const inicio = Date.now();
    const intervalo = setInterval(() => {
      const etapa = etapasSimuladas[indice++];
      setTempoDecorrido(Math.floor((Date.now() - inicio) / 1000));
      setProgresso(etapa.progresso);
      setAcaoAtual(etapa.acao);
      setLogs((anteriores) => [...anteriores, `[simulação] ${etapa.acao}`]);
      if (indice === etapasSimuladas.length) setExecutando(false);
    }, 1200);
    return () => clearInterval(intervalo);
  }, [executando]);
  useEffect(() => {
    if (logsRef.current)
      logsRef.current.scrollTop = logsRef.current.scrollHeight;
  }, [logs]);
  function iniciarExecucao() {
    if (!campos.principal.trim() || !campos.saida.trim()) {
      setErro(
        'Informe a planilha principal e o arquivo de saída para demonstrar a execução.'
      );
      return;
    }
    setErro('');
    setProgresso(0);
    setTempoDecorrido(0);
    setAcaoAtual('Iniciando execução…');
    setLogs(['[simulação] Iniciando execução do processo…']);
    setExecutando(true);
  }
  if (!aberto || !processo) return null;
  const Icone = processo.icone;
  const concluido = progresso === 100 && !executando;
  return (
    <dialog
      ref={dialogRef}
      className="execution-modal native-dialog"
      aria-labelledby={tituloId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <header className="modal-header">
        <div className={`entity-icon ${processo.corIcone}`}>
          <Icone size={24} />
        </div>
        <div className="min-w-0">
          <h2 id={tituloId}>{processo.nome}</h2>
          <p>{processo.descricao}</p>
        </div>
        <button
          className="icon-button"
          onClick={onClose}
          aria-label="Fechar execução"
        >
          <X size={19} />
        </button>
      </header>
      <div className="execution-body">
        <section className="execution-inputs">
          <div className="flex items-center justify-between gap-3">
            <h3>Arquivos do processo</h3>
            <FileSpreadsheet
              size={17}
              className="text-[var(--text-muted)]"
              aria-hidden="true"
            />
          </div>
          <p>Configure as entradas e a saída para visualizar a simulação.</p>
          <CampoArquivo
            label="Planilha principal"
            value={campos.principal}
            disabled={executando}
            onChange={(principal) =>
              setCampos((anterior) => ({ ...anterior, principal }))
            }
          />
          <CampoArquivo
            label="Planilha complementar"
            value={campos.complementar}
            disabled={executando}
            onChange={(complementar) =>
              setCampos((anterior) => ({ ...anterior, complementar }))
            }
          />
          <CampoArquivo
            label="Arquivo de saída"
            value={campos.saida}
            disabled={executando}
            saida
            onChange={(saida) =>
              setCampos((anterior) => ({ ...anterior, saida }))
            }
          />
          {erro && (
            <p role="alert" className="inline-feedback">
              {erro}
            </p>
          )}
          <button
            className="primary-button"
            disabled={executando}
            onClick={iniciarExecucao}
          >
            <Play size={14} />
            {executando
              ? 'Executando…'
              : concluido
                ? 'Executar novamente'
                : 'Executar'}
          </button>
        </section>
        <section className="execution-status">
          <div>
            <div className="execution-status-top">
              <h3>Progresso</h3>
              <span className="demo-badge">Simulação</span>
            </div>
            <div className="progress-number">
              {progresso}
              <small>%</small>
            </div>
            <div
              className="progress-track"
              role="progressbar"
              aria-label="Progresso da simulação"
              aria-valuenow={progresso}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <span style={{ transform: `scaleX(${progresso / 100})` }} />
            </div>
            <p
              className={`execution-action ${concluido ? 'text-[var(--success)]' : ''}`}
              role="status"
            >
              {concluido && <CheckCircle2 size={13} className="inline mr-1" />}
              {acaoAtual}
            </p>
            <div className="execution-timer">
              <Clock3 size={13} />
              Tempo decorrido: {formatarTempo(tempoDecorrido)}
            </div>
          </div>
          <div className="execution-logs">
            <h3 className="flex items-center gap-2">
              <TerminalSquare size={15} aria-hidden="true" />
              Logs de execução
            </h3>
            <div
              ref={logsRef}
              className="log-output"
              role="log"
              aria-label="Logs simulados"
            >
              {logs.map((log, indice) => (
                <div
                  key={indice}
                  className={
                    log.includes('sucesso') ? 'text-[var(--success)]' : ''
                  }
                >
                  {log}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
      <footer className="modal-footer">
        <Info size={13} aria-hidden="true" />
        Execução demonstrativa. Nenhum arquivo é processado ou gerado.
      </footer>
    </dialog>
  );
}
function CampoArquivo({
  label,
  value,
  onChange,
  disabled,
  saida = false,
}: {
  label: string;
  value: string;
  onChange: (valor: string) => void;
  disabled: boolean;
  saida?: boolean;
}) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="execution-file">
      <label htmlFor={id}>{label}</label>
      <div className="execution-field">
        <input
          id={id}
          name={id}
          autoComplete="off"
          spellCheck={false}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
        />
        {!saida && (
          <>
            <button
              type="button"
              className="icon-button"
              aria-label={`Selecionar ${label.toLowerCase()}`}
              title="Selecionar arquivo no navegador"
              disabled={disabled}
              onClick={() => inputRef.current?.click()}
            >
              <FolderOpen size={17} />
            </button>
            <input
              ref={inputRef}
              type="file"
              tabIndex={-1}
              hidden
              aria-label={`Arquivo para ${label.toLowerCase()}`}
              onChange={(event) => {
                const arquivo = event.target.files?.[0];
                if (arquivo) onChange(arquivo.name);
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}
