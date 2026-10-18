import { useState } from 'react';

import {
  Clock3,
  Plus,
  ListChecks,
  Pencil,
  Play,
  Search,
  Trash2,
} from 'lucide-react';

import ExecuteProcessModal from '../components/ExecuteProcessModal';
import { processosMock } from '../mock/processosMock';

/* ========================================================= */
/* NORMALIZAÇÃO DA BUSCA */
/* ========================================================= */

function normalizarTexto(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ç/g, 'c')
    .replace(/Ç/g, 'C')
    .toLowerCase();
}

/* ========================================================= */
/* PROPS */
/* ========================================================= */

type ProcessosProps = {
  onNovoProcesso: () => void;
};

/* ========================================================= */
/* PÁGINA DE PROCESSOS */
/* ========================================================= */

function Processos({ onNovoProcesso }: ProcessosProps) {
  /* ======================================================= */
  /* ESTADOS */
  /* ======================================================= */

  const [busca, setBusca] = useState('');

  const [processoEmExecucao, setProcessoEmExecucao] = useState<
    (typeof processosMock)[number] | null
  >(null);

  /* ======================================================= */
  /* BUSCA */
  /* ======================================================= */

  const buscaNormalizada = normalizarTexto(busca);

  const processosFiltrados = processosMock.filter((processo) => {
    const nomeNormalizado = normalizarTexto(processo.nome);
    const descricaoNormalizada = normalizarTexto(processo.descricao);

    return (
      nomeNormalizado.includes(buscaNormalizada) ||
      descricaoNormalizada.includes(buscaNormalizada)
    );
  });

  /* ======================================================= */
  /* RENDERIZAÇÃO */
  /* ======================================================= */

  return (
    <>
      <main
        className="
          flex-1
          min-w-0
          h-screen
          overflow-y-auto
          bg-[var(--bg-app)]
          text-[var(--text-primary)]
          px-7
          py-7
          transition-colors
          duration-200
        "
      >
        {/* ================================================= */}
        {/* CABEÇALHO */}
        {/* ================================================= */}

        <header className="mb-6">
          <h1
            className="
              text-4xl
              font-bold
              tracking-tight
              text-[var(--text-primary)]
              transition-colors
            "
          >
            Processos
          </h1>
        </header>

        {/* ================================================= */}
        {/* BUSCA + NOVO PROCESSO */}
        {/* ================================================= */}

        <div
          className="
            mb-5
            flex
            items-center
            justify-between
            gap-4
          "
        >
          {/* Busca */}
          <div
            className="
              w-[420px]
              max-w-full
              h-11
              flex
              items-center
              gap-3
              px-4
              rounded-lg
              bg-[var(--bg-input)]
              border
              border-[var(--border)]
              focus-within:border-blue-500
              transition-colors
            "
          >
            <Search
              size={18}
              className="
                text-[var(--text-muted)]
                shrink-0
              "
            />

            <input
              type="text"
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              placeholder="Buscar processos..."
              className="
                w-full
                bg-transparent
                outline-none
                border-none
                shadow-none
                p-0
                text-sm
                text-[var(--text-primary)]
                placeholder:text-[var(--text-muted)]
              "
            />
          </div>

          {/* Novo Processo */}
          <button
            type="button"
            onClick={onNovoProcesso}
            className="
              h-11
              px-5
              flex
              items-center
              justify-center
              gap-2
              rounded-lg
              border
              border-blue-600
              bg-blue-600
              text-sm
              font-medium
              text-white
              hover:bg-blue-500
              hover:border-blue-500
              transition-colors
              shrink-0
            "
          >
            <Plus size={17} />
            Novo Processo
          </button>
        </div>

        {/* ================================================= */}
        {/* CARDS DOS PROCESSOS */}
        {/* ================================================= */}

        <section
          className="
            grid
            grid-cols-1
            md:grid-cols-2
            xl:grid-cols-3
            2xl:grid-cols-4
            gap-4
          "
        >
          {processosFiltrados.map((processo) => {
            const Icone = processo.icone;

            return (
              <article
                key={processo.id}
                className="
                  group
                  min-h-[245px]
                  flex
                  flex-col
                  bg-[var(--bg-card)]
                  border
                  border-[var(--border)]
                  rounded-xl
                  p-4
                  hover:border-blue-500/60
                  transition-colors
                  duration-200
                "
              >
                {/* ========================================= */}
                {/* TOPO DO CARD */}
                {/* ========================================= */}

                <div className="flex items-start justify-between">
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
                    <Icone size={21} strokeWidth={2.4} />
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-1">
                    {/* Editar */}
                    <button
                      type="button"
                      title="Editar processo"
                      aria-label="Editar processo"
                      className="
                        w-8
                        h-8
                        p-0
                        rounded-md
                        border-none
                        shadow-none
                        flex
                        items-center
                        justify-center
                        bg-transparent
                        text-[var(--text-muted)]
                        hover:bg-blue-500/10
                        hover:text-blue-500
                        transition-colors
                      "
                    >
                      <Pencil size={16} />
                    </button>

                    {/* Excluir */}
                    <button
                      type="button"
                      title="Excluir processo"
                      aria-label="Excluir processo"
                      className="
                        w-8
                        h-8
                        p-0
                        rounded-md
                        border-none
                        shadow-none
                        flex
                        items-center
                        justify-center
                        bg-transparent
                        text-[var(--text-muted)]
                        hover:bg-red-500/10
                        hover:text-red-500
                        transition-colors
                      "
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* ========================================= */}
                {/* NOME */}
                {/* ========================================= */}

                <h2
                  className="
                    mt-3
                    text-[15px]
                    font-semibold
                    text-[var(--text-primary)]
                    transition-colors
                  "
                >
                  {processo.nome}
                </h2>

                {/* ========================================= */}
                {/* DESCRIÇÃO */}
                {/* ========================================= */}

                <p
                  className="
                    mt-2
                    text-xs
                    leading-5
                    text-[var(--text-secondary)]
                    min-h-[40px]
                    transition-colors
                  "
                >
                  {processo.descricao}
                </p>

                {/* ========================================= */}
                {/* INFORMAÇÕES */}
                {/* ========================================= */}

                <div
                  className="
                    mt-4
                    flex
                    flex-wrap
                    items-center
                    gap-x-3
                    gap-y-2
                    text-[11px]
                    text-[var(--text-muted)]
                    transition-colors
                  "
                >
                  {/* Quantidade de etapas */}
                  <span
                    className="
                      flex
                      items-center
                      gap-1.5
                    "
                  >
                    <ListChecks size={14} />
                    {processo.etapas} etapas
                  </span>

                  {/* Separador */}
                  <span
                    className="
                      h-3
                      w-px
                      bg-[var(--border)]
                    "
                  />

                  {/* Última execução */}
                  <span
                    className="
                      flex
                      items-center
                      gap-1.5
                    "
                  >
                    <Clock3 size={14} />

                    {processo.ultimaExecucao}
                  </span>
                </div>

                {/* Espaçador */}
                <div className="flex-1" />

                {/* ========================================= */}
                {/* EXECUTAR */}
                {/* ========================================= */}

                <button
                  type="button"
                  onClick={() => setProcessoEmExecucao(processo)}
                  className="
                    mt-4
                    w-full
                    h-9
                    p-0
                    rounded-md
                    flex
                    items-center
                    justify-center
                    gap-2
                    bg-[var(--hover)]
                    border
                    border-[var(--border)]
                    shadow-none
                    text-xs
                    font-medium
                    text-[var(--text-primary)]
                    hover:bg-blue-600
                    hover:border-blue-500
                    hover:text-white
                    transition-colors
                  "
                >
                  <Play size={12} fill="currentColor" />
                  Executar
                </button>
              </article>
            );
          })}
        </section>

        {/* ================================================= */}
        {/* NENHUM RESULTADO */}
        {/* ================================================= */}

        {processosFiltrados.length === 0 && (
          <div
            className="
              mt-16
              text-center
              text-sm
              text-[var(--text-muted)]
              transition-colors
            "
          >
            Nenhum processo encontrado.
          </div>
        )}
      </main>

      {/* =================================================== */}
      {/* MODAL DE EXECUÇÃO */}
      {/* =================================================== */}

      <ExecuteProcessModal
        aberto={!!processoEmExecucao}
        processo={processoEmExecucao}
        onClose={() => setProcessoEmExecucao(null)}
      />
    </>
  );
}

export default Processos;
