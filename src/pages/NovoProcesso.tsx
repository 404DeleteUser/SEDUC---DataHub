import { useState } from 'react';

import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import type { ProcessoBase } from '../types/processo';

import {
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  Database,
  FileIcon,
  FileSpreadsheet,
  FileText,
  Folder,
  ImagePlus,
  Layers3,
  Plus,
  ShieldCheck,
  Trash2,
  Upload,
  Users,
  Wrench,
} from 'lucide-react';

/* ========================================================= */
/* PROPS */
/* ========================================================= */

type NovoProcessoProps = {
  onVoltar: () => void;
  onProximo: (processo: ProcessoBase) => void;
};

/* ========================================================= */
/* TIPOS */
/* ========================================================= */

type Auxiliar = {
  id: number;
  nome: string;
  arquivo: File | null;
};

type IconeOpcao = {
  id: string;
  nome: string;
  icone: LucideIcon;
};

/* ========================================================= */
/* ÍCONES DISPONÍVEIS */
/* ========================================================= */

const iconesDisponiveis: IconeOpcao[] = [
  {
    id: 'planilha',
    nome: 'Planilha',
    icone: FileSpreadsheet,
  },
  {
    id: 'arquivo',
    nome: 'Arquivo',
    icone: FileText,
  },
  {
    id: 'banco',
    nome: 'Banco de dados',
    icone: Database,
  },
  {
    id: 'calendario',
    nome: 'Calendário',
    icone: CalendarDays,
  },
  {
    id: 'usuarios',
    nome: 'Usuários',
    icone: Users,
  },
  {
    id: 'validacao',
    nome: 'Validação',
    icone: ShieldCheck,
  },
  {
    id: 'ferramenta',
    nome: 'Ferramenta',
    icone: Wrench,
  },
];

/* ========================================================= */
/* CORES PADRÃO DOS ÍCONES */
/* ========================================================= */

const coresPadrao = [
  '#059669',
  '#7c3aed',
  '#ea580c',
  '#0891b2',
  '#2563eb',
  '#dc2626',
  '#db2777',
];

/* ========================================================= */
/* COMPONENTE */
/* ========================================================= */

function NovoProcesso({ onVoltar, onProximo }: NovoProcessoProps) {
  /* ===================================================== */
  /* 1. INFORMAÇÕES GERAIS */
  /* ===================================================== */

  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');

  const [iconeSelecionado, setIconeSelecionado] = useState('planilha');

  const [iconePersonalizado, setIconePersonalizado] = useState<string | null>(
    null
  );

  const [arquivoIconePersonalizado, setArquivoIconePersonalizado] =
    useState<File | null>(null);

  const [corIcone, setCorIcone] = useState('#059669');

  /* ===================================================== */
  /* 2. ARQUIVOS PRINCIPAIS */
  /* ===================================================== */

  const [principal1, setPrincipal1] = useState<File | null>(null);

  const [principal2, setPrincipal2] = useState<File | null>(null);

  const [modoPrincipais, setModoPrincipais] = useState<
    'concatenar' | 'separados'
  >('concatenar');

  /* ===================================================== */
  /* 3. ARQUIVOS AUXILIARES */
  /* ===================================================== */

  const [auxiliares, setAuxiliares] = useState<Auxiliar[]>([]);

  /* ===================================================== */
  /* 4. SAÍDA */
  /* ===================================================== */

  const [nomeSaida, setNomeSaida] = useState('');
  const [formatoSaida, setFormatoSaida] = useState('xlsx');
  const [pastaDestino, setPastaDestino] = useState('');

  /* ===================================================== */
  /* FUNÇÕES */
  /* ===================================================== */

  function adicionarAuxiliar() {
    if (auxiliares.length >= 3) {
      return;
    }

    setAuxiliares((anterior) => [
      ...anterior,
      {
        id: Date.now(),
        nome: '',
        arquivo: null,
      },
    ]);
  }

  function removerAuxiliar(id: number) {
    setAuxiliares((anterior) =>
      anterior.filter((auxiliar) => auxiliar.id !== id)
    );
  }

  function atualizarNomeAuxiliar(id: number, nomeAuxiliar: string) {
    setAuxiliares((anterior) =>
      anterior.map((auxiliar) =>
        auxiliar.id === id
          ? {
              ...auxiliar,
              nome: nomeAuxiliar,
            }
          : auxiliar
      )
    );
  }

  function atualizarArquivoAuxiliar(id: number, arquivo: File | null) {
    setAuxiliares((anterior) =>
      anterior.map((auxiliar) =>
        auxiliar.id === id
          ? {
              ...auxiliar,
              arquivo,
            }
          : auxiliar
      )
    );
  }

  function selecionarIcone(id: string) {
    setIconeSelecionado(id);
    setIconePersonalizado(null);
    setArquivoIconePersonalizado(null);
  }

  function selecionarImagemPersonalizada(arquivo: File | null) {
    if (!arquivo) {
      return;
    }

    const url = URL.createObjectURL(arquivo);

    setArquivoIconePersonalizado(arquivo);
    setIconePersonalizado(url);
    setIconeSelecionado('personalizado');
  }

  function proximo() {
    const processo: ProcessoBase = {
      nome,
      descricao,

      identidadeVisual: {
        icone: iconeSelecionado,
        imagemPersonalizada: arquivoIconePersonalizado,
        cor: corIcone,
      },

      arquivosPrincipais: {
        principal1,
        principal2,
        modo: modoPrincipais,
      },

      auxiliares,

      saida: {
        nome: nomeSaida,
        formato: formatoSaida,
        pastaDestino,
      },
    };

    onProximo(processo);
  }

  const IconeAtual =
    iconesDisponiveis.find((item) => item.id === iconeSelecionado)?.icone ??
    FileSpreadsheet;

  /* ===================================================== */
  /* RENDERIZAÇÃO */
  /* ===================================================== */

  return (
    <main
      className="
        flex-1
        min-w-0
        h-screen
        bg-[var(--bg-app)]
        text-[var(--text-primary)]
        overflow-hidden
        flex
        flex-col
        transition-colors
        duration-200
      "
    >
      {/* ================================================= */}
      {/* CABEÇALHO */}
      {/* ================================================= */}

      <header
        className="
          h-[100px]
          shrink-0
          px-7
          flex
          items-center
        "
      >
        <div className="flex items-center gap-3">
          {/* Voltar */}
          <button
            type="button"
            onClick={onVoltar}
            title="Voltar para Processos"
            aria-label="Voltar para Processos"
            className="
              w-9
              h-9
              p-0
              flex
              items-center
              justify-center
              rounded-lg
              border-none
              shadow-none
              bg-transparent
              text-[var(--text-muted)]
              hover:text-[var(--text-primary)]
              hover:bg-[var(--hover)]
              transition-colors
            "
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <h1
              className="
                text-3xl
                font-bold
                tracking-tight
                text-[var(--text-primary)]
              "
            >
              Novo Processo
            </h1>

            <p
              className="
                mt-1
                text-sm
                text-[var(--text-secondary)]
              "
            >
              Configure os arquivos e saída do processo.
            </p>
          </div>
        </div>
      </header>

      {/* ================================================= */}
      {/* CONTEÚDO CENTRAL */}
      {/* ================================================= */}

      <div
        className="
          flex-1
          min-h-0
          overflow-y-auto
          px-6
          py-4
        "
      >
        <div
          className="
            grid
            grid-cols-1
            2xl:grid-cols-2
            gap-4
          "
        >
          {/* ============================================= */}
          {/* 1. INFORMAÇÕES GERAIS */}
          {/* ============================================= */}

          <section className="painel-processo">
            <TituloSecao
              numero="1"
              titulo="Informações Gerais"
              icone={<FileText size={19} />}
            />

            <div className="mt-3 space-y-3">
              {/* Nome */}
              <div>
                <Label texto="Nome do processo" obrigatorio />

                <input
                  value={nome}
                  onChange={(event) => setNome(event.target.value)}
                  placeholder="Ex.: Auditoria de Faltas"
                  className="campo-processo"
                />
              </div>

              {/* Descrição */}
              <div>
                <Label texto="Descrição" />

                <textarea
                  value={descricao}
                  onChange={(event) => setDescricao(event.target.value)}
                  placeholder="Descreva o objetivo do processo e o resultado esperado..."
                  className="
                    campo-processo
                    min-h-[72px]
                    resize-none
                    py-2
                  "
                />
              </div>

              {/* ========================================= */}
              {/* IDENTIDADE VISUAL */}
              {/* ========================================= */}

              <div
                className="
                  flex
                  items-start
                  justify-center
                  gap-6
                  pt-1
                  w-full
                "
              >
                {/* Visualização */}
                <div>
                  <Label texto="Visualização" />

                  <div className="mt-2.5">
                    {iconePersonalizado ? (
                      <div
                        className="
                          w-16
                          h-16
                          rounded-xl
                          overflow-hidden
                          border
                          border-[var(--border)]
                        "
                      >
                        <img
                          src={iconePersonalizado}
                          alt="Ícone personalizado"
                          className="
                            w-full
                            h-full
                            object-cover
                          "
                        />
                      </div>
                    ) : (
                      <div
                        className="
                          w-16
                          h-16
                          rounded-xl
                          flex
                          items-center
                          justify-center
                          text-white
                        "
                        style={{
                          backgroundColor: corIcone,
                        }}
                      >
                        <IconeAtual size={28} strokeWidth={2.3} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Separador */}
                <div
                  className="
                    h-[92px]
                    w-px
                    bg-[var(--border)]
                  "
                />

                {/* Ícones */}
                <div>
                  <Label texto="Ícone" />

                  <div
                    className="
                      mt-2.5
                      grid
                      grid-cols-4
                      gap-2
                    "
                  >
                    {iconesDisponiveis.map((item) => {
                      const Icone = item.icone;

                      const selecionado =
                        iconeSelecionado === item.id && !iconePersonalizado;

                      return (
                        <button
                          key={item.id}
                          type="button"
                          title={item.nome}
                          onClick={() => selecionarIcone(item.id)}
                          className={`
                            w-10
                            h-10
                            p-0
                            rounded-lg
                            flex
                            items-center
                            justify-center
                            border
                            shadow-none
                            transition-all

                            ${
                              selecionado
                                ? `
                                  border-blue-500
                                  bg-blue-500/10
                                  text-blue-500
                                `
                                : `
                                  border-[var(--border)]
                                  bg-[var(--bg-input)]
                                  text-[var(--text-muted)]
                                  hover:border-blue-500
                                  hover:text-[var(--text-primary)]
                                `
                            }
                          `}
                        >
                          <Icone size={18} />
                        </button>
                      );
                    })}

                    {/* Upload personalizado */}
                    <label
                      title="Selecionar imagem do computador"
                      className={`
                        w-10
                        h-10
                        rounded-lg
                        flex
                        items-center
                        justify-center
                        border
                        border-dashed
                        cursor-pointer
                        overflow-hidden
                        transition-all

                        ${
                          iconePersonalizado
                            ? `
                              border-blue-500
                            `
                            : `
                              border-[var(--border-hover)]
                              bg-[var(--bg-input)]
                              text-[var(--text-muted)]
                              hover:border-blue-500
                              hover:text-[var(--text-primary)]
                            `
                        }
                      `}
                    >
                      {iconePersonalizado ? (
                        <img
                          src={iconePersonalizado}
                          alt="Imagem personalizada"
                          className="
                            w-full
                            h-full
                            object-cover
                          "
                        />
                      ) : (
                        <ImagePlus size={18} />
                      )}

                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) =>
                          selecionarImagemPersonalizada(
                            event.target.files?.[0] ?? null
                          )
                        }
                      />
                    </label>
                  </div>
                </div>

                {/* Separador */}
                <div
                  className="
                    h-[92px]
                    w-px
                    bg-[var(--border)]
                  "
                />

                {/* Cores */}
                <div>
                  <Label texto="Cor" />

                  <div
                    className="
                      mt-2.5
                      grid
                      grid-cols-4
                      gap-2.5
                    "
                  >
                    {coresPadrao.map((cor) => (
                      <button
                        key={cor}
                        type="button"
                        onClick={() => setCorIcone(cor)}
                        style={{
                          backgroundColor: cor,
                        }}
                        className={`
                          w-8
                          h-8
                          p-0
                          rounded-full
                          border-none
                          shadow-none
                          transition-all

                          ${
                            corIcone === cor && !iconePersonalizado
                              ? `
                                ring-2
                                ring-blue-500
                                ring-offset-2
                                ring-offset-[var(--bg-card)]
                              `
                              : ''
                          }
                        `}
                      />
                    ))}

                    {/* Cor personalizada */}
                    <label
                      title="Escolher cor personalizada"
                      className="
                        relative
                        w-8
                        h-8
                        rounded-full
                        p-[2px]
                        cursor-pointer
                      "
                      style={{
                        background:
                          'conic-gradient(#ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
                      }}
                    >
                      <div
                        className="
                          w-full
                          h-full
                          rounded-full
                          bg-[var(--bg-card)]
                          flex
                          items-center
                          justify-center
                          text-[var(--text-primary)]
                          hover:bg-[var(--hover)]
                          transition-colors
                        "
                      >
                        <Plus size={15} />
                      </div>

                      <input
                        type="color"
                        value={corIcone}
                        onChange={(event) => setCorIcone(event.target.value)}
                        className="
                          absolute
                          inset-0
                          w-full
                          h-full
                          opacity-0
                          cursor-pointer
                        "
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ============================================= */}
          {/* 2. ARQUIVOS PRINCIPAIS */}
          {/* ============================================= */}

          <section className="painel-processo">
            <TituloSecao
              numero="2"
              titulo="Arquivos Principais"
              complemento="até 2"
              icone={<Layers3 size={19} />}
            />

            <p
              className="
                mt-1
                text-xs
                text-[var(--text-secondary)]
              "
            >
              Arquivos principais utilizados no processamento.
            </p>

            <div className="mt-3 space-y-3">
              {/* Principal 1 */}
              <div>
                <Label texto="Principal 1" obrigatorio />

                <label className="seletor-arquivo">
                  <Upload size={17} />

                  <span className="truncate">
                    {principal1 ? principal1.name : 'Selecionar arquivo...'}
                  </span>

                  <input
                    type="file"
                    className="hidden"
                    onChange={(event) =>
                      setPrincipal1(event.target.files?.[0] ?? null)
                    }
                  />
                </label>
              </div>

              {/* Principal 2 */}
              <div>
                <Label texto="Principal 2" />

                <label className="seletor-arquivo">
                  <Upload size={17} />

                  <span className="truncate">
                    {principal2 ? principal2.name : 'Selecionar arquivo...'}
                  </span>

                  <input
                    type="file"
                    className="hidden"
                    onChange={(event) =>
                      setPrincipal2(event.target.files?.[0] ?? null)
                    }
                  />
                </label>
              </div>

              {/* Modo */}
              <div>
                <Label texto="Modo dos arquivos principais" />

                <div
                  className="
                    mt-2
                    grid
                    grid-cols-1
                    md:grid-cols-2
                    gap-3
                  "
                >
                  {/* Concatenar */}
                  <button
                    type="button"
                    onClick={() => setModoPrincipais('concatenar')}
                    className={`
                      opcao-modo
                      ${
                        modoPrincipais === 'concatenar'
                          ? `
                            border-blue-500
                            bg-blue-500/10
                          `
                          : ''
                      }
                    `}
                  >
                    <Database
                      size={18}
                      className="
                        mt-0.5
                        shrink-0
                        text-[var(--text-primary)]
                      "
                    />

                    <div>
                      <p
                        className="
                          font-medium
                          text-[var(--text-primary)]
                        "
                      >
                        Concatenar
                      </p>

                      <p
                        className="
                          text-xs
                          text-[var(--text-secondary)]
                        "
                      >
                        Une os dois arquivos antes do processamento.
                      </p>
                    </div>
                  </button>

                  {/* Separados */}
                  <button
                    type="button"
                    onClick={() => setModoPrincipais('separados')}
                    className={`
                      opcao-modo
                      ${
                        modoPrincipais === 'separados'
                          ? `
                            border-blue-500
                            bg-blue-500/10
                          `
                          : ''
                      }
                    `}
                  >
                    <FileIcon
                      size={18}
                      className="
                        mt-0.5
                        shrink-0
                        text-[var(--text-primary)]
                      "
                    />

                    <div>
                      <p
                        className="
                          font-medium
                          text-[var(--text-primary)]
                        "
                      >
                        Manter separados
                      </p>

                      <p
                        className="
                          text-xs
                          text-[var(--text-secondary)]
                        "
                      >
                        Mantém cada arquivo como uma entrada independente.
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* ============================================= */}
          {/* 3. ARQUIVOS AUXILIARES */}
          {/* ============================================= */}

          <section className="painel-processo">
            <div
              className="
                flex
                items-center
                justify-between
                gap-4
              "
            >
              <TituloSecao
                numero="3"
                titulo="Arquivos Auxiliares"
                complemento={`${auxiliares.length}/3`}
                icone={<Layers3 size={19} />}
              />

              <button
                type="button"
                onClick={adicionarAuxiliar}
                disabled={auxiliares.length >= 3}
                className="
                  botao-secundario
                  disabled:opacity-40
                  disabled:cursor-not-allowed
                "
              >
                <Plus size={16} />
                Adicionar auxiliar
              </button>
            </div>

            <p
              className="
                mt-1
                text-xs
                text-[var(--text-secondary)]
              "
            >
              Adicione até três bases auxiliares utilizadas durante o processo.
            </p>

            {auxiliares.length === 0 ? (
              <div className="estado-vazio">
                Nenhum arquivo auxiliar adicionado.
              </div>
            ) : (
              <div
                className="
                  mt-3
                  grid
                  grid-cols-1
                  xl:grid-cols-3
                  gap-3
                "
              >
                {auxiliares.map((auxiliar) => (
                  <div
                    key={auxiliar.id}
                    className="
                      rounded-lg
                      border
                      border-[var(--border)]
                      bg-[var(--bg-card-secondary)]
                      p-3
                      transition-colors
                    "
                  >
                    <div
                      className="
                        flex
                        items-center
                        gap-2
                      "
                    >
                      <input
                        value={auxiliar.nome}
                        onChange={(event) =>
                          atualizarNomeAuxiliar(auxiliar.id, event.target.value)
                        }
                        placeholder="Nome funcional"
                        className="
                          min-w-0
                          flex-1
                          bg-transparent
                          border-none
                          shadow-none
                          p-0
                          outline-none
                          text-sm
                          text-[var(--text-primary)]
                          placeholder:text-[var(--text-muted)]
                        "
                      />

                      <button
                        type="button"
                        onClick={() => removerAuxiliar(auxiliar.id)}
                        title="Remover auxiliar"
                        aria-label="Remover auxiliar"
                        className="
                          w-8
                          h-8
                          p-0
                          flex
                          items-center
                          justify-center
                          rounded-md
                          border-none
                          shadow-none
                          bg-transparent
                          text-[var(--text-muted)]
                          hover:bg-red-500/10
                          hover:text-red-500
                          transition-colors
                        "
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <label className="seletor-arquivo mt-3">
                      <Upload size={15} />

                      <span className="truncate text-xs">
                        {auxiliar.arquivo
                          ? auxiliar.arquivo.name
                          : 'Selecionar arquivo'}
                      </span>

                      <input
                        type="file"
                        className="hidden"
                        onChange={(event) =>
                          atualizarArquivoAuxiliar(
                            auxiliar.id,
                            event.target.files?.[0] ?? null
                          )
                        }
                      />
                    </label>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ============================================= */}
          {/* 4. SAÍDA */}
          {/* ============================================= */}

          <section className="painel-processo">
            <TituloSecao
              numero="4"
              titulo="Saída"
              icone={<FileSpreadsheet size={19} />}
            />

            <p
              className="
                mt-1
                text-xs
                text-[var(--text-secondary)]
              "
            >
              Configure o arquivo resultante do processo.
            </p>

            <div className="mt-3 space-y-3">
              <div
                className="
                  grid
                  grid-cols-1
                  xl:grid-cols-[1fr_180px]
                  gap-3
                "
              >
                {/* Nome */}
                <div>
                  <Label texto="Nome do arquivo de saída" obrigatorio />

                  <input
                    value={nomeSaida}
                    onChange={(event) => setNomeSaida(event.target.value)}
                    placeholder="Ex.: Relatorio_Final.xlsx"
                    className="campo-processo"
                  />
                </div>

                {/* Formato */}
                <div>
                  <Label texto="Formato" />

                  <select
                    value={formatoSaida}
                    onChange={(event) => setFormatoSaida(event.target.value)}
                    className="campo-processo"
                  >
                    <option value="xlsx">XLSX (Excel)</option>

                    <option value="csv">CSV</option>
                  </select>
                </div>
              </div>

              {/* Pasta destino */}
              <div>
                <Label texto="Pasta de destino" obrigatorio />

                <div
                  className="
                    flex
                    items-end
                    gap-2
                  "
                >
                  <div className="flex-1 relative">
                    <Folder
                      size={16}
                      className="
                        absolute
                        left-3
                        bottom-[11px]
                        text-[var(--text-muted)]
                        pointer-events-none
                      "
                    />

                    <input
                      value={pastaDestino}
                      onChange={(event) => setPastaDestino(event.target.value)}
                      placeholder="Selecione uma pasta..."
                      className="
                        campo-processo
                        pl-10
                      "
                    />
                  </div>

                  <button
                    type="button"
                    className="
                      botao-secundario
                    "
                  >
                    Selecionar
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* ================================================= */}
      {/* RODAPÉ */}
      {/* ================================================= */}

      <footer
        className="
          h-[76px]
          shrink-0
          px-7
          flex
          items-center
          justify-end
          gap-3
          bg-[var(--bg-sidebar)]
          border-t
          border-[var(--border)]
          transition-colors
        "
      >
        {/* Cancelar */}
        <button
          type="button"
          onClick={onVoltar}
          className="
            h-10
            px-5
            rounded-lg
            border
            border-[var(--border)]
            bg-[var(--bg-card)]
            text-sm
            text-[var(--text-primary)]
            shadow-none
            hover:bg-[var(--hover)]
            hover:border-[var(--border-hover)]
            transition-colors
          "
        >
          Cancelar
        </button>

        {/* Próximo */}
        <button
          type="button"
          onClick={proximo}
          className="
            h-10
            px-6
            flex
            items-center
            gap-2
            rounded-lg
            border
            border-blue-600
            bg-blue-600
            text-sm
            font-medium
            text-white
            shadow-none
            hover:bg-blue-500
            hover:border-blue-500
            transition-colors
          "
        >
          Próximo
          <ChevronRight size={17} />
        </button>
      </footer>
    </main>
  );
}

/* ========================================================= */
/* COMPONENTES AUXILIARES */
/* ========================================================= */

type TituloSecaoProps = {
  numero: string;
  titulo: string;
  complemento?: string;
  icone: ReactNode;
};

/* ========================================================= */
/* TÍTULO DA SEÇÃO */
/* ========================================================= */

function TituloSecao({ numero, titulo, complemento, icone }: TituloSecaoProps) {
  return (
    <div
      className="
        flex
        items-center
        gap-2
      "
    >
      <span className="text-cyan-500">{icone}</span>

      <h2
        className="
          font-semibold
          text-[var(--text-primary)]
        "
      >
        {numero}. {titulo}
      </h2>

      {complemento && (
        <span
          className="
            text-[11px]
            text-[var(--text-muted)]
          "
        >
          ({complemento})
        </span>
      )}
    </div>
  );
}

/* ========================================================= */
/* LABEL */
/* ========================================================= */

function Label({
  texto,
  obrigatorio = false,
}: {
  texto: string;
  obrigatorio?: boolean;
}) {
  return (
    <label
      className="
        text-xs
        font-medium
        text-[var(--text-secondary)]
      "
    >
      {texto}

      {obrigatorio && <span className="ml-1 text-red-500">*</span>}
    </label>
  );
}

export default NovoProcesso;
