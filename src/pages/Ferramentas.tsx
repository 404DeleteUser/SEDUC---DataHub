import { useEffect, useMemo, useRef, useState } from 'react';
import { Info, Play, Plus, RotateCcw, Search, Trash2 } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import {
  ExecucaoSimulada,
  useExecucaoSimulada,
} from '../components/ferramentas/ExecucaoSimulada';
import { FormularioFerramenta } from '../components/ferramentas/FormularioFerramenta';
import {
  Button,
  Field,
  FileField,
  IconButton,
  SectionTitle,
  SimulationNotice,
} from '../components/ui';
import {
  abasDividirPor,
  eliminarDuplicatas,
  parametrosPadrao,
  textoNormalizado,
  validarParametros,
  type AbaPrevista,
} from '../domain/ferramentas';
import { passosDaFerramenta } from '../domain/logFerramentas';
import {
  ferramentasDoCatalogo,
  type Ferramenta,
} from '../mock/ferramentasMock';
import type {
  ErroParametro,
  FerramentaId,
  ParametrosFerramenta,
} from '../types/ferramenta';
import { lerPlanilha, type PlanilhaLida } from '../utils/planilhas';
import { irParaCampo } from './novo-processo/constantes';

const LIMITE_ARQUIVOS_MESCLAR = 5;

type FerramentasProps = {
  ferramentaInicial?: FerramentaId;
};

export default function Ferramentas({ ferramentaInicial }: FerramentasProps) {
  const [busca, setBusca] = useState('');
  const [selecionadaId, setSelecionadaId] = useState<FerramentaId>(
    ferramentaInicial ?? ferramentasDoCatalogo[0].id
  );
  // Mudar a chave remonta o painel: é assim que "Limpar" descarta tudo.
  const [rodada, setRodada] = useState(0);
  const [focarPainel, setFocarPainel] = useState(false);
  const selecionada =
    ferramentasDoCatalogo.find((item) => item.id === selecionadaId) ??
    ferramentasDoCatalogo[0];
  const filtradas = ferramentasDoCatalogo.filter((item) =>
    textoNormalizado(`${item.nome} ${item.descricao}`).includes(
      textoNormalizado(busca)
    )
  );

  return (
    <main
      id="conteudo-principal"
      tabIndex={-1}
      className="page-scroll ferramentas-page"
    >
      <PageHeader
        titulo="Ferramentas"
        descricao="Execute uma ferramenta avulsa ou use-a como etapa de um processo."
        acao={
          <SimulationNotice detail="A execução é simulada; nenhum arquivo é gerado." />
        }
      />
      <div className="page-content ferramentas-layout">
        <section
          className="ferramentas-catalogo"
          aria-labelledby="catalogo-titulo"
        >
          <h2 id="catalogo-titulo" className="sr-only">
            Catálogo
          </h2>
          <label className="ferramentas-busca">
            <Search size={16} aria-hidden="true" />
            <span className="sr-only">Buscar ferramentas</span>
            <input
              type="search"
              value={busca}
              placeholder="Buscar ferramenta…"
              autoComplete="off"
              onChange={(event) => setBusca(event.target.value)}
            />
          </label>
          <ul
            className="ferramentas-lista"
            aria-label="Catálogo de ferramentas"
          >
            {filtradas.map((ferramenta) => (
              <li key={ferramenta.id}>
                <ItemCatalogo
                  ferramenta={ferramenta}
                  selecionada={ferramenta.id === selecionada.id}
                  onSelecionar={() => {
                    setSelecionadaId(ferramenta.id);
                    setFocarPainel(false);
                    setRodada((atual) => atual + 1);
                  }}
                />
              </li>
            ))}
          </ul>
          {!filtradas.length && (
            <p className="ui-empty" role="status">
              Nenhuma ferramenta encontrada.
            </p>
          )}
        </section>
        <div className="ferramentas-detalhe">
          <PainelFerramenta
            key={`${selecionada.id}-${rodada}`}
            ferramenta={selecionada}
            focarAoMontar={focarPainel}
            onLimpar={() => {
              setFocarPainel(true);
              setRodada((atual) => atual + 1);
            }}
          />
        </div>
      </div>
    </main>
  );
}

function ItemCatalogo({
  ferramenta,
  selecionada,
  onSelecionar,
}: {
  ferramenta: Ferramenta;
  selecionada: boolean;
  onSelecionar: () => void;
}) {
  const Icone = ferramenta.icone;
  return (
    <button
      type="button"
      className="ferramentas-item"
      aria-pressed={selecionada}
      onClick={onSelecionar}
    >
      <span
        className={`ferramentas-icone ${ferramenta.cor}`}
        aria-hidden="true"
      >
        <Icone size={17} />
      </span>
      <span className="ferramentas-item__texto">
        <span className="ferramentas-item__nome">{ferramenta.nome}</span>
        <span className="ferramentas-item__descricao">
          {ferramenta.descricao}
        </span>
      </span>
    </button>
  );
}

/** Um campo de arquivo. O id é estável: remover um slot não embaralha leituras e erros. */
type SlotArquivo = {
  id: number;
  arquivo: File | null;
  lendo: boolean;
  planilha?: PlanilhaLida;
  erroLeitura?: string;
};

let proximoSlot = 0;
const novoSlot = (): SlotArquivo => ({
  id: (proximoSlot += 1),
  arquivo: null,
  lendo: false,
});

function PainelFerramenta({
  ferramenta,
  focarAoMontar,
  onLimpar,
}: {
  ferramenta: Ferramenta & { id: FerramentaId };
  focarAoMontar: boolean;
  onLimpar: () => void;
}) {
  const ehMesclar = ferramenta.id === 'mesclar-planilhas';
  const idBase = `avulsa-${ferramenta.id}`;
  const tituloRef = useRef<HTMLHeadingElement>(null);
  const [slots, setSlots] = useState<SlotArquivo[]>(() =>
    ehMesclar ? [novoSlot(), novoSlot()] : [novoSlot()]
  );
  const [parametros, setParametros] = useState<ParametrosFerramenta>(() =>
    parametrosPadrao(ferramenta.id)
  );
  const [nomeSaida, setNomeSaida] = useState('');
  const [erros, setErros] = useState<ErroParametro[]>([]);
  const execucao = useExecucaoSimulada();

  useEffect(() => {
    if (focarAoMontar) tituloRef.current?.focus();
  }, [focarAoMontar]);

  const principal = slots[0];
  const colunas = principal.planilha?.colunas ?? [];
  const colunaDividir =
    parametros.ferramentaId === 'dividir-por' ? parametros.coluna : '';
  const previaAbas = useMemo(() => {
    const planilha = principal.planilha;
    const indice = colunaDividir
      ? planilha?.indicePorColuna[colunaDividir]
      : undefined;
    if (!planilha || indice === undefined) return undefined;
    return abasDividirPor(planilha.linhas.map((linha) => linha[indice] ?? ''));
  }, [principal.planilha, colunaDividir]);

  const campoArquivo = (slot: SlotArquivo) => `arquivo-${slot.id}`;
  const atualizarSlot = (
    id: number,
    alterar: (slot: SlotArquivo) => SlotArquivo
  ) =>
    setSlots((atuais) =>
      atuais.map((slot) => (slot.id === id ? alterar(slot) : slot))
    );

  async function escolherArquivo(slot: SlotArquivo, arquivo: File | null) {
    setErros((atuais) =>
      atuais.filter((erro) => erro.campo !== campoArquivo(slot))
    );
    atualizarSlot(slot.id, (atual) => ({
      ...atual,
      arquivo,
      lendo: !!arquivo,
      planilha: undefined,
      erroLeitura: undefined,
    }));
    if (!arquivo) return;
    let resultado: Pick<SlotArquivo, 'planilha' | 'erroLeitura'>;
    try {
      resultado = { planilha: await lerPlanilha(arquivo) };
    } catch {
      resultado = {
        erroLeitura: `Não foi possível ler ${arquivo.name}. Use XLSX, XLS ou CSV com cabeçalho na primeira linha.`,
      };
    }
    // Só grava se o slot ainda tiver o mesmo arquivo: leituras lentas não sobrescrevem escolhas novas.
    atualizarSlot(slot.id, (atual) =>
      atual.arquivo === arquivo
        ? { ...atual, ...resultado, lendo: false }
        : atual
    );
  }

  function validar(): ErroParametro[] {
    const encontrados: ErroParametro[] = [];
    slots.forEach((slot, posicao) => {
      const campo = campoArquivo(slot);
      if (!slot.arquivo) {
        if (!ehMesclar || posicao === 0)
          encontrados.push({
            campo,
            mensagem: ehMesclar
              ? 'Selecione o arquivo.'
              : 'Selecione o arquivo de entrada.',
          });
      } else if (slot.lendo) {
        encontrados.push({
          campo,
          mensagem: `Aguarde a leitura de ${slot.arquivo.name} terminar.`,
        });
      } else if (slot.erroLeitura) {
        encontrados.push({ campo, mensagem: slot.erroLeitura });
      }
    });
    const lidos = slots.flatMap((slot) =>
      slot.arquivo && slot.planilha
        ? [{ arquivo: slot.arquivo.name, colunas: slot.planilha.colunas }]
        : []
    );
    const pendente = slots.some((slot) => slot.lendo);
    encontrados.push(
      ...validarParametros(parametros, {
        arquivos: slots.filter((slot) => slot.arquivo).length,
        cabecalhos: !pendente && lidos.length > 1 ? lidos : undefined,
      }),
      ...colunasForaDoArquivo(parametros, principal)
    );
    if (!nomeSaida.trim())
      encontrados.push({
        campo: 'saida',
        mensagem: 'Informe o nome do arquivo de saída.',
      });
    return encontrados;
  }

  function executar() {
    const encontrados = validar();
    setErros(encontrados);
    if (encontrados.length) {
      focarCampo(
        `${idBase}-${encontrados[0].campo === 'arquivos' ? campoArquivo(slots[0]) : encontrados[0].campo}`
      );
      return;
    }
    const nomes = slots.flatMap((slot) =>
      slot.arquivo ? [slot.arquivo.name] : []
    );
    execucao.iniciar(
      mensagensDaSimulacao(
        parametros,
        nomes,
        nomeSaida.trim(),
        previaAbas,
        duplicadasRemovidas()
      )
    );
  }

  /** Quantas linhas "Eliminar Duplicatas" tiraria da planilha já lida. */
  function duplicadasRemovidas() {
    const planilha = principal.planilha;
    if (parametros.ferramentaId !== 'eliminar-duplicatas' || !planilha) {
      return undefined;
    }
    const indices = parametros.colunasChave.map(
      (coluna) => planilha.indicePorColuna[coluna]
    );
    return eliminarDuplicatas(planilha.linhas, indices).removidas;
  }

  function removerSlot(posicao: number) {
    const removido = slots[posicao];
    setSlots((atuais) => atuais.filter((slot) => slot.id !== removido.id));
    setErros((atuais) =>
      atuais.filter((erro) => erro.campo !== campoArquivo(removido))
    );
    const vizinho = slots[posicao - 1];
    requestAnimationFrame(() =>
      focarCampo(`${idBase}-${campoArquivo(vizinho)}`)
    );
  }

  function adicionarSlot() {
    const slot = novoSlot();
    setSlots((atuais) => [...atuais, slot]);
    requestAnimationFrame(() => focarCampo(`${idBase}-${campoArquivo(slot)}`));
  }

  const erroDe = (campo: string) =>
    erros.find((erro) => erro.campo === campo)?.mensagem;
  const Icone = ferramenta.icone;

  return (
    <section
      className="ui-panel ferramenta-painel"
      aria-labelledby={`${idBase}-titulo`}
    >
      <header className="ferramenta-painel__cabecalho">
        <span
          className={`ferramentas-icone ferramentas-icone--lg ${ferramenta.cor}`}
          aria-hidden="true"
        >
          <Icone size={20} />
        </span>
        <div>
          <h2 id={`${idBase}-titulo`} ref={tituloRef} tabIndex={-1}>
            {ferramenta.nome}
          </h2>
          <p>{ferramenta.descricao}</p>
        </div>
      </header>
      <p className="ferramenta-painel__aviso">
        <Info size={15} aria-hidden="true" />
        Execução avulsa: as configurações não são salvas. Para guardá-las, use a
        ferramenta como etapa de um processo.
      </p>

      <div className="ferramenta-painel__secao">
        <SectionTitle
          as="h3"
          step={1}
          title={ehMesclar ? 'Arquivos' : 'Arquivo de entrada'}
        />
        <div className="ferramenta-arquivos">
          {slots.map((slot, posicao) => (
            <div key={slot.id} className="ferramenta-arquivos__linha">
              <Field
                id={`${idBase}-${campoArquivo(slot)}`}
                label={
                  ehMesclar ? `Arquivo ${posicao + 1}` : 'Arquivo de entrada'
                }
                required={!ehMesclar || posicao < 2}
                error={erroDe(campoArquivo(slot))}
                hint={
                  slot.lendo
                    ? 'Lendo o cabeçalho…'
                    : slot.planilha
                      ? `${slot.planilha.colunas.length} colunas identificadas.`
                      : undefined
                }
              >
                {(controle) => (
                  <FileField
                    {...controle}
                    file={slot.arquivo}
                    placeholder="Selecionar planilha (XLSX, XLS ou CSV)…"
                    accept=".xlsx,.xls,.csv"
                    onChange={(novo) => void escolherArquivo(slot, novo)}
                  />
                )}
              </Field>
              {ehMesclar && posicao >= 2 && (
                <IconButton
                  icon={Trash2}
                  label={`Remover arquivo ${posicao + 1}`}
                  variant="danger"
                  size="sm"
                  onClick={() => removerSlot(posicao)}
                />
              )}
            </div>
          ))}
          {ehMesclar && (
            <div>
              <Button
                size="sm"
                icon={Plus}
                disabled={slots.length >= LIMITE_ARQUIVOS_MESCLAR}
                onClick={adicionarSlot}
              >
                Adicionar arquivo
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="ferramenta-painel__secao">
        <SectionTitle as="h3" step={2} title="Parâmetros" />
        <FormularioFerramenta
          idBase={idBase}
          parametros={parametros}
          colunas={colunas}
          onChange={setParametros}
          erros={erros}
          previaAbas={previaAbas}
        />
      </div>

      <div className="ferramenta-painel__secao">
        <SectionTitle as="h3" step={3} title="Saída" />
        <Field
          id={`${idBase}-saida`}
          label="Nome do arquivo de saída"
          required
          error={erroDe('saida')}
        >
          {(controle) => (
            <input
              {...controle}
              className="ui-input"
              value={nomeSaida}
              placeholder="Ex.: resultado.xlsx"
              autoComplete="off"
              onChange={(event) => setNomeSaida(event.target.value)}
            />
          )}
        </Field>
      </div>

      <footer className="ferramenta-painel__acoes">
        <Button
          icon={RotateCcw}
          onClick={onLimpar}
          disabled={execucao.executando}
        >
          Limpar
        </Button>
        <Button
          variant="primary"
          icon={Play}
          onClick={executar}
          disabled={execucao.executando}
        >
          Executar
        </Button>
      </footer>

      {execucao.iniciado && (
        <ExecucaoSimulada
          progresso={execucao.progresso}
          logs={execucao.logs}
          executando={execucao.executando}
        />
      )}
    </section>
  );
}

/** Na avulsa o arquivo é conhecido: coluna escolhida antes de trocar o arquivo vira erro. */
function colunasForaDoArquivo(
  parametros: ParametrosFerramenta,
  principal: SlotArquivo
): ErroParametro[] {
  const planilha = principal.planilha;
  if (!planilha || !principal.arquivo) return [];
  const existe = (coluna: string) => planilha.colunas.includes(coluna);
  const nome = principal.arquivo.name;
  if (
    (parametros.ferramentaId === 'dividir-por' ||
      parametros.ferramentaId === 'dicionario') &&
    parametros.coluna &&
    !existe(parametros.coluna)
  )
    return [
      {
        campo: 'coluna',
        mensagem: `A coluna ${parametros.coluna} não existe em ${nome}. Escolha outra coluna.`,
      },
    ];
  if (parametros.ferramentaId === 'eliminar-duplicatas') {
    const ausentes = parametros.colunasChave.filter(
      (coluna) => !existe(coluna)
    );
    if (ausentes.length)
      return [
        {
          campo: 'colunasChave',
          mensagem: `Estas colunas não existem em ${nome}: ${ausentes.join(', ')}. Desmarque-as.`,
        },
      ];
  }
  return [];
}

/** Rola até o campo e o foca; em grupos (chips), foca o primeiro controle. */
function focarCampo(id: string) {
  const alvo = document.getElementById(id);
  if (!alvo) return;
  const focavel = alvo.matches('input, select, textarea, button')
    ? alvo
    : alvo.querySelector<HTMLElement>('input, select, textarea, button');
  irParaCampo((focavel ?? alvo).id || id);
  if (focavel && !focavel.id) focavel.focus();
}

function mensagensDaSimulacao(
  parametros: ParametrosFerramenta,
  arquivos: string[],
  saida: string,
  previaAbas?: AbaPrevista[],
  duplicadasRemovidas?: number
): string[] {
  return [
    `Lendo ${arquivos.join(', ')}…`,
    ...passosDaFerramenta(parametros, {
      arquivos,
      previaAbas,
      duplicadasRemovidas,
    }),
    `Simulação concluída. Nenhum arquivo foi gerado (${saida}).`,
  ];
}
