import { ChevronDown, FileCode2, MousePointerClick } from 'lucide-react';
import { Button, Checkbox, Field, SelectableChip } from '../../components/ui';
import type { ferramentasMock } from '../../mock/ferramentasMock';
import type {
  ArquivoDisponivel,
  CondicaoEtapa,
  EtapaProcesso,
  PlanilhaEtapa,
  TipoCondicaoEtapa,
} from '../../types/processo';
import { FerramentaCabecalho } from './EtapaOrdenavel';

type Ferramenta = (typeof ferramentasMock)[number];

type ConfiguracaoEtapaProps = {
  etapa: EtapaProcesso | undefined;
  ferramenta: Ferramenta | undefined;
  arquivoScript: File | null;
  arquivosDisponiveis: ArquivoDisponivel[];
  colunasPorArquivo: Record<string, string[]>;
  carregandoColunas: boolean;
  planilhasExpandidas: Record<string, boolean>;
  onAlternarPlanilha: (arquivoId: string) => void;
  onAlternarExpansao: (arquivoId: string) => void;
  onAlternarColuna: (arquivoId: string, coluna: string) => void;
  onSelecionarTodas: (arquivoId: string, colunas: string[]) => void;
  onAtualizarCondicao: (alteracoes: Partial<CondicaoEtapa>) => void;
};

/** Painel de detalhe: conteúdo da etapa selecionada no fluxo. */
export function ConfiguracaoEtapa({
  etapa,
  ferramenta,
  arquivoScript,
  arquivosDisponiveis,
  colunasPorArquivo,
  carregandoColunas,
  planilhasExpandidas,
  onAlternarPlanilha,
  onAlternarExpansao,
  onAlternarColuna,
  onSelecionarTodas,
  onAtualizarCondicao,
}: ConfiguracaoEtapaProps) {
  if (!etapa || !ferramenta) {
    return (
      <div className="ui-empty config-detail__empty">
        <MousePointerClick size={20} aria-hidden="true" />
        Selecione uma ferramenta no fluxo para configurá-la.
      </div>
    );
  }

  if (etapa.ferramentaId === 'script-python') {
    return (
      <div className="config-detail__body">
        <FerramentaCabecalho ferramenta={ferramenta} />
        <div className="config-block">
          <p className="config-block__title">
            <FileCode2 size={16} aria-hidden="true" />
            Script conectado
          </p>
          <p className="config-mono">
            {arquivoScript?.name ?? 'Nenhum script selecionado.'}
          </p>
          <p className="config-hint">
            As opções de arquivos e pastas declaradas no script serão exibidas
            para edição quando essa leitura for integrada.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="config-detail__body">
      <FerramentaCabecalho ferramenta={ferramenta} />
      <SelecaoPlanilhas
        etapa={etapa}
        arquivosDisponiveis={arquivosDisponiveis}
        onAlternarPlanilha={onAlternarPlanilha}
      />
      {ferramenta.usaColunas && etapa.planilhas.length > 0 && (
        <div className="config-group">
          <h3 className="config-group__title">
            Colunas utilizadas em cada planilha
          </h3>
          <div className="config-columns">
            {etapa.planilhas.map((planilhaEtapa) => {
              const arquivo = arquivosDisponiveis.find(
                (item) => item.id === planilhaEtapa.arquivoId
              );
              if (!arquivo) {
                return null;
              }
              return (
                <ColunasPlanilha
                  key={arquivo.id}
                  etapaId={etapa.id}
                  arquivo={arquivo}
                  planilhaEtapa={planilhaEtapa}
                  colunas={colunasPorArquivo[arquivo.id] ?? []}
                  carregando={carregandoColunas}
                  expandida={
                    planilhasExpandidas[`${etapa.id}-${arquivo.id}`] ?? false
                  }
                  onAlternarExpansao={() => onAlternarExpansao(arquivo.id)}
                  onAlternarColuna={(coluna) =>
                    onAlternarColuna(arquivo.id, coluna)
                  }
                  onSelecionarTodas={(colunas) =>
                    onSelecionarTodas(arquivo.id, colunas)
                  }
                />
              );
            })}
          </div>
        </div>
      )}
      <CondicaoDaEtapa
        etapa={etapa}
        arquivosDisponiveis={arquivosDisponiveis}
        colunasPorArquivo={colunasPorArquivo}
        onAtualizarCondicao={onAtualizarCondicao}
      />
    </div>
  );
}

/* ===================================================== */
/* PLANILHAS */
/* ===================================================== */
function SelecaoPlanilhas({
  etapa,
  arquivosDisponiveis,
  onAlternarPlanilha,
}: {
  etapa: EtapaProcesso;
  arquivosDisponiveis: ArquivoDisponivel[];
  onAlternarPlanilha: (arquivoId: string) => void;
}) {
  return (
    <fieldset className="config-group">
      <legend className="config-group__title">
        Planilhas utilizadas nesta etapa
      </legend>
      {arquivosDisponiveis.length === 0 ? (
        <div className="ui-empty">
          Nenhum arquivo foi selecionado na etapa anterior.
        </div>
      ) : (
        <div className="config-sheets">
          {arquivosDisponiveis.map((arquivo) => (
            <Checkbox
              key={arquivo.id}
              label={arquivo.nome}
              description={
                arquivo.tipo === 'principal'
                  ? 'Arquivo principal'
                  : 'Arquivo auxiliar'
              }
              checked={etapa.planilhas.some(
                (planilha) => planilha.arquivoId === arquivo.id
              )}
              onChange={() => onAlternarPlanilha(arquivo.id)}
            />
          ))}
        </div>
      )}
    </fieldset>
  );
}

/* ===================================================== */
/* COLUNAS DE UMA PLANILHA (BLOCO RECOLHÍVEL) */
/* ===================================================== */
type ColunasPlanilhaProps = {
  etapaId: number;
  arquivo: ArquivoDisponivel;
  planilhaEtapa: PlanilhaEtapa;
  colunas: string[];
  carregando: boolean;
  expandida: boolean;
  onAlternarExpansao: () => void;
  onAlternarColuna: (coluna: string) => void;
  onSelecionarTodas: (colunas: string[]) => void;
};

function ColunasPlanilha({
  etapaId,
  arquivo,
  planilhaEtapa,
  colunas,
  carregando,
  expandida,
  onAlternarExpansao,
  onAlternarColuna,
  onSelecionarTodas,
}: ColunasPlanilhaProps) {
  const corpoId = `colunas-etapa-${etapaId}-${arquivo.id}`;
  const todasSelecionadas =
    colunas.length > 0 &&
    colunas.every((coluna) => planilhaEtapa.colunas.includes(coluna));
  const contagem = carregando
    ? 'Lendo cabeçalhos…'
    : `${colunas.length} colunas · ${planilhaEtapa.colunas.length} selecionadas`;

  return (
    <div className={`config-sheet ${expandida ? 'is-open' : ''}`.trim()}>
      <div className="config-sheet__header">
        <button
          type="button"
          className="config-sheet__toggle"
          aria-expanded={expandida}
          aria-controls={corpoId}
          onClick={onAlternarExpansao}
        >
          <ChevronDown
            size={16}
            aria-hidden="true"
            className="config-sheet__chevron"
          />
          <span className="config-sheet__name">{arquivo.nome}</span>
          <span className="config-sheet__count">{contagem}</span>
        </button>
        {!carregando && colunas.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSelecionarTodas(colunas)}
          >
            {todasSelecionadas ? 'Limpar seleção' : 'Selecionar todas'}
          </Button>
        )}
      </div>
      <div id={corpoId} className="config-sheet__body" hidden={!expandida}>
        {carregando ? (
          <p className="config-hint" role="status" aria-busy="true">
            Lendo cabeçalhos…
          </p>
        ) : colunas.length === 0 ? (
          <p className="config-hint">Nenhuma coluna identificada.</p>
        ) : (
          <>
            <p className="config-hint">Selecione as colunas utilizadas.</p>
            <div className="config-chips">
              {colunas.map((coluna) => (
                <SelectableChip
                  key={coluna}
                  selected={planilhaEtapa.colunas.includes(coluna)}
                  onToggle={() => onAlternarColuna(coluna)}
                >
                  {coluna}
                </SelectableChip>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ===================================================== */
/* CONDIÇÃO */
/* ===================================================== */
const opcoesCondicao: { valor: TipoCondicaoEtapa; rotulo: string }[] = [
  { valor: 'coluna-existe', rotulo: 'Coluna deve existir' },
  { valor: 'igual', rotulo: 'Igual a' },
  { valor: 'diferente', rotulo: 'Diferente de' },
  { valor: 'nao-vazio', rotulo: 'Não pode estar vazio' },
];

function CondicaoDaEtapa({
  etapa,
  arquivosDisponiveis,
  colunasPorArquivo,
  onAtualizarCondicao,
}: {
  etapa: EtapaProcesso;
  arquivosDisponiveis: ArquivoDisponivel[];
  colunasPorArquivo: Record<string, string[]>;
  onAtualizarCondicao: (alteracoes: Partial<CondicaoEtapa>) => void;
}) {
  const { condicao } = etapa;
  const valorDesabilitado =
    condicao.tipo === 'coluna-existe' || condicao.tipo === 'nao-vazio';

  return (
    <div className="config-block">
      <Checkbox
        label="Executar somente se uma condição for atendida"
        checked={condicao.ativa}
        onChange={(ativa) => onAtualizarCondicao({ ativa })}
      />
      {condicao.ativa && (
        <div className="config-condition">
          <Field id="condicao-planilha" label="Planilha">
            {(controle) => (
              <select
                {...controle}
                autoComplete="off"
                className="ui-input"
                value={condicao.arquivoId}
                onChange={(event) =>
                  onAtualizarCondicao({
                    arquivoId: event.target.value,
                    coluna: '',
                    valor: '',
                  })
                }
              >
                <option value="">Planilha…</option>
                {etapa.planilhas.map((planilha) => {
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
            )}
          </Field>
          <Field id="condicao-coluna" label="Coluna">
            {(controle) => (
              <select
                {...controle}
                autoComplete="off"
                className="ui-input"
                value={condicao.coluna}
                disabled={!condicao.arquivoId}
                onChange={(event) =>
                  onAtualizarCondicao({ coluna: event.target.value })
                }
              >
                <option value="">Coluna…</option>
                {(colunasPorArquivo[condicao.arquivoId] ?? []).map((coluna) => (
                  <option key={coluna} value={coluna}>
                    {coluna}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <Field id="condicao-tipo" label="Tipo de condição">
            {(controle) => (
              <select
                {...controle}
                autoComplete="off"
                className="ui-input"
                value={condicao.tipo}
                onChange={(event) =>
                  onAtualizarCondicao({
                    tipo: event.target.value as TipoCondicaoEtapa,
                  })
                }
              >
                {opcoesCondicao.map((opcao) => (
                  <option key={opcao.valor} value={opcao.valor}>
                    {opcao.rotulo}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <Field id="condicao-valor" label="Valor">
            {(controle) => (
              <input
                {...controle}
                autoComplete="off"
                className="ui-input"
                value={condicao.valor}
                disabled={valorDesabilitado}
                placeholder="Valor"
                onChange={(event) =>
                  onAtualizarCondicao({ valor: event.target.value })
                }
              />
            )}
          </Field>
        </div>
      )}
    </div>
  );
}
