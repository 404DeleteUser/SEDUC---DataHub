import { useEffect, useMemo, useState, type ReactNode } from 'react';



import {

  DndContext,

  PointerSensor,

  closestCenter,

  useSensor,

  useSensors,

  type DragEndEvent,

} from '@dnd-kit/core';



import {

  SortableContext,

  arrayMove,

  useSortable,

  verticalListSortingStrategy,

} from '@dnd-kit/sortable';



import { CSS } from '@dnd-kit/utilities';



import * as XLSX from 'xlsx';



import {

  ArrowLeft,

  Check,

  ChevronDown,

  ChevronUp,

  Code2,

  FileCode2,

  FolderCode,

  GripVertical,

  ListChecks,

  Plus,

  Save,

  Settings2,

  TerminalSquare,

  Trash2,

} from 'lucide-react';



import { ferramentasMock } from '../mock/ferramentasMock';



import type {

  ArquivoDisponivel,

  EtapaProcesso,

  ProcessoBase,

  TipoCondicaoEtapa,

} from '../types/processo';



type ConfigurarProcessoProps = {

  processo: ProcessoBase;

  onVoltar: () => void;

  onSalvar: () => void;

};



function ConfigurarProcesso({

  processo,

  onVoltar,

  onSalvar,

}: ConfigurarProcessoProps) {

  /* ===================================================== */

  /* 1. CÓDIGO DO PROCESSO */

  /* ===================================================== */



  const [modoCodigo, setModoCodigo] = useState<'arquivo' | 'pasta'>('arquivo');



  const [caminhoCodigo, setCaminhoCodigo] = useState('');



  /* ===================================================== */

  /* EXPANSÃO DAS PLANILHAS */

  /* ===================================================== */



  const [planilhasExpandidas, setPlanilhasExpandidas] = useState<

    Record<string, boolean>

  >({});



  /* ===================================================== */

  /* 2. FLUXO */

  /* ===================================================== */



  const [etapas, setEtapas] = useState<EtapaProcesso[]>([]);



  const [etapaSelecionadaId, setEtapaSelecionadaId] = useState<number | null>(

    null

  );



  const [ferramentaParaAdicionar, setFerramentaParaAdicionar] = useState(

    ferramentasMock[0]?.id ?? ''

  );



  /* ===================================================== */

  /* COLUNAS DOS ARQUIVOS */

  /* ===================================================== */



  const [colunasPorArquivo, setColunasPorArquivo] = useState<

    Record<string, string[]>

  >({});



  const [carregandoColunas, setCarregandoColunas] = useState(false);



  /* ===================================================== */

  /* 4. LOGS */

  /* ===================================================== */



  const [mostrarLinhas, setMostrarLinhas] = useState(true);

  const [mostrarTempo, setMostrarTempo] = useState(true);

  const [mostrarArquivos, setMostrarArquivos] = useState(false);

  const [mostrarEtapas, setMostrarEtapas] = useState(false);



  const [indicadorPrincipal, setIndicadorPrincipal] = useState('linhas');



  /* ===================================================== */

  /* DRAG AND DROP */

  /* ===================================================== */



  const sensors = useSensors(

    useSensor(PointerSensor, {

      activationConstraint: {

        distance: 5,

      },

    })

  );



  /* ===================================================== */

  /* ARQUIVOS VINDOS DA PRIMEIRA TELA */

  /* ===================================================== */



  const arquivosDisponiveis = useMemo<ArquivoDisponivel[]>(() => {

    const arquivos: ArquivoDisponivel[] = [];



    if (processo.arquivosPrincipais.principal1) {

      arquivos.push({

        id: 'principal-1',

        nome: processo.arquivosPrincipais.principal1.name,

        tipo: 'principal',

        arquivo: processo.arquivosPrincipais.principal1,

      });

    }



    if (processo.arquivosPrincipais.principal2) {

      arquivos.push({

        id: 'principal-2',

        nome: processo.arquivosPrincipais.principal2.name,

        tipo: 'principal',

        arquivo: processo.arquivosPrincipais.principal2,

      });

    }



    processo.auxiliares.forEach((auxiliar, index) => {

      if (!auxiliar.arquivo) {

        return;

      }



      arquivos.push({

        id: `auxiliar-${auxiliar.id}`,



        nome:

          auxiliar.nome.trim() ||

          auxiliar.arquivo.name ||

          `Auxiliar ${index + 1}`,



        tipo: 'auxiliar',

        arquivo: auxiliar.arquivo,

      });

    });



    return arquivos;

  }, [processo]);



  /* ===================================================== */

  /* ETAPA SELECIONADA */

  /* ===================================================== */



  const etapaSelecionada = etapas.find(

    (etapa) => etapa.id === etapaSelecionadaId

  );



  const ferramentaSelecionada = etapaSelecionada

    ? ferramentasMock.find(

        (ferramenta) => ferramenta.id === etapaSelecionada.ferramentaId

      )

    : undefined;



  /* ===================================================== */

  /* LEITURA DAS COLUNAS */

  /* ===================================================== */



  useEffect(() => {

    let cancelado = false;



    async function carregarColunas() {

      setCarregandoColunas(true);



      const resultado: Record<string, string[]> = {};



      for (const item of arquivosDisponiveis) {

        try {

          const extensao = item.arquivo.name.split('.').pop()?.toLowerCase();



          if (extensao !== 'xlsx' && extensao !== 'xls' && extensao !== 'csv') {

            resultado[item.id] = [];

            continue;

          }



          const buffer = await item.arquivo.arrayBuffer();



          const workbook = XLSX.read(buffer, {

            type: 'array',

          });



          const nomePrimeiraAba = workbook.SheetNames[0];



          if (!nomePrimeiraAba) {

            resultado[item.id] = [];

            continue;

          }



          const worksheet = workbook.Sheets[nomePrimeiraAba];



          if (!worksheet) {

            resultado[item.id] = [];

            continue;

          }



          const linhas = XLSX.utils.sheet_to_json<unknown[]>(worksheet, {

            header: 1,

            defval: '',

            blankrows: false,

          });



          if (linhas.length === 0) {

            resultado[item.id] = [];

            continue;

          }



          const cabecalho = linhas[0];



          if (!Array.isArray(cabecalho)) {

            resultado[item.id] = [];

            continue;

          }



          const colunas = cabecalho

            .map((coluna) => String(coluna ?? '').trim())

            .filter(

              (coluna, index, array) =>

                coluna.length > 0 && array.indexOf(coluna) === index

            );



          resultado[item.id] = colunas;

        } catch (erro) {

          console.error(`Erro ao ler colunas de ${item.nome}:`, erro);



          resultado[item.id] = [];

        }

      }



      if (!cancelado) {

        setColunasPorArquivo(resultado);

        setCarregandoColunas(false);

      }

    }



    void carregarColunas();



    return () => {

      cancelado = true;

    };

  }, [arquivosDisponiveis]);



  /* ===================================================== */

  /* EXPANDIR PLANILHA */

  /* ===================================================== */



  function alternarExpansaoPlanilha(etapaId: number, arquivoId: string) {

    const chave = `${etapaId}-${arquivoId}`;



    setPlanilhasExpandidas((anterior) => ({

      ...anterior,

      [chave]: !anterior[chave],

    }));

  }



  /* ===================================================== */

  /* ADICIONAR FERRAMENTA */

  /* ===================================================== */



  function adicionarFerramenta() {

    if (!ferramentaParaAdicionar) {

      return;

    }



    const novaEtapa: EtapaProcesso = {

      id: Date.now(),



      ferramentaId: ferramentaParaAdicionar,



      planilhas: [],



      condicao: {

        ativa: false,

        tipo: 'coluna-existe',

        arquivoId: '',

        coluna: '',

        valor: '',

      },

    };



    setEtapas((anteriores) => [...anteriores, novaEtapa]);



    setEtapaSelecionadaId(novaEtapa.id);

  }



  /* ===================================================== */

  /* REMOVER ETAPA */

  /* ===================================================== */



  function removerEtapa(id: number) {

    setEtapas((anteriores) => anteriores.filter((etapa) => etapa.id !== id));



    if (etapaSelecionadaId === id) {

      setEtapaSelecionadaId(null);

    }

  }



  /* ===================================================== */

  /* ATUALIZAR ETAPA */

  /* ===================================================== */



  function atualizarEtapa(id: number, alteracoes: Partial<EtapaProcesso>) {

    setEtapas((anteriores) =>

      anteriores.map((etapa) =>

        etapa.id === id

          ? {

              ...etapa,

              ...alteracoes,

            }

          : etapa

      )

    );

  }



  /* ===================================================== */

  /* FINALIZAR ARRASTE */

  /* ===================================================== */



  function finalizarArraste(event: DragEndEvent) {

    const { active, over } = event;



    if (!over || active.id === over.id) {

      return;

    }



    setEtapas((anteriores) => {

      const indiceAntigo = anteriores.findIndex(

        (etapa) => etapa.id === active.id

      );



      const indiceNovo = anteriores.findIndex((etapa) => etapa.id === over.id);



      if (indiceAntigo === -1 || indiceNovo === -1) {

        return anteriores;

      }



      return arrayMove(anteriores, indiceAntigo, indiceNovo);

    });

  }



  /* ===================================================== */

  /* ALTERNAR PLANILHA */

  /* ===================================================== */



  function alternarPlanilha(etapaId: number, arquivoId: string) {

    const etapa = etapas.find((item) => item.id === etapaId);



    if (!etapa) {

      return;

    }



    const selecionada = etapa.planilhas.some(

      (planilha) => planilha.arquivoId === arquivoId

    );



    const novasPlanilhas = selecionada

      ? etapa.planilhas.filter((planilha) => planilha.arquivoId !== arquivoId)

      : [

          ...etapa.planilhas,

          {

            arquivoId,

            colunas: [],

          },

        ];



    atualizarEtapa(etapaId, {

      planilhas: novasPlanilhas,



      condicao:

        selecionada && etapa.condicao.arquivoId === arquivoId

          ? {

              ...etapa.condicao,

              arquivoId: '',

              coluna: '',

              valor: '',

            }

          : etapa.condicao,

    });

  }



  /* ===================================================== */

  /* COLUNAS */

  /* ===================================================== */



  function alternarColunaPlanilha(

    etapaId: number,

    arquivoId: string,

    coluna: string

  ) {

    const etapa = etapas.find((item) => item.id === etapaId);



    if (!etapa) {

      return;

    }



    const novasPlanilhas = etapa.planilhas.map((planilha) => {

      if (planilha.arquivoId !== arquivoId) {

        return planilha;

      }



      const selecionada = planilha.colunas.includes(coluna);



      return {

        ...planilha,



        colunas: selecionada

          ? planilha.colunas.filter((item) => item !== coluna)

          : [...planilha.colunas, coluna],

      };

    });



    atualizarEtapa(etapaId, {

      planilhas: novasPlanilhas,

    });

  }



  function selecionarTodasColunas(

    etapaId: number,

    arquivoId: string,

    colunasDisponiveis: string[]

  ) {

    const etapa = etapas.find((item) => item.id === etapaId);



    if (!etapa) {

      return;

    }



    const planilhaAtual = etapa.planilhas.find(

      (planilha) => planilha.arquivoId === arquivoId

    );



    if (!planilhaAtual) {

      return;

    }



    const todasSelecionadas = colunasDisponiveis.every((coluna) =>

      planilhaAtual.colunas.includes(coluna)

    );



    const novasPlanilhas = etapa.planilhas.map((planilha) =>

      planilha.arquivoId === arquivoId

        ? {

            ...planilha,



            colunas: todasSelecionadas ? [] : [...colunasDisponiveis],

          }

        : planilha

    );



    atualizarEtapa(etapaId, {

      planilhas: novasPlanilhas,

    });

  }



  /* ===================================================== */

  /* SALVAR */

  /* ===================================================== */



  function salvarProcesso() {

    const configuracaoCompleta = {

      ...processo,



      codigo: {

        modo: modoCodigo,

        caminho: caminhoCodigo,

      },



      etapas,



      logs: {

        mostrarLinhas,

        mostrarTempo,

        mostrarArquivos,

        mostrarEtapas,

        indicadorPrincipal,

      },

    };



    console.log('PROCESSO COMPLETO:', configuracaoCompleta);



    onSalvar();

  }



  return (
    <main
      className="
        flex-1
        min-w-0
        h-screen
        bg-[var(--bg-app)]
        text-white
        overflow-hidden
        flex
        flex-col
      "
    >
      {/* ================================================= */}
      {/* CABEÇALHO */}
      {/* ================================================= */}

      <header
        className="
          h-[100px]
          shrink-0
          px-6
          flex
          items-center
        "
      >

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onVoltar}
            title="Voltar"
            className="
              w-9
              h-9
              flex
              items-center
              justify-center
              rounded-lg
              text-[var(--text-secondary)]
              hover:text-white
              hover:bg-[var(--hover)]
              transition-colors
            "
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Configuração do Processo
            </h1>

            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Configure código, ferramentas, regras e logs.
            </p>
          </div>
        </div>
      </header>

      {/* ================================================= */}
      {/* CONTEÚDO */}
      {/* ================================================= */}

      <div
        className="
          flex-1
          min-h-0
          overflow-y-auto
          px-6
          py-3
        "
      >

        <div className="space-y-4">
          {/* ================================================= */}
          {/* LINHA SUPERIOR - 1 E 2 */}
          {/* ================================================= */}

          <div
            className="
              grid
              grid-cols-1
              2xl:grid-cols-2
              gap-4
            "
          >

            {/* ================================================= */}
            {/* 1. CÓDIGO */}
            {/* ================================================= */}

            <section
              className="
                painel-processo
                2xl:h-[355px]
              "
            >
              <TituloSecao
                numero="1"
                titulo="Código do Processo"
                icone={<Code2 size={19} />}
              />

              <p className="mt-1 text-xs text-[var(--text-secondary)]">
                Vincule um código existente ou deixe o DataHub montar o processo
                com as ferramentas configuradas abaixo.
              </p>

              <div className="mt-4">
                <Label texto="Tipo de origem" />
                <div
                  className="
                    mt-2
                    grid
                    grid-cols-2
                    gap-3
                  "
                >

                  <button
                    type="button"
                    onClick={() => setModoCodigo('arquivo')}
                    className={`
                      opcao-modo
                      ${
                        modoCodigo === 'arquivo'
                          ? 'border-blue-500 bg-blue-500/10'
                          : ''
                      }
                    `}
                  >

                    <FileCode2 size={18} />



                    <div>

                      <p className="font-medium">Arquivo</p>



                      <p className="text-xs text-[var(--text-secondary)]">Ex.: main.py</p>

                    </div>

                  </button>



                  <button

                    type="button"

                    onClick={() => setModoCodigo('pasta')}

                    className={`

                      opcao-modo



                      ${

                        modoCodigo === 'pasta'

                          ? 'border-blue-500 bg-blue-500/10'

                          : ''

                      }

                    `}

                  >

                    <FolderCode size={18} />



                    <div>

                      <p className="font-medium">Pasta</p>



                      <p className="text-xs text-[var(--text-secondary)]">

                        Pasta completa do processo.

                      </p>

                    </div>

                  </button>

                </div>

              </div>



              <div className="mt-4">

                <Label

                  texto={

                    modoCodigo === 'arquivo'

                      ? 'Arquivo principal'

                      : 'Pasta do processo'

                  }

                />



                <div

                  className="

                    mt-2

                    flex

                    items-center

                    gap-2

                  "

                >

                  <input

                    value={caminhoCodigo}

                    onChange={(event) => setCaminhoCodigo(event.target.value)}

                    placeholder={

                      modoCodigo === 'arquivo'

                        ? 'Ex.: processos/auditoria/main.py'

                        : 'Ex.: processos/auditoria/'

                    }

                    className="

                      h-9

                      flex-1

                      rounded-md

                      border

                      border-[var(--border)]

                      bg-[var(--bg-card-secondary)]

                      px-3

                      text-sm

                      outline-none

                      placeholder:text-[var(--text-muted)]

                      focus:border-blue-500

                    "

                  />



                  <button

                    type="button"

                    className="

                      h-9

                      px-4

                      shrink-0

                      rounded-md

                      border

                      border-[var(--border-hover)]

                      bg-[var(--hover)]

                      text-xs

                      hover:border-blue-500

                    "

                  >

                    Selecionar

                  </button>

                </div>

              </div>

            </section>



            {/* ================================================= */}

            {/* 2. FLUXO */}

            {/* ================================================= */}



            <section

              className="

                painel-processo

                2xl:h-[355px]

                flex

                flex-col

              "

            >

              <TituloSecao

                numero="2"

                titulo="Fluxo de Execução"

                icone={<ListChecks size={19} />}

              />



              <p className="mt-1 text-xs text-[var(--text-secondary)]">

                Arraste as etapas pelo ícone lateral para alterar a ordem de

                execução.

              </p>



              {/* ============================================= */}

              {/* ÁREA COM SCROLL */}

              {/* ============================================= */}



              <div

                className="

                  mt-3

                  flex-1

                  min-h-0

                  overflow-y-auto

                  pr-1

                  scrollbar-thin

                "

              >

                {etapas.length === 0 ? (

                  <div

                    className="

                      h-full

                      min-h-[150px]

                      flex

                      items-center

                      justify-center

                      rounded-lg

                      border

                      border-dashed

                      border-[var(--border)]

                      text-xs

                      text-[var(--text-muted)]

                    "

                  >

                    Nenhuma ferramenta adicionada.

                  </div>

                ) : (

                  <DndContext

                    sensors={sensors}

                    collisionDetection={closestCenter}

                    onDragEnd={finalizarArraste}

                  >

                    <SortableContext

                      items={etapas.map((etapa) => etapa.id)}

                      strategy={verticalListSortingStrategy}

                    >

                      <div className="space-y-2">

                        {etapas.map((etapa, indice) => (

                          <EtapaOrdenavel

                            key={etapa.id}

                            etapa={etapa}

                            indice={indice}

                            selecionada={etapaSelecionadaId === etapa.id}

                            onSelecionar={() => setEtapaSelecionadaId(etapa.id)}

                            onRemover={() => removerEtapa(etapa.id)}

                          />

                        ))}

                      </div>

                    </SortableContext>

                  </DndContext>

                )}

              </div>



              {/* ============================================= */}

              {/* ADICIONAR - SEMPRE FIXO ABAIXO DO SCROLL */}

              {/* ============================================= */}



              <div

                className="

                  mt-3

                  shrink-0

                  flex

                  items-center

                  gap-2

                "

              >

                <select

                  value={ferramentaParaAdicionar}

                  onChange={(event) =>

                    setFerramentaParaAdicionar(event.target.value)

                  }

                  className="

                    h-9

                    flex-1

                    min-w-0

                    rounded-md

                    border

                    border-[var(--border)]

                    bg-[var(--bg-card-secondary)]

                    px-3

                    text-sm

                    outline-none

                    focus:border-blue-500

                  "

                >

                  {ferramentasMock.map((ferramenta) => (

                    <option key={ferramenta.id} value={ferramenta.id}>

                      {ferramenta.nome}

                    </option>

                  ))}

                </select>



                <button

                  type="button"

                  onClick={adicionarFerramenta}

                  className="

                    h-9

                    px-4

                    shrink-0

                    rounded-md

                    border

                    border-blue-500

                    bg-[var(--hover)]

                    flex

                    items-center

                    gap-2

                    text-xs

                    hover:bg-blue-600

                    transition-colors

                  "

                >

                  <Plus size={16} />

                  Adicionar

                </button>

              </div>

            </section>

          </div>



          {/* ================================================= */}

          {/* 3. CONFIGURAÇÃO - LARGURA TOTAL */}

          {/* ================================================= */}



          <section className="painel-processo">

            <TituloSecao

              numero="3"

              titulo="Configuração da Etapa"

              icone={<Settings2 size={19} />}

            />



            <p className="mt-1 text-xs text-[var(--text-secondary)]">

              Configure os parâmetros da ferramenta selecionada e os arquivos

              que serão utilizados nesta etapa.

            </p>



            {!etapaSelecionada || !ferramentaSelecionada ? (

              <div className="estado-vazio">

                Selecione uma ferramenta no fluxo para configurá-la.

              </div>

            ) : (

              <div className="mt-3 space-y-3">

                <FerramentaCabecalho ferramenta={ferramentaSelecionada} />



                {/* ========================================= */}

                {/* PLANILHAS */}

                {/* ========================================= */}



                <div>

                  <Label texto="Planilhas utilizadas nesta etapa" />



                  {arquivosDisponiveis.length === 0 ? (

                    <div className="estado-vazio">

                      Nenhum arquivo foi selecionado na etapa anterior.

                    </div>

                  ) : (

                    <div

                      className="

                        mt-2

                        grid

                        grid-cols-1

                        md:grid-cols-2

                        xl:grid-cols-3

                        gap-2

                      "

                    >

                      {arquivosDisponiveis.map((arquivo) => {

                        const selecionada = etapaSelecionada.planilhas.some(

                          (planilha) => planilha.arquivoId === arquivo.id

                        );



                        return (

                          <button

                            key={arquivo.id}

                            type="button"

                            onClick={() =>

                              alternarPlanilha(etapaSelecionada.id, arquivo.id)

                            }

                            className={`

                                min-h-12

                                px-3

                                rounded-md

                                border

                                flex

                                items-center

                                gap-3

                                text-left

                                transition-colors



                                ${

                                  selecionada

                                    ? 'border-blue-500 bg-blue-500/15 text-[var(--text-primary)]'

                                    : 'border-[var(--border)] bg-[var(--bg-card-secondary)] text-[var(--text-secondary)] hover:border-blue-500'

                                }

                              `}

                          >

                            <div

                              className={`

                                  w-5

                                  h-5

                                  shrink-0

                                  rounded

                                  border

                                  flex

                                  items-center

                                  justify-center



                                  ${

                                    selecionada

                                      ? 'border-blue-500 bg-blue-600'

                                      : 'border-slate-500'

                                  }

                                `}

                            >

                              {selecionada && <Check size={13} />}

                            </div>



                            <div className="min-w-0">

                              <p

                                className="

                                    text-xs

                                    font-medium

                                    truncate

                                  "

                              >

                                {arquivo.nome}

                              </p>



                              <p

                                className="

                                    text-[10px]

                                    text-[var(--text-muted)]

                                  "

                              >

                                {arquivo.tipo === 'principal'

                                  ? 'Arquivo principal'

                                  : 'Arquivo auxiliar'}

                              </p>

                            </div>

                          </button>

                        );

                      })}

                    </div>

                  )}

                </div>



                {/* ========================================= */}

                {/* COLUNAS */}

                {/* ========================================= */}



                {ferramentaSelecionada.usaColunas &&

                  etapaSelecionada.planilhas.length > 0 && (

                    <div>

                      <Label texto="Colunas utilizadas em cada planilha" />



                      <div className="mt-2 space-y-2">

                        {etapaSelecionada.planilhas.map((planilhaEtapa) => {

                          const arquivo = arquivosDisponiveis.find(

                            (item) => item.id === planilhaEtapa.arquivoId

                          );



                          if (!arquivo) {

                            return null;

                          }



                          const colunas = colunasPorArquivo[arquivo.id] ?? [];



                          const chaveExpansao = `${etapaSelecionada.id}-${arquivo.id}`;



                          const expandida =

                            planilhasExpandidas[chaveExpansao] ?? false;



                          const todasSelecionadas =

                            colunas.length > 0 &&

                            colunas.every((coluna) =>

                              planilhaEtapa.colunas.includes(coluna)

                            );



                          return (

                            <div

                              key={arquivo.id}

                              className="

                                  rounded-lg

                                  border

                                  border-[var(--border)]

                                  bg-[var(--bg-card-secondary)]

                                  overflow-hidden

                                "

                            >

                              <button

                                type="button"

                                onClick={() =>

                                  alternarExpansaoPlanilha(

                                    etapaSelecionada.id,

                                    arquivo.id

                                  )

                                }

                                className="

                                    w-full

                                    min-h-[48px]

                                    px-3

                                    flex

                                    items-center

                                    justify-between

                                    gap-4

                                    text-left

                                    hover:bg-[var(--hover)]

                                  "

                              >

                                <div

                                  className="

                                      min-w-0

                                      flex

                                      items-center

                                      gap-3

                                    "

                                >

                                  <p

                                    className="

                                        text-sm

                                        font-semibold

                                        truncate

                                      "

                                  >

                                    {arquivo.nome}

                                  </p>



                                  <span className="text-[var(--border-hover)]">|</span>



                                  <span className="text-[11px] text-[var(--text-muted)]">

                                    {carregandoColunas

                                      ? 'Lendo...'

                                      : `${colunas.length} colunas encontradas`}

                                  </span>



                                  <span className="text-[var(--border-hover)]">|</span>



                                  <span className="text-[11px] text-blue-400">

                                    {planilhaEtapa.colunas.length} selecionadas

                                  </span>

                                </div>



                                {expandida ? (

                                  <ChevronUp size={17} />

                                ) : (

                                  <ChevronDown size={17} />

                                )}

                              </button>



                              {expandida && (

                                <div

                                  className="

                                      px-3

                                      pb-3

                                      border-t

                                      border-[var(--border)]

                                    "

                                >

                                  {carregandoColunas ? (

                                    <div className="pt-3 text-xs text-[var(--text-muted)]">

                                      Carregando cabeçalhos...

                                    </div>

                                  ) : colunas.length === 0 ? (

                                    <div className="mt-3 text-xs text-[var(--text-muted)]">

                                      Nenhuma coluna identificada.

                                    </div>

                                  ) : (

                                    <>

                                      <div

                                        className="

                                            pt-3

                                            pb-2

                                            flex

                                            justify-between

                                          "

                                      >

                                        <span className="text-[11px] text-[var(--text-muted)]">

                                          Selecione as colunas utilizadas.

                                        </span>



                                        <button

                                          type="button"

                                          onClick={() =>

                                            selecionarTodasColunas(

                                              etapaSelecionada.id,

                                              arquivo.id,

                                              colunas

                                            )

                                          }

                                          className="text-[11px] text-blue-400"

                                        >

                                          {todasSelecionadas

                                            ? 'Limpar seleção'

                                            : 'Selecionar todas'}

                                        </button>

                                      </div>



                                      <div

                                        className="

                                            grid

                                            grid-cols-2

                                            md:grid-cols-4

                                            xl:grid-cols-6

                                            gap-2

                                          "

                                      >

                                        {colunas.map((coluna) => {

                                          const selecionada =

                                            planilhaEtapa.colunas.includes(

                                              coluna

                                            );



                                          return (

                                            <button

                                              key={coluna}

                                              type="button"

                                              onClick={() =>

                                                alternarColunaPlanilha(

                                                  etapaSelecionada.id,

                                                  arquivo.id,

                                                  coluna

                                                )

                                              }

                                              className={`

                                                    min-h-9

                                                    px-2

                                                    rounded-md

                                                    border

                                                    text-xs

                                                    transition-colors



                                                    ${

                                                      selecionada

                                                        ? 'border-blue-500 bg-blue-500/15 text-[var(--text-primary)]'

                                                        : 'border-[var(--border)] bg-[var(--bg-input)] text-[var(--text-secondary)]'

                                                    }

                                                  `}

                                            >

                                              {coluna}

                                            </button>

                                          );

                                        })}

                                      </div>

                                    </>

                                  )}

                                </div>

                              )}

                            </div>

                          );

                        })}

                      </div>

                    </div>

                  )}



                {/* ========================================= */}

                {/* CONDIÇÃO */}

                {/* ========================================= */}



                <div

                  className="

                    rounded-lg

                    border

                    border-[var(--border)]

                    bg-[var(--bg-card-secondary)]

                    p-3

                  "

                >

                  <label

                    className="

                      flex

                      items-center

                      gap-2

                      text-sm

                      font-medium

                      cursor-pointer

                    "

                  >

                    <input

                      type="checkbox"

                      checked={etapaSelecionada.condicao.ativa}

                      onChange={(event) =>

                        atualizarEtapa(etapaSelecionada.id, {

                          condicao: {

                            ...etapaSelecionada.condicao,

                            ativa: event.target.checked,

                          },

                        })

                      }

                    />

                    Executar somente se uma condição for atendida

                  </label>



                  {etapaSelecionada.condicao.ativa && (

                    <div

                      className="

                        mt-3

                        grid

                        grid-cols-1

                        xl:grid-cols-4

                        gap-2

                      "

                    >

                      <select

                        value={etapaSelecionada.condicao.arquivoId}

                        onChange={(event) =>

                          atualizarEtapa(etapaSelecionada.id, {

                            condicao: {

                              ...etapaSelecionada.condicao,



                              arquivoId: event.target.value,



                              coluna: '',

                              valor: '',

                            },

                          })

                        }

                        className="campo-processo"

                      >

                        <option value="">Planilha...</option>



                        {etapaSelecionada.planilhas.map((planilha) => {

                          const arquivo = arquivosDisponiveis.find(

                            (item) => item.id === planilha.arquivoId

                          );



                          if (!arquivo) {

                            return null;

                          }



                          return (

                            <option key={arquivo.id} value={arquivo.id}>

                              {arquivo.nome}

                            </option>

                          );

                        })}

                      </select>



                      <select

                        value={etapaSelecionada.condicao.coluna}

                        onChange={(event) =>

                          atualizarEtapa(etapaSelecionada.id, {

                            condicao: {

                              ...etapaSelecionada.condicao,

                              coluna: event.target.value,

                            },

                          })

                        }

                        className="campo-processo"

                        disabled={!etapaSelecionada.condicao.arquivoId}

                      >

                        <option value="">Coluna...</option>



                        {(

                          colunasPorArquivo[

                            etapaSelecionada.condicao.arquivoId

                          ] ?? []

                        ).map((coluna) => (

                          <option key={coluna} value={coluna}>

                            {coluna}

                          </option>

                        ))}

                      </select>



                      <select

                        value={etapaSelecionada.condicao.tipo}

                        onChange={(event) =>

                          atualizarEtapa(etapaSelecionada.id, {

                            condicao: {

                              ...etapaSelecionada.condicao,



                              tipo: event.target.value as TipoCondicaoEtapa,

                            },

                          })

                        }

                        className="campo-processo"

                      >

                        <option value="coluna-existe">

                          Coluna deve existir

                        </option>



                        <option value="igual">Igual a</option>



                        <option value="diferente">Diferente de</option>



                        <option value="nao-vazio">Não pode estar vazio</option>

                      </select>



                      <input

                        value={etapaSelecionada.condicao.valor}

                        disabled={

                          etapaSelecionada.condicao.tipo === 'coluna-existe' ||

                          etapaSelecionada.condicao.tipo === 'nao-vazio'

                        }

                        onChange={(event) =>

                          atualizarEtapa(etapaSelecionada.id, {

                            condicao: {

                              ...etapaSelecionada.condicao,

                              valor: event.target.value,

                            },

                          })

                        }

                        placeholder="Valor"

                        className="

                          campo-processo

                          disabled:opacity-40

                        "

                      />

                    </div>

                  )}

                </div>

              </div>

            )}

          </section>



          {/* ================================================= */}

          {/* 4. LOGS - LARGURA TOTAL E COMPACTO */}

          {/* ================================================= */}



          <section className="painel-processo">

            <TituloSecao

              numero="4"

              titulo="Logs de Execução"

              icone={<TerminalSquare size={19} />}

            />



            <p className="mt-1 text-xs text-[var(--text-secondary)]">

              Defina quais informações serão mantidas no histórico do processo.

            </p>



            <div

              className="

                mt-3

                flex

                flex-col

                xl:flex-row

                xl:items-end

                gap-3

              "

            >

              <div

                className="

                  flex-1

                  grid

                  grid-cols-1

                  md:grid-cols-2

                  xl:grid-cols-4

                  gap-2

                "

              >

                <LogCheckbox

                  texto="Linhas processadas"

                  checked={mostrarLinhas}

                  onChange={setMostrarLinhas}

                />



                <LogCheckbox

                  texto="Tempo de execução"

                  checked={mostrarTempo}

                  onChange={setMostrarTempo}

                />



                <LogCheckbox

                  texto="Arquivos processados"

                  checked={mostrarArquivos}

                  onChange={setMostrarArquivos}

                />



                <LogCheckbox

                  texto="Etapas executadas"

                  checked={mostrarEtapas}

                  onChange={setMostrarEtapas}

                />

              </div>



              <div

                className="

                  xl:w-[320px]

                  xl:pl-4

                  xl:border-l

                  xl:border-[var(--border)]

                "

              >

                <Label texto="Indicador principal" />



                <select

                  value={indicadorPrincipal}

                  onChange={(event) =>

                    setIndicadorPrincipal(event.target.value)

                  }

                  className="campo-processo"

                >

                  <option value="linhas">Linhas processadas</option>



                  <option value="tempo">Tempo de execução</option>



                  <option value="arquivos">Arquivos processados</option>



                  <option value="etapas">Etapas executadas</option>

                </select>

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

          px-6

          flex

          items-center

          justify-end

          gap-3

          bg-[var(--bg-input)]

          border-t

          border-[var(--border)]

        "

      >

        <button

          type="button"

          onClick={onVoltar}

          className="

            h-10

            px-5

            flex

            items-center

            gap-2

            rounded-lg

            border

            border-[var(--border)]

            text-sm

            hover:bg-white/5

          "

        >

          <ArrowLeft size={16} />

          Voltar

        </button>



        <button

          type="button"

          onClick={salvarProcesso}

          className="

            h-10

            px-6

            flex

            items-center

            gap-2

            rounded-lg

            bg-blue-600

            text-sm

            font-medium

            hover:bg-blue-500

          "

        >

          <Save size={16} />

          Salvar Processo

        </button>

      </footer>

    </main>

  );

}



/* ===================================================== */

/* ETAPA ARRASTÁVEL */

/* ===================================================== */



type EtapaOrdenavelProps = {

  etapa: EtapaProcesso;

  indice: number;

  selecionada: boolean;

  onSelecionar: () => void;

  onRemover: () => void;

};



function EtapaOrdenavel({

  etapa,

  indice,

  selecionada,

  onSelecionar,

  onRemover,

}: EtapaOrdenavelProps) {

  const ferramenta = ferramentasMock.find(

    (item) => item.id === etapa.ferramentaId

  );



  const {

    attributes,

    listeners,

    setNodeRef,

    transform,

    transition,

    isDragging,

  } = useSortable({

    id: etapa.id,

  });



  if (!ferramenta) {

    return null;

  }



  const Icone = ferramenta.icone;



  const style = {

    transform: CSS.Transform.toString(transform),

    transition,

  };



  return (

    <div

      ref={setNodeRef}

      style={style}

      onClick={onSelecionar}

      className={`

        min-h-[54px]

        flex

        items-center

        rounded-lg

        border

        cursor-pointer

        transition-colors



        ${

          selecionada

            ? 'border-blue-500 bg-blue-500/10'

            : 'border-[var(--border)] bg-[var(--bg-card-secondary)] hover:border-[var(--border-hover)]'

        }



        ${isDragging ? 'opacity-60 z-50' : ''}

      `}

    >

      {/* Grip agora integrado visualmente ao item */}



      <button

        type="button"

        {...attributes}

        {...listeners}

        onClick={(event) => event.stopPropagation()}

        title="Arrastar etapa"

        className="

          w-10

          self-stretch

          shrink-0

          flex

          items-center

          justify-center

          border-r

          border-[var(--border)]

          text-[var(--text-muted)]

          hover:text-[var(--text-secondary)]

          cursor-grab

          active:cursor-grabbing

          touch-none

        "

      >

        <GripVertical size={18} />

      </button>



      <div

        className="

          flex-1

          min-w-0

          px-3

          py-2

          flex

          items-center

          gap-3

        "

      >

        <div

          className="

            w-7

            h-7

            shrink-0

            rounded-full

            bg-[var(--hover)]

            flex

            items-center

            justify-center

            text-xs

            font-semibold

          "

        >

          {indice + 1}

        </div>



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

            ${ferramenta.cor}

          `}

        >

          <Icone size={17} />

        </div>



        <div className="flex-1 min-w-0">

          <p

            className="

              text-sm

              font-medium

              truncate

            "

          >

            {ferramenta.nome}

          </p>



          <p

            className="

              text-xs

              text-[var(--text-muted)]

              truncate

            "

          >

            {etapa.planilhas.length === 0

              ? ferramenta.descricao

              : `${etapa.planilhas.length} planilha(s) selecionada(s)`}

          </p>

        </div>



        <button

          type="button"

          onClick={(event) => {

            event.stopPropagation();

            onRemover();

          }}

          className="

            w-8

            h-8

            shrink-0

            flex

            items-center

            justify-center

            rounded-md

            text-[var(--text-muted)]

            hover:bg-red-500/10

            hover:text-red-400

          "

        >

          <Trash2 size={15} />

        </button>

      </div>

    </div>

  );

}



/* ===================================================== */

/* CABEÇALHO DA FERRAMENTA */

/* ===================================================== */



function FerramentaCabecalho({

  ferramenta,

}: {

  ferramenta: (typeof ferramentasMock)[number];

}) {

  const Icone = ferramenta.icone;



  return (

    <div

      className="

        flex

        items-center

        gap-3

        p-3

        rounded-lg

        border

        border-[var(--border)]

        bg-[var(--bg-card-secondary)]

      "

    >

      <div

        className={`

          w-10

          h-10

          shrink-0

          rounded-lg

          flex

          items-center

          justify-center

          text-white

          ${ferramenta.cor}

        `}

      >

        <Icone size={18} />

      </div>



      <div className="min-w-0">

        <p className="text-sm font-semibold">{ferramenta.nome}</p>



        <p className="text-xs text-[var(--text-secondary)]">{ferramenta.descricao}</p>

      </div>

    </div>

  );

}



/* ===================================================== */

/* TÍTULO */

/* ===================================================== */



function TituloSecao({

  numero,

  titulo,

  icone,

}: {

  numero: string;

  titulo: string;

  icone: ReactNode;

}) {

  return (

    <div className="flex items-center gap-2">

      <span className="text-cyan-400">{icone}</span>



      <h2 className="font-semibold">

        {numero}. {titulo}

      </h2>

    </div>

  );

}



/* ===================================================== */

/* LABEL */

/* ===================================================== */



function Label({ texto }: { texto: string }) {

  return <label className="text-xs font-medium text-[var(--text-secondary)]">{texto}</label>;

}



/* ===================================================== */

/* LOG CHECKBOX */

/* ===================================================== */



function LogCheckbox({

  texto,

  checked,

  onChange,

}: {

  texto: string;

  checked: boolean;

  onChange: (valor: boolean) => void;

}) {

  return (

    <label

      className={`

        h-10

        px-3

        flex

        items-center

        gap-3

        rounded-md

        border

        cursor-pointer

        transition-colors



        ${

          checked

            ? 'border-blue-500/40 bg-blue-500/5'

            : 'border-[var(--border)] bg-[var(--bg-card-secondary)]'

        }

      `}

    >

      <input

        type="checkbox"

        checked={checked}

        onChange={(event) => onChange(event.target.checked)}

      />



      <span className="text-xs font-medium">{texto}</span>

    </label>

  );

}



export default ConfigurarProcesso;
