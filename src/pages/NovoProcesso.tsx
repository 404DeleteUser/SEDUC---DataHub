import PageHeader, { ProcessSteps } from '../components/PageHeader';
import FolderPicker from '../components/FolderPicker';
import { useEffect, useState } from 'react';

import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import type { ProcessoBase, AuxiliarProcesso } from '../types/processo';

import {
  CalendarDays,
  ChevronRight,
  Database,
  FileIcon,
  FileCode2,
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
  processoInicial?: ProcessoBase | null;
  modoEdicao?: boolean;
  onVoltar: () => void;
  onProximo: (processo: ProcessoBase) => void;
};

/* ========================================================= */
/* TIPOS */
/* ========================================================= */

type Auxiliar = AuxiliarProcesso;

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

function NovoProcesso({
  onVoltar,
  onProximo,
  processoInicial,
  modoEdicao = false,
}: NovoProcessoProps) {
  /* ===================================================== */
  /* 1. INFORMAÇÕES GERAIS */
  /* ===================================================== */

  const [errosFormulario, setErrosFormulario] = useState<
    { id: string; mensagem: string }[]
  >([]);
  const [nome, setNome] = useState(processoInicial?.nome ?? '');
  const [descricao, setDescricao] = useState(processoInicial?.descricao ?? '');

  const [iconeSelecionado, setIconeSelecionado] = useState(
    processoInicial?.identidadeVisual.icone ?? 'planilha'
  );

  const [iconePersonalizado, setIconePersonalizado] = useState<string | null>(
    null
  );

  const [arquivoIconePersonalizado, setArquivoIconePersonalizado] =
    useState<File | null>(
      processoInicial?.identidadeVisual.imagemPersonalizada ?? null
    );

  const [corIcone, setCorIcone] = useState(
    processoInicial?.identidadeVisual.cor ?? '#059669'
  );

  /* ===================================================== */
  /* 2. ARQUIVOS PRINCIPAIS */
  /* ===================================================== */

  const [principal1, setPrincipal1] = useState<File | null>(
    processoInicial?.arquivosPrincipais.principal1 ?? null
  );

  const [principal2, setPrincipal2] = useState<File | null>(
    processoInicial?.arquivosPrincipais.principal2 ?? null
  );

  const [modoPrincipais, setModoPrincipais] = useState<
    'concatenar' | 'separados'
  >(processoInicial?.arquivosPrincipais.modo ?? 'concatenar');
  const [origem, setOrigem] = useState(
    processoInicial?.origem ?? 'ferramentas'
  );
  const [scriptPython, setScriptPython] = useState<File | null>(
    processoInicial?.scriptPython ?? null
  );

  /* ===================================================== */
  /* 3. ARQUIVOS AUXILIARES */
  /* ===================================================== */

  const [auxiliares, setAuxiliares] = useState<Auxiliar[]>(
    processoInicial?.auxiliares ?? []
  );

  /* ===================================================== */
  /* 4. SAÍDA */
  /* ===================================================== */

  const [nomeSaida, setNomeSaida] = useState(processoInicial?.saida.nome ?? '');
  const [formatoSaida, setFormatoSaida] = useState(
    processoInicial?.saida.formato ?? 'xlsx'
  );
  const [pastaDestino, setPastaDestino] = useState(
    processoInicial?.saida.pastaDestino ?? ''
  );

  /* ===================================================== */
  /* FUNÇÕES */
  /* ===================================================== */

  useEffect(() => {
    if (!arquivoIconePersonalizado) {
      setIconePersonalizado(null);
      return;
    }
    const url = URL.createObjectURL(arquivoIconePersonalizado);
    setIconePersonalizado(url);
    return () => URL.revokeObjectURL(url);
  }, [arquivoIconePersonalizado]);

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

    setArquivoIconePersonalizado(arquivo);
    setIconeSelecionado('personalizado');
  }

  function proximo() {
    if (modoEdicao) {
      if (origem === 'script-python' && !scriptPython) {
        setErrosFormulario([
          {
            id: 'arquivo-script-python',
            mensagem: 'Selecione o script Python que deseja conectar.',
          },
        ]);
        document.getElementById('arquivo-script-python')?.focus();
        return;
      }
      setErrosFormulario([]);
      onProximo(montarProcesso());
      return;
    }
    const camposObrigatorios = [
      {
        id: 'nome-do-processo',
        preenchido: !!nome.trim(),
        mensagem: 'Informe o nome do processo.',
      },
      {
        id: 'principal-1',
        preenchido: !!principal1,
        mensagem: 'Selecione o arquivo principal.',
      },
      ...(origem === 'script-python'
        ? [
            {
              id: 'arquivo-script-python',
              preenchido: !!scriptPython,
              mensagem: 'Selecione o script Python que deseja conectar.',
            },
          ]
        : []),
      {
        id: 'nome-do-arquivo-de-sa-da',
        preenchido: !!nomeSaida.trim(),
        mensagem: 'Informe o nome do arquivo de saída.',
      },
      {
        id: 'pasta-de-destino',
        preenchido: !!pastaDestino.trim(),
        mensagem: 'Selecione a pasta de destino.',
      },
    ];
    const pendencias = camposObrigatorios.filter((campo) => !campo.preenchido);
    setErrosFormulario(pendencias);
    if (pendencias.length) {
      document.getElementById(pendencias[0].id)?.focus();
      return;
    }
    onProximo(montarProcesso());
  }

  function montarProcesso(): ProcessoBase {
    const etapasExistentes = processoInicial?.etapas ?? [];
    const etapasSemScript = etapasExistentes.filter(
      (etapa) => etapa.ferramentaId !== 'script-python'
    );
    const etapas =
      origem === 'script-python' && scriptPython
        ? etapasExistentes.some(
            (etapa) => etapa.ferramentaId === 'script-python'
          )
          ? etapasExistentes
          : [
              ...etapasSemScript,
              {
                id: Date.now(),
                ferramentaId: 'script-python',
                planilhas: [],
                condicao: {
                  ativa: false,
                  tipo: 'coluna-existe' as const,
                  arquivoId: '',
                  coluna: '',
                  valor: '',
                },
              },
            ]
        : etapasSemScript;
    return {
      origem,
      scriptPython,
      etapas,
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
  }

  const IconeAtual =
    iconesDisponiveis.find((item) => item.id === iconeSelecionado)?.icone ??
    FileSpreadsheet;

  /* ===================================================== */
  /* RENDERIZAÇÃO */
  /* ===================================================== */

  return (
    <main id="conteudo-principal" tabIndex={-1} className="form-page">
      {/* ================================================= */}
      {/* CABEÇALHO */}
      {/* ================================================= */}

      <PageHeader
        titulo={modoEdicao ? 'Editar Processo' : 'Novo Processo'}
        descricao={
          modoEdicao
            ? 'Atualize os arquivos, a saída e as informações do processo.'
            : 'Configure os arquivos e saída do processo.'
        }
        onVoltar={onVoltar}
        acao={<span className="demo-badge">Demonstração</span>}
      />
      <ProcessSteps atual={1} />

      {/* ================================================= */}
      {/* CONTEÚDO CENTRAL */}
      {/* ================================================= */}

      <div className="form-content">
        <section className="painel-processo mb-4">
          <div className="flex items-center gap-2">
            <Wrench size={19} className="text-[var(--accent)]" />
            <h2 className="font-semibold">Origem do processo</h2>
          </div>
          <p className="mt-1 text-xs text-[var(--text-secondary)]">
            Crie um fluxo com ferramentas disponíveis ou conecte um script que
            você já possui.
          </p>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
            <button
              type="button"
              aria-pressed={origem === 'ferramentas'}
              onClick={() => setOrigem('ferramentas')}
              className={`opcao-modo ${origem === 'ferramentas' ? 'border-[var(--accent)] bg-[var(--accent-soft)]' : ''}`}
            >
              <Wrench size={18} />
              <span className="text-left">
                <span className="block font-medium">Criar com ferramentas</span>
                <span className="block text-xs text-[var(--text-secondary)]">
                  Monte um processo com as ferramentas do DataHub.
                </span>
              </span>
            </button>
            <button
              type="button"
              aria-pressed={origem === 'script-python'}
              onClick={() => setOrigem('script-python')}
              className={`opcao-modo ${origem === 'script-python' ? 'border-[var(--accent)] bg-[var(--accent-soft)]' : ''}`}
            >
              <FileCode2 size={18} />
              <span className="text-left">
                <span className="block font-medium">
                  Conectar script Python
                </span>
                <span className="block text-xs text-[var(--text-secondary)]">
                  Ajuste as opções e combine o script com ferramentas.
                </span>
              </span>
            </button>
          </div>
          {origem === 'script-python' && (
            <div className="mt-3 grid grid-cols-1 xl:grid-cols-[minmax(240px,1fr)_2fr] gap-3">
              <div>
                <Label
                  texto="Arquivo Python"
                  htmlFor="arquivo-script-python"
                  obrigatorio
                />
                <label className="seletor-arquivo mt-1">
                  <FileCode2 size={16} />
                  <span className="truncate">
                    {scriptPython?.name ?? 'Selecionar arquivo .py…'}
                  </span>
                  <input
                    autoComplete="off"
                    id="arquivo-script-python"
                    name="arquivo-script-python"
                    type="file"
                    accept=".py,text/x-python"
                    className="sr-only"
                    onChange={(event) => {
                      const arquivo = event.target.files?.[0] ?? null;
                      if (
                        arquivo &&
                        !arquivo.name.toLowerCase().endsWith('.py')
                      ) {
                        setErrosFormulario([
                          {
                            id: 'arquivo-script-python',
                            mensagem: 'Selecione um arquivo .py.',
                          },
                        ]);
                        return;
                      }
                      if (arquivo) setScriptPython(arquivo);
                      setErrosFormulario((erros) =>
                        erros.filter(
                          (erro) => erro.id !== 'arquivo-script-python'
                        )
                      );
                    }}
                  />
                </label>
                {errosFormulario
                  .filter((erro) => erro.id === 'arquivo-script-python')
                  .map((erro) => (
                    <p key={erro.id} className="field-error" role="alert">
                      {erro.mensagem}
                    </p>
                  ))}
              </div>
              <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card-secondary)] p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">
                    Opções de arquivos e pastas
                  </p>
                  <span className="demo-badge">Prévia simulada</span>
                </div>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  Prévia das opções de arquivo e pasta que o DataHub mostrará
                  para edição depois de ler o script.
                </p>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="rounded-md border border-[var(--border)] bg-[var(--bg-card)] px-2.5 py-2">
                    <span className="block text-[var(--text-muted)]">
                      Arquivo de entrada
                    </span>
                    <span className="block truncate font-medium">
                      {principal1?.name ?? 'Aguardando seleção'}
                    </span>
                  </div>
                  <div className="rounded-md border border-[var(--border)] bg-[var(--bg-card)] px-2.5 py-2">
                    <span className="block text-[var(--text-muted)]">
                      Pasta de saída
                    </span>
                    <span className="block truncate font-medium">
                      {pastaDestino || 'Aguardando seleção'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
        <div className="create-grid">
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
                <Label
                  texto="Nome do processo"
                  htmlFor="nome-do-processo"
                  obrigatorio
                />

                <input
                  autoComplete="off"
                  id="nome-do-processo"
                  name="nome-do-processo"
                  aria-invalid={errosFormulario.some(
                    (erro) => erro.id === 'nome-do-processo'
                  )}
                  aria-describedby={
                    errosFormulario.some(
                      (erro) => erro.id === 'nome-do-processo'
                    )
                      ? 'nome-do-processo-erro'
                      : undefined
                  }
                  aria-label="Nome do processo"
                  value={nome}
                  onChange={(event) => setNome(event.target.value)}
                  placeholder="Ex.: Auditoria de Faltas"
                  className="campo-processo"
                />
                {errosFormulario
                  .filter((erro) => erro.id === 'nome-do-processo')
                  .map((erro) => (
                    <p
                      key={erro.id}
                      id={erro.id + '-erro'}
                      className="field-error"
                      role="alert"
                    >
                      {erro.mensagem}
                    </p>
                  ))}
              </div>

              {/* Descrição */}
              <div>
                <Label texto="Descrição" htmlFor="descri-o" />

                <textarea
                  autoComplete="off"
                  id="descri-o"
                  name="descri-o"
                  aria-label="Descrição"
                  value={descricao}
                  onChange={(event) => setDescricao(event.target.value)}
                  placeholder="Descreva o objetivo do processo e o resultado esperado..."
                  className="campo-processo min-h-[72px] resize-none py-2"
                />
              </div>

              {/* ========================================= */}
              {/* IDENTIDADE VISUAL */}
              {/* ========================================= */}

              <div className="identity-picker">
                {/* Visualização */}
                <div>
                  <Label texto="Visualização" />

                  <div className="mt-2.5">
                    {iconePersonalizado ? (
                      <div className="w-16 h-16 rounded-xl overflow-hidden border border-[var(--border)]">
                        <img
                          width={64}
                          height={64}
                          src={iconePersonalizado}
                          alt="Ícone personalizado"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div
                        className="w-16 h-16 rounded-xl flex items-center justify-center text-white"
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
                <div className="h-[92px] w-px bg-[var(--border)]" />

                {/* Ícones */}
                <div>
                  <Label texto="Ícone" />

                  <div className="mt-2.5 grid grid-cols-4 gap-2">
                    {iconesDisponiveis.map((item) => {
                      const Icone = item.icone;

                      const selecionado =
                        iconeSelecionado === item.id && !iconePersonalizado;

                      return (
                        <button
                          key={item.id}
                          type="button"
                          title={item.nome}
                          aria-label={item.nome}
                          aria-pressed={selecionado}
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
                            transition-colors

                            ${
                              selecionado
                                ? `
                                  border-[var(--accent)]
                                  bg-[var(--accent-soft)]
                                  text-[var(--accent)]
                                `
                                : `
                                  border-[var(--border)]
                                  bg-[var(--bg-input)]
                                  text-[var(--text-muted)]
                                  hover:border-[var(--accent)]
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
                        transition-colors

                        ${
                          iconePersonalizado
                            ? `
                              border-[var(--accent)]
                            `
                            : `
                              border-[var(--border-hover)]
                              bg-[var(--bg-input)]
                              text-[var(--text-muted)]
                              hover:border-[var(--accent)]
                              hover:text-[var(--text-primary)]
                            `
                        }
                      `}
                    >
                      {iconePersonalizado ? (
                        <img
                          width={64}
                          height={64}
                          src={iconePersonalizado}
                          alt="Imagem personalizada"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImagePlus size={18} />
                      )}

                      <input
                        autoComplete="off"
                        aria-label="Imagem personalizada"
                        type="file"
                        accept="image/*"
                        className="sr-only"
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
                <div className="h-[92px] w-px bg-[var(--border)]" />

                {/* Cores */}
                <div>
                  <Label texto="Cor" htmlFor="cor" />

                  <div className="mt-2.5 grid grid-cols-4 gap-2.5">
                    {coresPadrao.map((cor) => (
                      <button
                        key={cor}
                        type="button"
                        aria-label={'Cor ' + cor}
                        aria-pressed={corIcone === cor && !iconePersonalizado}
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
                          transition-colors

                          ${
                            corIcone === cor && !iconePersonalizado
                              ? `
                                ring-2
                                ring-[var(--accent)]
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
                      className="relative w-8 h-8 rounded-full p-[2px] cursor-pointer"
                      style={{
                        background:
                          'conic-gradient(#ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
                      }}
                    >
                      <div className="w-full h-full rounded-full bg-[var(--bg-card)] flex items-center justify-center text-[var(--text-primary)] hover:bg-[var(--hover)] transition-colors">
                        <Plus size={15} />
                      </div>

                      <input
                        autoComplete="off"
                        id="cor"
                        name="cor"
                        type="color"
                        aria-label="Cor personalizada"
                        value={corIcone}
                        onChange={(event) => setCorIcone(event.target.value)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
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

            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              Arquivos principais utilizados no processamento.
            </p>

            <div className="mt-3 space-y-3">
              {/* Principal 1 */}
              <div>
                <Label
                  texto={
                    origem === 'script-python'
                      ? 'Arquivo de entrada do script'
                      : 'Principal 1'
                  }
                  htmlFor="principal-1"
                  obrigatorio
                />

                <label className="seletor-arquivo">
                  <Upload size={17} />

                  <span className="truncate">
                    {principal1 ? principal1.name : 'Selecionar arquivo…'}
                  </span>

                  <input
                    autoComplete="off"
                    id="principal-1"
                    name="principal-1"
                    aria-invalid={errosFormulario.some(
                      (erro) => erro.id === 'principal-1'
                    )}
                    aria-describedby={
                      errosFormulario.some((erro) => erro.id === 'principal-1')
                        ? 'principal-1-erro'
                        : undefined
                    }
                    type="file"
                    className="sr-only"
                    onChange={(event) =>
                      setPrincipal1(event.target.files?.[0] ?? null)
                    }
                  />
                </label>
                {errosFormulario
                  .filter((erro) => erro.id === 'principal-1')
                  .map((erro) => (
                    <p
                      key={erro.id}
                      id={erro.id + '-erro'}
                      className="field-error"
                      role="alert"
                    >
                      {erro.mensagem}
                    </p>
                  ))}
              </div>

              {/* Principal 2 */}
              <div>
                <Label texto="Principal 2" htmlFor="principal-2" />

                <label className="seletor-arquivo">
                  <Upload size={17} />

                  <span className="truncate">
                    {principal2 ? principal2.name : 'Selecionar arquivo…'}
                  </span>

                  <input
                    autoComplete="off"
                    id="principal-2"
                    name="principal-2"
                    type="file"
                    className="sr-only"
                    onChange={(event) =>
                      setPrincipal2(event.target.files?.[0] ?? null)
                    }
                  />
                </label>
              </div>

              {/* Modo */}
              <div>
                <Label texto="Modo dos arquivos principais" />

                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Concatenar */}
                  <button
                    type="button"
                    aria-pressed={modoPrincipais === 'concatenar'}
                    onClick={() => setModoPrincipais('concatenar')}
                    className={`
                      opcao-modo
                      ${
                        modoPrincipais === 'concatenar'
                          ? `
                            border-[var(--accent)]
                            bg-[var(--accent-soft)]
                          `
                          : ''
                      }
                    `}
                  >
                    <Database
                      size={18}
                      className="mt-0.5 shrink-0 text-[var(--text-primary)]"
                    />

                    <div>
                      <p className="font-medium text-[var(--text-primary)]">
                        Concatenar
                      </p>

                      <p className="text-xs text-[var(--text-secondary)]">
                        Une os dois arquivos antes do processamento.
                      </p>
                    </div>
                  </button>

                  {/* Separados */}
                  <button
                    type="button"
                    aria-pressed={modoPrincipais === 'separados'}
                    onClick={() => setModoPrincipais('separados')}
                    className={`
                      opcao-modo
                      ${
                        modoPrincipais === 'separados'
                          ? `
                            border-[var(--accent)]
                            bg-[var(--accent-soft)]
                          `
                          : ''
                      }
                    `}
                  >
                    <FileIcon
                      size={18}
                      className="mt-0.5 shrink-0 text-[var(--text-primary)]"
                    />

                    <div>
                      <p className="font-medium text-[var(--text-primary)]">
                        Manter separados
                      </p>

                      <p className="text-xs text-[var(--text-secondary)]">
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
            <div className="flex items-center justify-between gap-4">
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
                className="botao-secundario disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus size={16} />
                Adicionar auxiliar
              </button>
            </div>

            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              Adicione até três bases auxiliares utilizadas durante o processo.
            </p>

            {auxiliares.length === 0 ? (
              <div className="estado-vazio">
                Nenhum arquivo auxiliar adicionado.
              </div>
            ) : (
              <div className="mt-3 grid grid-cols-1 gap-3">
                {auxiliares.map((auxiliar) => (
                  <div
                    key={auxiliar.id}
                    className="rounded-lg border border-[var(--border)] bg-[var(--bg-card-secondary)] p-3 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        autoComplete="off"
                        aria-label="Nome funcional do auxiliar"
                        value={auxiliar.nome}
                        onChange={(event) =>
                          atualizarNomeAuxiliar(auxiliar.id, event.target.value)
                        }
                        placeholder="Nome funcional"
                        className="min-w-0 flex-1 bg-transparent border-none shadow-none p-0 outline-none text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                      />

                      <button
                        type="button"
                        onClick={() => removerAuxiliar(auxiliar.id)}
                        title="Remover auxiliar"
                        aria-label="Remover auxiliar"
                        className="w-8 h-8 p-0 flex items-center justify-center rounded-md border-none shadow-none bg-transparent text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-500 transition-colors"
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
                        autoComplete="off"
                        type="file"
                        className="sr-only"
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

            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              Configure o arquivo resultante do processo.
            </p>

            <div className="mt-3 space-y-3">
              <div className="grid grid-cols-1 @[400px]:grid-cols-[1fr_130px] gap-3">
                {/* Nome */}
                <div>
                  <Label
                    texto={
                      origem === 'script-python'
                        ? 'Nome do arquivo de saída do script'
                        : 'Nome do arquivo de saída'
                    }
                    htmlFor="nome-do-arquivo-de-sa-da"
                    obrigatorio
                  />

                  <input
                    autoComplete="off"
                    id="nome-do-arquivo-de-sa-da"
                    name="nome-do-arquivo-de-sa-da"
                    aria-invalid={errosFormulario.some(
                      (erro) => erro.id === 'nome-do-arquivo-de-sa-da'
                    )}
                    aria-describedby={
                      errosFormulario.some(
                        (erro) => erro.id === 'nome-do-arquivo-de-sa-da'
                      )
                        ? 'nome-do-arquivo-de-sa-da-erro'
                        : undefined
                    }
                    aria-label="Nome do arquivo de saída"
                    value={nomeSaida}
                    onChange={(event) => setNomeSaida(event.target.value)}
                    placeholder="Ex.: Relatorio_Final.xlsx"
                    className="campo-processo"
                  />
                  {errosFormulario
                    .filter((erro) => erro.id === 'nome-do-arquivo-de-sa-da')
                    .map((erro) => (
                      <p
                        key={erro.id}
                        id={erro.id + '-erro'}
                        className="field-error"
                        role="alert"
                      >
                        {erro.mensagem}
                      </p>
                    ))}
                </div>

                {/* Formato */}
                <div>
                  <Label texto="Formato" htmlFor="formato" />

                  <select
                    autoComplete="off"
                    id="formato"
                    name="formato"
                    aria-label="Formato"
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
                <Label
                  texto={
                    origem === 'script-python'
                      ? 'Pasta de saída do script'
                      : 'Pasta de destino'
                  }
                  htmlFor="pasta-de-destino"
                  obrigatorio
                />

                <div className="flex items-end gap-2">
                  <div className="flex-1 relative">
                    <Folder
                      size={16}
                      className="absolute left-3 top-[20px] text-[var(--text-muted)] pointer-events-none"
                    />

                    <input
                      autoComplete="off"
                      id="pasta-de-destino"
                      name="pasta-de-destino"
                      aria-invalid={errosFormulario.some(
                        (erro) => erro.id === 'pasta-de-destino'
                      )}
                      aria-describedby={
                        errosFormulario.some(
                          (erro) => erro.id === 'pasta-de-destino'
                        )
                          ? 'pasta-de-destino-erro'
                          : undefined
                      }
                      aria-label="Pasta de destino"
                      value={pastaDestino}
                      onChange={(event) => setPastaDestino(event.target.value)}
                      placeholder="Nenhuma pasta selecionada"
                      className="campo-processo pl-10"
                    />
                    {errosFormulario
                      .filter((erro) => erro.id === 'pasta-de-destino')
                      .map((erro) => (
                        <p
                          key={erro.id}
                          id={erro.id + '-erro'}
                          className="field-error"
                          role="alert"
                        >
                          {erro.mensagem}
                        </p>
                      ))}
                  </div>

                  <FolderPicker onSelect={setPastaDestino} />
                </div>
                <p className="mt-1 text-[11px] text-[var(--text-muted)]">
                  Seleção demonstrativa. O caminho completo será conectado ao
                  app desktop em outra fase.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* ================================================= */}
      {/* RODAPÉ */}
      {/* ================================================= */}

      <footer className="form-footer">
        {/* Cancelar */}
        <button type="button" onClick={onVoltar} className="secondary-button">
          Cancelar
        </button>

        {/* Próximo */}
        <button type="button" onClick={proximo} className="primary-button">
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
    <div className="flex items-center gap-2">
      <span className="text-[var(--accent)]">{icone}</span>

      <h2 className="font-semibold text-[var(--text-primary)]">
        {numero}. {titulo}
      </h2>

      {complemento && (
        <span className="text-[11px] text-[var(--text-muted)]">
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
  htmlFor,
}: {
  texto: string;
  obrigatorio?: boolean;
  htmlFor?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-xs font-medium text-[var(--text-secondary)]"
    >
      {texto}

      {obrigatorio && <span className="ml-1 text-red-500">*</span>}
    </label>
  );
}

export default NovoProcesso;
