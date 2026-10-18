import { useEffect, useState } from 'react';
import type { ComponentType } from 'react';

import { Clock3, FolderOpen, Minus, Play, Square, X } from 'lucide-react';

type IconeProps = {
  size?: number;
  className?: string;
  strokeWidth?: number;
};

type ProcessoModal = {
  id: number;
  nome: string;
  descricao: string;
  corIcone: string;
  icone: ComponentType<IconeProps>;
};

type ExecuteProcessModalProps = {
  aberto: boolean;
  processo: ProcessoModal | null;
  onClose: () => void;
};

type CamposArquivos = {
  principal: string;
  complementar: string;
  saida: string;
};

function formatarTempo(segundos: number) {
  const horas = Math.floor(segundos / 3600);
  const minutos = Math.floor((segundos % 3600) / 60);
  const secs = segundos % 60;

  return [horas, minutos, secs]
    .map((valor) => String(valor).padStart(2, '0'))
    .join(':');
}

function ExecuteProcessModal({
  aberto,
  processo,
  onClose,
}: ExecuteProcessModalProps) {
  const [campos, setCampos] = useState<CamposArquivos>({
    principal: 'C:\\Dados\\Orgao_Referencia.xlsx',
    complementar: 'C:\\Dados\\Unidades_Complementares.xlsx',
    saida: 'C:\\Resultados\\Relatorio_Consolidado.xlsx',
  });

  const [progresso, setProgresso] = useState(0);

  const [acaoAtual, setAcaoAtual] = useState('Aguardando execução...');

  const [tempoDecorrido, setTempoDecorrido] = useState(0);

  const [logs, setLogs] = useState<string[]>([
    '[sistema] Processo pronto para execução.',
  ]);

  const [executando, setExecutando] = useState(false);

  useEffect(() => {
    if (!aberto || !processo) {
      return;
    }

    setCampos({
      principal: 'C:\\Dados\\Orgao_Referencia.xlsx',
      complementar: 'C:\\Dados\\Unidades_Complementares.xlsx',
      saida: 'C:\\Resultados\\Relatorio_Consolidado.xlsx',
    });

    setProgresso(0);
    setAcaoAtual('Aguardando execução...');
    setTempoDecorrido(0);

    setLogs(['[sistema] Processo pronto para execução.']);

    setExecutando(false);
  }, [aberto, processo]);

  useEffect(() => {
    if (!executando) {
      return;
    }

    const etapas = [
      {
        progresso: 8,
        acao: 'Carregando planilha principal...',
        log: '[14:21:03] Carregando planilha principal...',
      },
      {
        progresso: 18,
        acao: 'Planilha principal carregada.',
        log: '[14:21:05] Planilha principal carregada.',
      },
      {
        progresso: 30,
        acao: 'Carregando planilha complementar...',
        log: '[14:21:07] Carregando planilha complementar...',
      },
      {
        progresso: 42,
        acao: 'Planilha complementar carregada.',
        log: '[14:21:09] Planilha complementar carregada.',
      },
      {
        progresso: 58,
        acao: 'Validando estrutura dos dados...',
        log: '[14:21:12] Validando estrutura dos dados...',
      },
      {
        progresso: 72,
        acao: 'Processando registros...',
        log: '[14:21:16] 134.327 registros encontrados.',
      },
      {
        progresso: 86,
        acao: 'Gerando arquivo consolidado...',
        log: '[14:21:24] Gerando arquivo consolidado...',
      },
      {
        progresso: 100,
        acao: 'Salvando arquivo de resultado...',
        log: '[14:21:31] Salvando arquivo de resultado...',
      },
    ];

    let indice = 0;

    const intervaloExecucao = setInterval(() => {
      const etapa = etapas[indice];

      if (!etapa) {
        setProgresso(100);

        setAcaoAtual('Processo finalizado com sucesso.');

        setLogs((anterior) => [
          ...anterior,
          '[14:21:32] Processo finalizado com sucesso.',
        ]);

        setExecutando(false);

        clearInterval(intervaloExecucao);

        return;
      }

      setProgresso(etapa.progresso);
      setAcaoAtual(etapa.acao);

      setLogs((anterior) => [...anterior, etapa.log]);

      indice += 1;
    }, 1200);

    const intervaloTempo = setInterval(() => {
      setTempoDecorrido((anterior) => anterior + 1);
    }, 1000);

    return () => {
      clearInterval(intervaloExecucao);
      clearInterval(intervaloTempo);
    };
  }, [executando]);

  function iniciarExecucao() {
    setProgresso(0);

    setAcaoAtual('Iniciando execução...');

    setTempoDecorrido(0);

    setLogs(['[14:21:01] Iniciando execução do processo...']);

    setExecutando(true);
  }

  if (!aberto || !processo) {
    return null;
  }

  const IconeProcesso = processo.icone;

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/60
        backdrop-blur-[2px]
        p-4
      "
    >
      <div
        className="
          w-full
          max-w-[900px]
          h-[560px]
          rounded-xl
          bg-[#071827]
          shadow-2xl
          overflow-hidden
          flex
          flex-col
        "
      >
        {/* ================================================= */}
        {/* CABEÇALHO */}
        {/* ================================================= */}

        <div
          className="
            shrink-0
            flex
            items-center
            justify-between
            gap-4
            px-5
            py-4
            border-b
            border-[#16324a]
          "
        >
          <div
            className="
              flex
              items-center
              gap-4
              min-w-0
            "
          >
            <div
              className={`
                w-14
                h-14
                shrink-0
                rounded-xl
                flex
                items-center
                justify-center
                ${processo.corIcone}
              `}
            >
              <IconeProcesso size={26} strokeWidth={2.4} />
            </div>

            <div className="min-w-0">
              <h2
                className="
                  text-xl
                  font-bold
                  leading-tight
                  truncate
                  text-white
                "
              >
                {processo.nome}
              </h2>

              <p
                className="
                  mt-1
                  text-xs
                  text-slate-400
                  truncate
                "
              >
                {processo.descricao}
              </p>
            </div>
          </div>

          <div
            className="
              flex
              items-center
              gap-3
              text-slate-400
            "
          >
            <button
              type="button"
              className="
                hover:text-white
                transition-colors
              "
              aria-label="Minimizar"
            >
              <Minus size={17} />
            </button>

            <button
              type="button"
              className="
                hover:text-white
                transition-colors
              "
              aria-label="Restaurar"
            >
              <Square size={14} />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="
                hover:text-white
                transition-colors
              "
              aria-label="Fechar"
            >
              <X size={19} />
            </button>
          </div>
        </div>

        {/* ================================================= */}
        {/* CONTEÚDO */}
        {/* ================================================= */}

        <div
          className="
            flex-1
            min-h-0
            grid
            grid-cols-[1fr_1fr]
            gap-3
            p-3
          "
        >
          {/* ================================================= */}
          {/* ESQUERDA */}
          {/* ================================================= */}

          <section
            className="
              min-h-0
              rounded-lg
              border
              border-[#173249]
              bg-[#0b1c2b]
              p-4
              flex
              flex-col
            "
          >
            <div className="space-y-4">
              <CampoArquivo
                label="Planilha principal"
                value={campos.principal}
                onChange={(valor) =>
                  setCampos((anterior) => ({
                    ...anterior,
                    principal: valor,
                  }))
                }
              />

              <CampoArquivo
                label="Planilha complementar"
                value={campos.complementar}
                onChange={(valor) =>
                  setCampos((anterior) => ({
                    ...anterior,
                    complementar: valor,
                  }))
                }
              />

              <CampoArquivo
                label="Arquivo de saída"
                value={campos.saida}
                onChange={(valor) =>
                  setCampos((anterior) => ({
                    ...anterior,
                    saida: valor,
                  }))
                }
              />
            </div>

            <div className="flex-1" />

            <button
              type="button"
              onClick={iniciarExecucao}
              disabled={executando}
              className="
                mt-4
                w-full
                h-10
                shrink-0
                rounded-md
                flex
                items-center
                justify-center
                gap-2
                bg-blue-600
                text-xs
                font-semibold
                hover:bg-blue-500
                disabled:opacity-60
                disabled:cursor-not-allowed
                transition-colors
                text-white
              "
            >
              <Play size={14} fill="currentColor" />

              {executando ? 'Executando...' : 'Executar'}
            </button>
          </section>

          {/* ================================================= */}
          {/* DIREITA */}
          {/* ================================================= */}

          <div
            className="
              min-h-0
              flex
              flex-col
              gap-3
            "
          >
            {/* Progresso */}

            <section
              className="
                shrink-0
                rounded-lg
                border
                border-[#173249]
                bg-[#0b1c2b]
                p-4
              "
            >
              <h3
                className="
                  text-sm
                  font-semibold
                  text-white
                "
              >
                Progresso
              </h3>

              <div
                className="
                  mt-3
                  flex
                  items-center
                  gap-3
                "
              >
                <div
                  className="
                    h-2.5
                    flex-1
                    rounded-full
                    bg-[#14283b]
                    overflow-hidden
                  "
                >
                  <div
                    className="
                      h-full
                      rounded-full
                      bg-blue-500
                      transition-all
                      duration-500
                    "
                    style={{
                      width: `${progresso}%`,
                    }}
                  />
                </div>

                <span
                  className="
                    w-8
                    text-right
                    text-xs
                    font-semibold
                  "
                >
                  {progresso}%
                </span>
              </div>

              <p
                className="
                  mt-3
                  text-xs
                  text-slate-300
                "
              >
                {acaoAtual}
              </p>

              <div
                className="
                  mt-2
                  flex
                  items-center
                  gap-2
                  text-[11px]
                  text-slate-400
                "
              >
                <Clock3 size={14} />

                <span>Tempo decorrido: {formatarTempo(tempoDecorrido)}</span>
              </div>
            </section>

            {/* Logs */}

            <section
              className="
                flex-1
                min-h-0
                rounded-lg
                border
                border-[#173249]
                bg-[#0b1c2b]
                p-4
                flex
                flex-col
              "
            >
              <h3
                className="
                  text-sm
                  font-semibold
                  text-white
                "
              >
                Logs de execução
              </h3>

              <div
                className="
                  mt-3
                  flex-1
                  min-h-0
                  rounded-md
                  border
                  border-[#213b55]
                  bg-[#07131f]
                  p-3
                  overflow-y-auto
                  font-mono
                  text-[11px]
                  leading-5
                  text-slate-300
                "
              >
                {logs.map((log, indice) => {
                  const finalizado = log.includes('finalizado');

                  return (
                    <div
                      key={`${log}-${indice}`}
                      className={finalizado ? 'text-emerald-400' : ''}
                    >
                      {log}
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===================================================== */
/* CAMPO DE ARQUIVO */
/* ===================================================== */

type CampoArquivoProps = {
  label: string;
  value: string;
  onChange: (valor: string) => void;
};

function CampoArquivo({ label, value, onChange }: CampoArquivoProps) {
  return (
    <div>
      <label
        className="
          block
          mb-1.5
          text-xs
          font-medium
          text-slate-200
        "
      >
        {label}
      </label>

      <div
        className="
          flex
          items-center
          gap-2
        "
      >
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="
            min-w-0
            flex-1
            h-9
            rounded-md
            border
            border-[#23425e]
            bg-[#0d2133]
            px-3
            text-xs
            text-slate-200
            outline-none
            focus:border-blue-500
            transition-colors
          "
        />

        <button
          type="button"
          className="
            h-9
            px-3
            shrink-0
            rounded-md
            border
            border-[#23425e]
            bg-[#13263a]
            flex
            items-center
            justify-center
            gap-2
            text-xs
            hover:bg-[#17324b]
            transition-colors
            text-white
          "
        >
          <FolderOpen size={14} className="text-yellow-400" />
          Selecionar
        </button>
      </div>
    </div>
  );
}

export default ExecuteProcessModal;
