import { useEffect, useId, useRef, useState } from 'react';
import type { ComponentType } from 'react';
import type { ProcessoBase } from '../types/processo';
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  FileSpreadsheet,
  FolderOpen,
  Info,
  Play,
  TerminalSquare,
  X,
} from 'lucide-react';
import { Button, Field, IconButton, SimulationNotice } from './ui';

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
const camposVazios: CamposArquivos = {
  principal: '',
  complementar: '',
  saida: '',
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
const INTERVALO_ETAPA_MS = 1200;
const MENSAGEM_ENTRADAS_OBRIGATORIAS =
  'Informe a planilha principal e o arquivo de saída para executar a simulação.';
const PLACEHOLDER_ARQUIVO = 'Selecione o arquivo ou cole o caminho';

function formatarTempo(segundos: number) {
  return [
    Math.floor(segundos / 3600),
    Math.floor((segundos % 3600) / 60),
    segundos % 60,
  ]
    .map((valor) => String(valor).padStart(2, '0'))
    .join(':');
}

/** Sem configuração os campos abrem vazios: nenhum caminho fictício (D3b). */
function camposDaConfiguracao(configuracao?: ProcessoBase): CamposArquivos {
  if (!configuracao) return camposVazios;
  const nomeSaida = configuracao.saida.nome.trim();
  const pastaDestino = configuracao.saida.pastaDestino.trim();
  const arquivoComplementar =
    configuracao.arquivosPrincipais.principal2 ??
    configuracao.auxiliares.find((auxiliar) => auxiliar.arquivo)?.arquivo ??
    null;
  return {
    principal: configuracao.arquivosPrincipais.principal1?.name ?? '',
    complementar: arquivoComplementar?.name ?? '',
    saida: [pastaDestino, nomeSaida].filter(Boolean).join('\\'),
  };
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
  const erroId = useId();
  const [campos, setCampos] = useState<CamposArquivos>(camposVazios);
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
    const camposIniciais = camposDaConfiguracao(configuracao);
    // Abrir já executando continua sujeito à validação das entradas (D3b).
    const iniciar =
      executarAoAbrir &&
      Boolean(camposIniciais.principal.trim() && camposIniciais.saida.trim());
    setCampos(camposIniciais);
    setProgresso(0);
    setTempoDecorrido(0);
    setExecutando(iniciar);
    setErro(executarAoAbrir && !iniciar ? MENSAGEM_ENTRADAS_OBRIGATORIAS : '');
    setAcaoAtual(iniciar ? 'Iniciando execução…' : 'Aguardando execução…');
    setLogs([
      iniciar
        ? '[simulação] Iniciando execução do processo…'
        : '[simulação] Processo pronto para execução.',
    ]);
    const dialog = dialogRef.current;
    // Guarda quem abriu o modal: o <dialog> sai do DOM antes de close(), então
    // o navegador não devolve o foco sozinho.
    const gatilho =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    dialog?.showModal();
    return () => {
      dialog?.close();
      if (gatilho?.isConnected) gatilho.focus();
    };
  }, [aberto, processo, configuracao, executarAoAbrir]);

  useEffect(() => {
    if (!executando) return;
    let indice = 0;
    const inicio = Date.now();
    const intervalo = setInterval(() => {
      // Vários ticks podem chegar juntos (timers agrupados em janelas em
      // segundo plano) antes da limpeza do efeito: nunca ler além do fim.
      if (indice >= etapasSimuladas.length) {
        clearInterval(intervalo);
        return;
      }
      const etapa = etapasSimuladas[indice];
      indice += 1;
      setTempoDecorrido(Math.floor((Date.now() - inicio) / 1000));
      setProgresso(etapa.progresso);
      setAcaoAtual(etapa.acao);
      setLogs((anteriores) => [...anteriores, `[simulação] ${etapa.acao}`]);
      if (indice >= etapasSimuladas.length) {
        clearInterval(intervalo);
        setExecutando(false);
      }
    }, INTERVALO_ETAPA_MS);
    return () => clearInterval(intervalo);
  }, [executando]);

  useEffect(() => {
    if (logsRef.current)
      logsRef.current.scrollTop = logsRef.current.scrollHeight;
  }, [logs]);

  function atualizarCampo(campo: keyof CamposArquivos, valor: string) {
    setCampos((anterior) => ({ ...anterior, [campo]: valor }));
  }

  function iniciarExecucao() {
    if (!campos.principal.trim() || !campos.saida.trim()) {
      setErro(MENSAGEM_ENTRADAS_OBRIGATORIAS);
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
  const rotuloExecutar = executando
    ? 'Executando…'
    : concluido
      ? 'Executar novamente'
      : 'Executar';
  const invalido = (valor: string) =>
    erro && !valor.trim() ? true : undefined;

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
      <header className="execution-header">
        <div className={`entity-icon ${processo.corIcone}`} aria-hidden="true">
          <Icone size={20} />
        </div>
        <div className="execution-header__text">
          <h2 id={tituloId}>{processo.nome}</h2>
          <p>{processo.descricao}</p>
        </div>
        <IconButton icon={X} label="Fechar execução" onClick={onClose} />
      </header>

      <div className="execution-body">
        <section
          className="execution-inputs"
          aria-labelledby={`${tituloId}-arquivos`}
        >
          <div className="execution-section-title">
            <FileSpreadsheet size={16} aria-hidden="true" />
            <h3 id={`${tituloId}-arquivos`}>Arquivos do processo</h3>
          </div>
          <p className="execution-hint">
            Informe a planilha principal e o arquivo de saída. A planilha
            complementar é opcional.
          </p>
          <CampoArquivo
            label="Planilha principal"
            value={campos.principal}
            disabled={executando}
            invalido={invalido(campos.principal)}
            erroId={erro ? erroId : undefined}
            onChange={(valor) => atualizarCampo('principal', valor)}
          />
          <CampoArquivo
            label="Planilha complementar"
            value={campos.complementar}
            disabled={executando}
            onChange={(valor) => atualizarCampo('complementar', valor)}
          />
          <CampoArquivo
            label="Arquivo de saída"
            value={campos.saida}
            disabled={executando}
            invalido={invalido(campos.saida)}
            erroId={erro ? erroId : undefined}
            saida
            onChange={(valor) => atualizarCampo('saida', valor)}
          />
          {erro && (
            <p id={erroId} role="alert" className="ui-alert ui-alert--error">
              <AlertCircle size={16} aria-hidden="true" />
              <span>{erro}</span>
            </p>
          )}
          <Button
            variant="primary"
            icon={Play}
            className="execution-run"
            disabled={executando}
            onClick={iniciarExecucao}
          >
            {rotuloExecutar}
          </Button>
        </section>

        <section className="execution-status">
          <div className="execution-progress">
            <div className="execution-section-title">
              <h3>Progresso</h3>
              <SimulationNotice detail="Nenhum arquivo é processado ou gerado." />
            </div>
            <p className="execution-percent">
              {progresso}
              <span>%</span>
            </p>
            <div
              className="execution-track"
              role="progressbar"
              aria-label="Progresso da simulação"
              aria-valuenow={progresso}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <span style={{ transform: `scaleX(${progresso / 100})` }} />
            </div>
            <p
              className={`execution-action${concluido ? ' execution-action--done' : ''}`}
              role="status"
            >
              {concluido && <CheckCircle2 size={16} aria-hidden="true" />}
              <span>{acaoAtual}</span>
            </p>
            <p className="execution-timer">
              <Clock3 size={14} aria-hidden="true" />
              Tempo decorrido:{' '}
              <span className="execution-timer__value">
                {formatarTempo(tempoDecorrido)}
              </span>
            </p>
          </div>

          <div className="execution-logs">
            <div className="execution-section-title">
              <TerminalSquare size={16} aria-hidden="true" />
              <h3>Logs</h3>
            </div>
            <div
              ref={logsRef}
              className="execution-log"
              role="log"
              tabIndex={0}
              aria-label="Logs da simulação"
              aria-live="polite"
            >
              {logs.map((log, indice) => (
                <div
                  key={indice}
                  className={
                    log.includes('sucesso')
                      ? 'execution-log__line--success'
                      : undefined
                  }
                >
                  {log}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <footer className="execution-footer">
        <Info size={14} aria-hidden="true" />
        Execução simulada. Nenhum arquivo é processado ou gerado.
      </footer>
    </dialog>
  );
}

function CampoArquivo({
  label,
  value,
  onChange,
  disabled,
  invalido,
  erroId,
  saida = false,
}: {
  label: string;
  value: string;
  onChange: (valor: string) => void;
  disabled: boolean;
  invalido?: true;
  erroId?: string;
  saida?: boolean;
}) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <Field id={id} label={label}>
      {(controle) => (
        <div className="execution-field">
          <input
            {...controle}
            name={id}
            className="ui-input ui-input--mono"
            autoComplete="off"
            spellCheck={false}
            placeholder={PLACEHOLDER_ARQUIVO}
            value={value}
            disabled={disabled}
            aria-invalid={invalido}
            aria-describedby={invalido ? erroId : undefined}
            onChange={(event) => onChange(event.target.value)}
          />
          {!saida && (
            <>
              <IconButton
                icon={FolderOpen}
                label={`Selecionar ${label.toLowerCase()}`}
                variant="soft"
                disabled={disabled}
                onClick={() => inputRef.current?.click()}
              />
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
      )}
    </Field>
  );
}
