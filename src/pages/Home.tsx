import { useState } from 'react';

import { Clock3, Play, Wrench } from 'lucide-react';

import bannerSeduc from '../assets/seduc-banner.png';

import ExecuteProcessModal from '../components/ExecuteProcessModal';

import {
  ferramentasMaisUsadas,
  logsRecentes,
  processosDestaque,
} from '../mock/homeMock';

/* ===================================================== */
/* FUNÇÕES AUXILIARES */
/* ===================================================== */

function encontrarItemLog(tipo: string, referenciaId: number) {
  if (tipo === 'processo') {
    return processosDestaque.find((item) => item.id === referenciaId);
  }

  return ferramentasMaisUsadas.find((item) => item.id === referenciaId);
}

function StatusText({ status }: { status: string }) {
  if (status === 'concluido') {
    return <span className="text-[11px] text-emerald-500">Concluído</span>;
  }

  if (status === 'atencao') {
    return <span className="text-[11px] text-yellow-500">Atenção</span>;
  }

  return <span className="text-[11px] text-red-500">Erro</span>;
}

/* ===================================================== */
/* HOME */
/* ===================================================== */

function Home() {
  const [processoEmExecucao, setProcessoEmExecucao] = useState<
    (typeof processosDestaque)[number] | null
  >(null);

  return (
    <>
      <main
        className="
          flex-1
          min-w-0
          bg-[var(--bg-app)]
          text-[var(--text-primary)]
          overflow-y-auto
          transition-colors
          duration-200
        "
      >
        {/* ===================================================== */}
        {/* BANNER SUPERIOR */}
        {/* ===================================================== */}

        <section
          className="
    relative
    h-[230px]
    overflow-hidden
    border-b
    border-[var(--border)]
    bg-[var(--banner-bg)]
    transition-colors
    duration-200
  "
        >
          {/* Fundo base do banner */}
          <div
            className="
      absolute
      inset-0
      bg-[var(--banner-bg)]
      transition-colors
      duration-200
    "
          />

          {/* ================================================= */}
          {/* IMAGEM DA SEDUC */}
          {/* ================================================= */}

          <div
            className="
      absolute
      top-0
      bottom-0
      left-[47%]
      right-[20%]
      overflow-hidden
    "
          >
            <img
              src={bannerSeduc}
              alt="Sede da Secretaria de Estado de Educação de Mato Grosso"
              className="
        h-full
        w-auto
        max-w-none
        object-contain
      "
            />

            {/* Fade esquerdo */}
            <div
              className="
        absolute
        inset-y-0
        left-0
        w-[190px]
        pointer-events-none
        transition-colors
        duration-200
      "
              style={{
                background:
                  'linear-gradient(to right, var(--banner-fade) 0%, color-mix(in srgb, var(--banner-fade) 88%, transparent) 30%, color-mix(in srgb, var(--banner-fade) 55%, transparent) 65%, transparent 100%)',
              }}
            />

            {/* Fade direito */}
            <div
              className="
        absolute
        inset-y-0
        right-0
        w-[190px]
        pointer-events-none
        transition-colors
        duration-200
      "
              style={{
                background:
                  'linear-gradient(to left, var(--banner-fade) 0%, color-mix(in srgb, var(--banner-fade) 88%, transparent) 30%, color-mix(in srgb, var(--banner-fade) 55%, transparent) 65%, transparent 100%)',
              }}
            />
          </div>

          {/* ================================================= */}
          {/* OVERLAY DA IMAGEM */}
          {/* ================================================= */}

          <div
            className="
      absolute
      inset-0
      pointer-events-none
      transition-colors
      duration-200
    "
            style={{
              background: 'var(--banner-overlay)',
            }}
          />

          {/* ================================================= */}
          {/* TEXTO DO BANNER */}
          {/* ================================================= */}

          <div
            className="
      relative
      z-20
      h-full
      flex
      flex-col
      justify-center
      px-9
    "
          >
            <div className="max-w-[580px]">
              <h1
                className="
          text-[36px]
          xl:text-[40px]
          font-bold
          tracking-tight
          leading-tight
          text-[var(--text-primary)]
          transition-colors
        "
              >
                Bem-vindo ao{' '}
                <span
                  className="
            transition-colors
          "
                  style={{
                    color: 'var(--banner-accent)',
                  }}
                >
                  DataHub!
                </span>
              </h1>

              <p
                className="
          mt-3
          max-w-[560px]
          text-[15px]
          leading-6
          text-[var(--text-secondary)]
          transition-colors
        "
              >
                Centralize processos, automatize rotinas e facilite a gestão de
                dados em planilhas com mais organização e agilidade.
              </p>
            </div>
          </div>

          {/* ================================================= */}
          {/* FRASE DA DIREITA */}
          {/* ================================================= */}

          <div
            className="
      absolute
      z-20
      right-8
      xl:right-12
      top-1/2
      -translate-y-1/2
      hidden
      xl:block
      text-right
      max-w-[220px]
    "
          >
            <p
              className="
        text-[11px]
        tracking-[0.34em]
        leading-[1.8]
        font-medium
        text-[var(--text-primary)]
        transition-colors
      "
            >
              INTERFACE QUE
              <br />
              ORGANIZA PROCESSOS
              <br />
              QUE TRANSFORMAM
            </p>

            <div className="flex justify-end mt-3">
              <div className="w-10 h-[3px] bg-emerald-500" />
              <div className="w-10 h-[3px] bg-yellow-400" />
              <div className="w-10 h-[3px] bg-blue-500" />
            </div>
          </div>
        </section>

        {/* ===================================================== */}
        {/* CONTEÚDO PRINCIPAL */}
        {/* ===================================================== */}

        <div className="p-6">
          <div
            className="
              grid
              grid-cols-1
              xl:grid-cols-[minmax(0,1fr)_340px]
              gap-6
            "
          >
            {/* ================================================= */}
            {/* COLUNA PRINCIPAL */}
            {/* ================================================= */}

            <div className="min-w-0 space-y-8">
              {/* ================================================= */}
              {/* PROCESSOS EM DESTAQUE */}
              {/* ================================================= */}

              <section>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-400 text-lg">★</span>

                    <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                      Processos em destaque
                    </h2>
                  </div>

                  <button
                    type="button"
                    className="
                      text-sm
                      text-blue-500
                      hover:text-blue-400
                      transition
                    "
                  >
                    Ver todos
                  </button>
                </div>

                <div
                  className="
                    grid
                    grid-cols-1
                    md:grid-cols-2
                    2xl:grid-cols-4
                    gap-4
                  "
                >
                  {processosDestaque.slice(0, 4).map((processo) => {
                    const Icone = processo.icone;

                    return (
                      <article
                        key={processo.id}
                        className="
                          group
                          min-h-[210px]
                          flex
                          flex-col
                          bg-[var(--bg-card)]
                          border
                          border-[var(--border)]
                          rounded-xl
                          p-4
                          hover:border-blue-500/70
                          transition-colors
                        "
                      >
                        {/* Ícone */}
                        <div
                          className={`
                            w-11
                            h-11
                            rounded-lg
                            flex
                            items-center
                            justify-center
                            text-white
                            ${processo.corIcone}
                          `}
                        >
                          <Icone size={22} strokeWidth={2.4} />
                        </div>

                        {/* Nome */}
                        <h3
                          className="
                            mt-4
                            font-semibold
                            text-[15px]
                            text-[var(--text-primary)]
                          "
                        >
                          {processo.nome}
                        </h3>

                        {/* Descrição */}
                        <p
                          className="
                            mt-2
                            text-xs
                            leading-5
                            text-[var(--text-muted)]
                            flex-1
                          "
                        >
                          {processo.descricao}
                        </p>

                        {/* Executar */}
                        <button
                          type="button"
                          onClick={() => setProcessoEmExecucao(processo)}
                          className="
                            mt-4
                            w-full
                            h-9
                            rounded-md
                            flex
                            items-center
                            justify-center
                            gap-2
                            text-xs
                            font-medium
                            text-[var(--text-primary)]
                            bg-[var(--hover)]
                            border
                            border-[var(--border)]
                            hover:bg-blue-600
                            hover:border-blue-500
                            hover:text-white
                            transition
                          "
                        >
                          <Play size={13} fill="currentColor" />
                          Executar
                        </button>
                      </article>
                    );
                  })}
                </div>
              </section>

              {/* ================================================= */}
              {/* FERRAMENTAS */}
              {/* ================================================= */}

              <section>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Wrench size={18} className="text-cyan-500" />

                    <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                      Ferramentas mais utilizadas
                    </h2>
                  </div>

                  <button
                    type="button"
                    className="
                      text-sm
                      text-blue-500
                      hover:text-blue-400
                      transition
                    "
                  >
                    Ver todas
                  </button>
                </div>

                <div
                  className="
                    grid
                    grid-cols-1
                    sm:grid-cols-2
                    lg:grid-cols-3
                    2xl:grid-cols-4
                    gap-4
                  "
                >
                  {ferramentasMaisUsadas.slice(0, 8).map((ferramenta) => {
                    const Icone = ferramenta.icone;

                    return (
                      <article
                        key={ferramenta.id}
                        className="
                            min-h-[160px]
                            flex
                            flex-col
                            bg-[var(--bg-card)]
                            border
                            border-[var(--border)]
                            rounded-xl
                            p-4
                            hover:border-cyan-500/60
                            transition-colors
                          "
                      >
                        {/* Ícone */}
                        <div
                          className={`
                              w-9
                              h-9
                              rounded-lg
                              flex
                              items-center
                              justify-center
                              text-white
                              ${ferramenta.corIcone}
                            `}
                        >
                          <Icone size={18} strokeWidth={2.4} />
                        </div>

                        {/* Nome */}
                        <h3
                          className="
                              mt-3
                              text-sm
                              font-semibold
                              text-[var(--text-primary)]
                            "
                        >
                          {ferramenta.nome}
                        </h3>

                        {/* Descrição */}
                        <p
                          className="
                              mt-1
                              text-xs
                              leading-5
                              text-[var(--text-muted)]
                              flex-1
                            "
                        >
                          {ferramenta.descricao}
                        </p>

                        {/* Abrir */}
                        <button
                          type="button"
                          className="
                              mt-3
                              h-8
                              flex
                              items-center
                              justify-center
                              gap-2
                              rounded-md
                              bg-[var(--hover)]
                              border
                              border-[var(--border)]
                              text-xs
                              text-[var(--text-primary)]
                              hover:bg-cyan-600
                              hover:text-white
                              transition
                            "
                        >
                          <Play size={11} fill="currentColor" />
                          Abrir
                        </button>
                      </article>
                    );
                  })}
                </div>
              </section>
            </div>

            {/* ================================================= */}
            {/* LOGS DE EXECUÇÃO */}
            {/* ================================================= */}

            <aside
              className="
                bg-[var(--bg-card-secondary)]
                border
                border-[var(--border)]
                rounded-xl
                overflow-hidden
                self-stretch
                transition-colors
              "
            >
              {/* Cabeçalho */}
              <div
                className="
                  h-14
                  px-5
                  flex
                  items-center
                  justify-between
                  border-b
                  border-[var(--border)]
                "
              >
                <div className="flex items-center gap-2">
                  <Clock3 size={18} className="text-[var(--text-secondary)]" />

                  <h2
                    className="
                      font-semibold
                      text-[var(--text-primary)]
                    "
                  >
                    Logs de Execução
                  </h2>
                </div>

                <button
                  type="button"
                  className="
                    text-xs
                    text-blue-500
                    hover:text-blue-400
                  "
                >
                  Ver todos
                </button>
              </div>

              {/* Logs */}
              <div className="divide-y divide-[var(--border)]">
                {logsRecentes.map((log) => {
                  const item = encontrarItemLog(log.tipo, log.referenciaId);

                  if (!item) {
                    return null;
                  }

                  const Icone = item.icone;

                  return (
                    <div
                      key={log.id}
                      className="
                        px-4
                        py-4
                        flex
                        gap-3
                        hover:bg-[var(--hover)]
                        transition
                      "
                    >
                      {/* Ícone */}
                      <div
                        className={`
                          w-9
                          h-9
                          shrink-0
                          rounded-lg
                          flex
                          items-center
                          justify-center
                          text-white
                          ${item.corIcone}
                        `}
                      >
                        <Icone size={18} strokeWidth={2.4} />
                      </div>

                      {/* Informações */}
                      <div className="min-w-0 flex-1">
                        <div
                          className="
                            flex
                            items-start
                            justify-between
                            gap-3
                          "
                        >
                          <p
                            className="
                              text-[13px]
                              font-medium
                              truncate
                              text-[var(--text-primary)]
                            "
                          >
                            {item.nome}
                          </p>

                          <StatusText status={log.status} />
                        </div>

                        {/* Detalhe + duração */}
                        <p
                          className="
                            mt-1
                            text-xs
                            text-[var(--text-secondary)]
                          "
                        >
                          {log.detalhe}

                          <span className="text-[var(--text-muted)]">
                            {' • '}
                          </span>

                          <span className="text-[var(--text-muted)]">
                            {log.duracao}
                          </span>
                        </p>

                        {/* Horário */}
                        <p
                          className="
                            mt-1
                            text-[11px]
                            text-[var(--text-muted)]
                          "
                        >
                          {log.horario}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </aside>
          </div>
        </div>
      </main>

      {/* ===================================================== */}
      {/* MODAL DE EXECUÇÃO */}
      {/* ===================================================== */}

      <ExecuteProcessModal
        aberto={!!processoEmExecucao}
        processo={processoEmExecucao}
        onClose={() => setProcessoEmExecucao(null)}
      />
    </>
  );
}

export default Home;
