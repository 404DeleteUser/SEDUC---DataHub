import { useEffect, useMemo, useState } from 'react';
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import {
  AlertCircle,
  ArrowLeft,
  Code2,
  ListPlus,
  Plus,
  Save,
  Wrench,
} from 'lucide-react';
import PageHeader, { ProcessSteps } from '../components/PageHeader';
import {
  Button,
  Checkbox,
  Field,
  SectionTitle,
  SimulationNotice,
} from '../components/ui';
import { ferramentasMock } from '../mock/ferramentasMock';
import type {
  ArquivoDisponivel,
  EtapaProcesso,
  ProcessoBase,
} from '../types/processo';
import { ConfiguracaoEtapa } from './configurar-processo/ConfiguracaoEtapa';
import { EtapaOrdenavel } from './configurar-processo/EtapaOrdenavel';

type ConfigurarProcessoProps = {
  processo: ProcessoBase;
  modoEdicao?: boolean;
  onVoltar: (processoAtualizado: ProcessoBase) => void;
  onSalvar: (processoAtualizado: ProcessoBase) => void;
};

const ferramentasAdicionaveis = ferramentasMock.filter(
  (ferramenta) => ferramenta.id !== 'script-python'
);

function ConfigurarProcesso({
  processo,
  modoEdicao = false,
  onVoltar,
  onSalvar,
}: ConfigurarProcessoProps) {
  /* ===================================================== */
  /* 1. CÓDIGO DO PROCESSO */
  /* ===================================================== */
  /* ===================================================== */
  /* EXPANSÃO DAS PLANILHAS */
  /* ===================================================== */
  const [planilhasExpandidas, setPlanilhasExpandidas] = useState<
    Record<string, boolean>
  >({});
  /* ===================================================== */
  /* 2. FLUXO */
  /* ===================================================== */
  const [etapas, setEtapas] = useState<EtapaProcesso[]>(processo.etapas);
  const [etapaSelecionadaId, setEtapaSelecionadaId] = useState<number | null>(
    processo.etapas[0]?.id ?? null
  );
  const [ferramentaParaAdicionar, setFerramentaParaAdicionar] = useState(
    ferramentasMock.find((ferramenta) => ferramenta.id !== 'script-python')
      ?.id ?? ''
  );
  /* ===================================================== */
  /* COLUNAS DOS ARQUIVOS */
  /* ===================================================== */
  const [colunasPorArquivo, setColunasPorArquivo] = useState<
    Record<string, string[]>
  >({});
  const [carregandoColunas, setCarregandoColunas] = useState(false);
  const [errosLeitura, setErrosLeitura] = useState<string[]>([]);
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
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
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
      const falhas: string[] = [];
      for (const item of arquivosDisponiveis) {
        try {
          const extensao = item.arquivo.name.split('.').pop()?.toLowerCase();
          if (extensao !== 'xlsx' && extensao !== 'xls' && extensao !== 'csv') {
            resultado[item.id] = [];
            falhas.push(item.nome);
            continue;
          }
          const buffer = await item.arquivo.arrayBuffer();
          const XLSX = await import('xlsx');
          const workbook = XLSX.read(buffer, {
            type: 'array',
          });
          const nomePrimeiraAba = workbook.SheetNames[0];
          if (!nomePrimeiraAba) {
            resultado[item.id] = [];
            falhas.push(item.nome);
            continue;
          }
          const worksheet = workbook.Sheets[nomePrimeiraAba];
          if (!worksheet) {
            resultado[item.id] = [];
            falhas.push(item.nome);
            continue;
          }
          const linhas = XLSX.utils.sheet_to_json<unknown[]>(worksheet, {
            header: 1,
            defval: '',
            blankrows: false,
          });
          if (linhas.length === 0) {
            resultado[item.id] = [];
            falhas.push(item.nome);
            continue;
          }
          const cabecalho = linhas[0];
          if (!Array.isArray(cabecalho)) {
            resultado[item.id] = [];
            falhas.push(item.nome);
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
          falhas.push(item.nome);
          resultado[item.id] = [];
        }
      }
      if (!cancelado) {
        setColunasPorArquivo(resultado);
        setErrosLeitura(falhas);
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
    onSalvar({
      ...processo,
      etapas,
    });
  }
  function voltarParaArquivos() {
    onVoltar({
      ...processo,
      etapas,
    });
  }
  const scriptConectado = processo.origem === 'script-python';

  return (
    <main id="conteudo-principal" tabIndex={-1} className="form-page">
      <PageHeader
        titulo={modoEdicao ? 'Editar Ferramentas' : 'Configurar Ferramentas'}
        descricao="Organize as etapas e ajuste as ferramentas do processo."
        onVoltar={voltarParaArquivos}
        acao={
          <SimulationNotice detail="As alterações deste processo não são persistidas." />
        }
      />
      <ProcessSteps atual={2} />

      <div className="form-content config-content">
        <div className="config-layout">
          {/* ORIGEM: faixa de resumo */}
          <section className="config-origin" aria-label="Origem do processo">
            {scriptConectado ? (
              <Code2 size={16} aria-hidden="true" />
            ) : (
              <Wrench size={16} aria-hidden="true" />
            )}
            <span className="config-origin__label">Origem:</span>
            <span className="config-origin__value">
              {scriptConectado
                ? `Script Python${processo.scriptPython ? ` · ${processo.scriptPython.name}` : ''}`
                : 'Ferramentas do DataHub'}
            </span>
            <span className="config-origin__description">
              {scriptConectado
                ? 'Script existente conectado ao processo.'
                : 'Processo criado com as ferramentas disponíveis no DataHub.'}
            </span>
          </section>

          {/* LEITURA DOS CABEÇALHOS */}
          {carregandoColunas && (
            <div className="config-reading" role="status" aria-busy="true">
              <span className="config-reading__skeleton" aria-hidden="true" />
              Lendo os cabeçalhos das planilhas…
            </div>
          )}
          {!carregandoColunas && errosLeitura.length > 0 && (
            <div role="alert" className="ui-alert ui-alert--error">
              <AlertCircle size={18} aria-hidden="true" />
              <p>
                Não foi possível identificar cabeçalhos em:{' '}
                {errosLeitura.join(', ')}. Revise os arquivos na etapa anterior;
                formatos de leitura disponíveis: XLSX, XLS e CSV.
              </p>
            </div>
          )}

          {/* MESTRE-DETALHE */}
          <div className="config-master-detail">
            <section
              className="ui-panel config-flow"
              aria-labelledby="titulo-fluxo"
            >
              <SectionTitle
                id="titulo-fluxo"
                step={1}
                title="Fluxo de execução"
                description="Arraste pelo ícone lateral ou use as setas para definir a ordem."
              />
              <div className="config-flow__list">
                {etapas.length === 0 ? (
                  <div className="ui-empty">
                    <ListPlus size={20} aria-hidden="true" />
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
                      <ol className="config-steps" aria-label="Etapas do fluxo">
                        {etapas.map((etapa, indice) => (
                          <EtapaOrdenavel
                            key={etapa.id}
                            etapa={etapa}
                            arquivoScript={processo.scriptPython}
                            removivel={etapa.ferramentaId !== 'script-python'}
                            indice={indice}
                            selecionada={etapaSelecionadaId === etapa.id}
                            onSelecionar={() => setEtapaSelecionadaId(etapa.id)}
                            onRemover={() => removerEtapa(etapa.id)}
                            primeira={indice === 0}
                            ultima={indice === etapas.length - 1}
                            onMover={(direcao) =>
                              setEtapas((anteriores) =>
                                arrayMove(anteriores, indice, indice + direcao)
                              )
                            }
                          />
                        ))}
                      </ol>
                    </SortableContext>
                  </DndContext>
                )}
              </div>
              <div className="config-flow__add">
                <Field
                  id="ferramenta-para-adicionar"
                  label="Ferramenta para adicionar"
                >
                  {(controle) => (
                    <select
                      {...controle}
                      name="ferramenta-para-adicionar"
                      autoComplete="off"
                      className="ui-input"
                      value={ferramentaParaAdicionar}
                      onChange={(event) =>
                        setFerramentaParaAdicionar(event.target.value)
                      }
                    >
                      {ferramentasAdicionaveis.map((ferramenta) => (
                        <option key={ferramenta.id} value={ferramenta.id}>
                          {ferramenta.nome}
                        </option>
                      ))}
                    </select>
                  )}
                </Field>
                <Button icon={Plus} onClick={adicionarFerramenta}>
                  Adicionar
                </Button>
              </div>
            </section>

            <section
              className="ui-panel config-detail"
              aria-labelledby="titulo-configuracao-etapa"
            >
              <SectionTitle
                id="titulo-configuracao-etapa"
                step={2}
                title="Configuração da etapa"
                description="Configure os parâmetros da ferramenta selecionada e os arquivos que serão utilizados nesta etapa."
              />
              <ConfiguracaoEtapa
                etapa={etapaSelecionada}
                ferramenta={ferramentaSelecionada}
                arquivoScript={processo.scriptPython}
                arquivosDisponiveis={arquivosDisponiveis}
                colunasPorArquivo={colunasPorArquivo}
                carregandoColunas={carregandoColunas}
                planilhasExpandidas={planilhasExpandidas}
                onAlternarPlanilha={(arquivoId) =>
                  etapaSelecionada &&
                  alternarPlanilha(etapaSelecionada.id, arquivoId)
                }
                onAlternarExpansao={(arquivoId) =>
                  etapaSelecionada &&
                  alternarExpansaoPlanilha(etapaSelecionada.id, arquivoId)
                }
                onAlternarColuna={(arquivoId, coluna) =>
                  etapaSelecionada &&
                  alternarColunaPlanilha(etapaSelecionada.id, arquivoId, coluna)
                }
                onSelecionarTodas={(arquivoId, colunas) =>
                  etapaSelecionada &&
                  selecionarTodasColunas(
                    etapaSelecionada.id,
                    arquivoId,
                    colunas
                  )
                }
                onAtualizarCondicao={(alteracoes) =>
                  etapaSelecionada &&
                  atualizarEtapa(etapaSelecionada.id, {
                    condicao: { ...etapaSelecionada.condicao, ...alteracoes },
                  })
                }
              />
            </section>
          </div>

          {/* LOGS */}
          <section
            className="ui-panel config-logs"
            aria-labelledby="titulo-logs"
          >
            <SectionTitle
              id="titulo-logs"
              step={3}
              title="Logs de execução"
              description="Defina quais informações serão mantidas no histórico do processo."
            />
            <div className="config-logs__body">
              <div className="config-logs__options">
                <Checkbox
                  label="Linhas processadas"
                  checked={mostrarLinhas}
                  onChange={setMostrarLinhas}
                />
                <Checkbox
                  label="Tempo de execução"
                  checked={mostrarTempo}
                  onChange={setMostrarTempo}
                />
                <Checkbox
                  label="Arquivos processados"
                  checked={mostrarArquivos}
                  onChange={setMostrarArquivos}
                />
                <Checkbox
                  label="Etapas executadas"
                  checked={mostrarEtapas}
                  onChange={setMostrarEtapas}
                />
              </div>
              <Field
                id="indicador-principal"
                label="Indicador principal"
                className="config-logs__indicator"
              >
                {(controle) => (
                  <select
                    {...controle}
                    name="indicador-principal"
                    autoComplete="off"
                    className="ui-input"
                    value={indicadorPrincipal}
                    onChange={(event) =>
                      setIndicadorPrincipal(event.target.value)
                    }
                  >
                    <option value="linhas">Linhas processadas</option>
                    <option value="tempo">Tempo de execução</option>
                    <option value="arquivos">Arquivos processados</option>
                    <option value="etapas">Etapas executadas</option>
                  </select>
                )}
              </Field>
            </div>
          </section>
        </div>
      </div>

      <footer className="form-footer">
        <p className="config-footer__meta">Etapa 2 de 2</p>
        <Button icon={ArrowLeft} onClick={voltarParaArquivos}>
          Voltar
        </Button>
        <Button variant="primary" icon={Save} onClick={salvarProcesso}>
          Salvar Processo
        </Button>
      </footer>
    </main>
  );
}

export default ConfigurarProcesso;
