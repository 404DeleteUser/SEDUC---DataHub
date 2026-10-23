import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, TerminalSquare } from 'lucide-react';

const INTERVALO_PASSO_MS = 700;

/** Avança uma lista de mensagens como uma simulação de execução. */
export function useExecucaoSimulada() {
  const [passos, setPassos] = useState<string[]>([]);
  const [concluidos, setConcluidos] = useState(0);
  const [cancelado, setCancelado] = useState(false);
  const executando =
    passos.length > 0 && concluidos < passos.length && !cancelado;

  useEffect(() => {
    if (!executando) return;
    const intervalo = setInterval(() => {
      // Ticks acumulados (janela em segundo plano) nunca passam do fim.
      setConcluidos((atual) => Math.min(atual + 1, passos.length));
    }, INTERVALO_PASSO_MS);
    return () => clearInterval(intervalo);
  }, [executando, passos.length]);

  return {
    executando,
    iniciado: passos.length > 0,
    cancelado,
    progresso: passos.length
      ? Math.round((concluidos / passos.length) * 100)
      : 0,
    logs: passos.slice(0, concluidos),
    iniciar: (mensagens: string[]) => {
      setCancelado(false);
      setConcluidos(0);
      setPassos(mensagens);
    },
    cancelar: () => setCancelado(true),
  };
}

export function ExecucaoSimulada({
  progresso,
  logs,
  executando,
  cancelado,
}: {
  progresso: number;
  logs: string[];
  executando: boolean;
  cancelado: boolean;
}) {
  const logRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logs, cancelado]);
  const concluido = progresso === 100 && !executando && !cancelado;
  const acao = cancelado
    ? 'Cancelado: a execução foi interrompida.'
    : (logs[logs.length - 1] ?? 'Iniciando execução…');

  return (
    <div className="ferramenta-execucao">
      <div className="ferramenta-execucao__topo">
        <span className="ferramenta-execucao__numero">
          {progresso}
          <small>%</small>
        </span>
        <p className={concluido ? 'is-concluido' : undefined}>
          {concluido && <CheckCircle2 size={14} aria-hidden="true" />}
          {acao}
        </p>
      </div>
      <div
        className="ferramenta-execucao__barra"
        role="progressbar"
        aria-label="Progresso da simulação"
        aria-valuenow={progresso}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <span style={{ transform: `scaleX(${progresso / 100})` }} />
      </div>
      <p className="ferramenta-execucao__rotulo">
        <TerminalSquare size={14} aria-hidden="true" /> Logs
      </p>
      <div
        ref={logRef}
        className="ferramenta-execucao__log"
        role="log"
        aria-label="Logs da simulação"
        aria-live="polite"
        tabIndex={0}
      >
        {logs.map((linha, indice) => (
          <div key={indice}>[simulação] {linha}</div>
        ))}
        {cancelado && (
          <div>
            [simulação] Execução cancelada pelo usuário. Nenhum arquivo de saída
            foi gravado.
          </div>
        )}
      </div>
    </div>
  );
}
