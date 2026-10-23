import { useRef, useState } from 'react';
import { Search, X } from 'lucide-react';

import PageHeader from '../components/PageHeader';
import { IconButton } from '../components/ui';
import { Organograma } from '../components/organograma/Organograma';
import {
  PainelLotacao,
  type LotacaoCarregada,
} from '../components/organograma/PainelLotacao';
import {
  FONTE_ORGANOGRAMA,
  ID_SETOR_RAIZ,
  setoresSeduc,
} from '../data/organogramaSeduc';
import {
  buscarSetores,
  categoriasDosSetores,
  estruturaDoOrganograma,
  filhosPorSetor,
  type CategoriaSetor,
} from '../domain/organograma';
import { agruparPorSetor, lerPessoas } from '../domain/lotacao';
import { lerPlanilha } from '../utils/planilhas';

// Dados estáveis: calculados uma vez, fora do componente.
const estrutura = estruturaDoOrganograma(setoresSeduc, ID_SETOR_RAIZ);
const filhos = filhosPorSetor(setoresSeduc);
const categorias = categoriasDosSetores(setoresSeduc, ID_SETOR_RAIZ);
const setorPorId = new Map(setoresSeduc.map((setor) => [setor.id, setor]));

const LEGENDA: [CategoriaSetor, string][] = [
  ['raiz', 'Gabinete do Secretário'],
  ['gabinete', 'Gabinetes'],
  ['superintendencia', 'Superintendências'],
  ['coordenadoria', 'Coordenadorias'],
  ['intermediario', 'Outros com subordinados'],
  ['folha', 'Sem subordinados'],
  ['avulso', 'Sem ligação a um gabinete'],
];

export default function Coordenadorias() {
  const [selecionadoId, setSelecionadoId] = useState<string>();
  const [busca, setBusca] = useState('');
  const [lotacao, setLotacao] = useState<LotacaoCarregada>();
  const [lendoLotacao, setLendoLotacao] = useState(false);
  const [erroLotacao, setErroLotacao] = useState<string>();
  // Só a leitura mais recente vale, se o usuário trocar o arquivo no meio.
  const leituraAtual = useRef(0);

  async function carregarLotacao(arquivo: File) {
    const leitura = ++leituraAtual.current;
    setLendoLotacao(true);
    setErroLotacao(undefined);
    try {
      const pessoas = lerPessoas(await lerPlanilha(arquivo));
      if (leitura !== leituraAtual.current) return;
      setLotacao({
        arquivo: arquivo.name,
        total: pessoas.length,
        ...agruparPorSetor(pessoas, setoresSeduc),
      });
    } catch (erro) {
      if (leitura !== leituraAtual.current) return;
      setErroLotacao(
        erro instanceof Error
          ? erro.message
          : 'Não foi possível ler a planilha.'
      );
    } finally {
      if (leitura === leituraAtual.current) setLendoLotacao(false);
    }
  }

  function removerLotacao() {
    leituraAtual.current += 1;
    setLotacao(undefined);
    setErroLotacao(undefined);
    setLendoLotacao(false);
  }

  const resultados = buscarSetores(setoresSeduc, busca);
  const selecionado = selecionadoId ? setorPorId.get(selecionadoId) : undefined;
  const pai = selecionado?.paiId
    ? setorPorId.get(selecionado.paiId)
    : undefined;

  function escolherResultado(id: string) {
    setSelecionadoId(id);
    setBusca('');
  }

  return (
    <main
      id="conteudo-principal"
      tabIndex={-1}
      className="page-scroll organograma-page"
    >
      <PageHeader
        titulo="Coordenadorias e Equipes"
        descricao={`Organograma da SEDUC-MT conforme o ${FONTE_ORGANOGRAMA.decreto} (vigência a partir de ${FONTE_ORGANOGRAMA.vigencia}).`}
      />
      <div className="page-content organograma-corpo">
        <div className="organograma-busca">
          <label className="ferramentas-busca">
            <Search size={16} aria-hidden="true" />
            <span className="sr-only">Buscar setor</span>
            <input
              type="search"
              value={busca}
              placeholder="Buscar setor…"
              autoComplete="off"
              onChange={(event) => setBusca(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Escape') setBusca('');
              }}
            />
          </label>
          {busca.trim() && (
            <div className="organograma-resultados">
              {resultados.length ? (
                <ul aria-label="Resultados da busca">
                  {resultados.map((setor) => (
                    <li key={setor.id}>
                      <button
                        type="button"
                        onClick={() => escolherResultado(setor.id)}
                      >
                        <span
                          className="organograma-ponto"
                          data-categoria={categorias.get(setor.id)}
                          aria-hidden="true"
                        />
                        <span>
                          {setor.nome}
                          {setor.paiId && (
                            <small>{setorPorId.get(setor.paiId)?.nome}</small>
                          )}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="ui-empty" role="status">
                  Nenhum setor encontrado.
                </p>
              )}
            </div>
          )}
        </div>

        <p className="organograma-selecao" aria-live="polite">
          {selecionado ? (
            <>
              <span>
                <strong>{selecionado.nome}</strong>
                {pai && (
                  <>
                    {' '}
                    ·{' '}
                    {selecionado.vinculo === 'vinculacao'
                      ? 'vinculado a'
                      : 'subordinado a'}{' '}
                    {pai.nome}
                  </>
                )}
              </span>
              <IconButton
                icon={X}
                label="Limpar seleção"
                onClick={() => setSelecionadoId(undefined)}
              />
            </>
          ) : (
            `${setoresSeduc.length} setores. Arraste para navegar, use a roda do mouse para o zoom e clique em um setor para destacá-lo.`
          )}
        </p>

        <div className="organograma-trabalho">
          <PainelLotacao
            setor={selecionado}
            lotacao={lotacao}
            lendo={lendoLotacao}
            erro={erroLotacao}
            onCarregar={(arquivo) => void carregarLotacao(arquivo)}
            onRemover={removerLotacao}
          />
          <div className="organograma-area">
            <Organograma
              estrutura={estrutura}
              filhos={filhos}
              categorias={categorias}
              selecionadoId={selecionadoId}
              onSelecionar={setSelecionadoId}
            />
          </div>
        </div>

        <ul className="organograma-legenda" aria-label="Legenda">
          {LEGENDA.map(([categoria, rotulo]) => (
            <li key={categoria}>
              <span
                className="organograma-ponto"
                data-categoria={categoria}
                aria-hidden="true"
              />
              {rotulo}
            </li>
          ))}
          <li>
            <span className="organograma-linha" aria-hidden="true" />
            Subordinação
          </li>
          <li>
            <span
              className="organograma-linha organograma-linha--tracejada"
              aria-hidden="true"
            />
            Vinculação
          </li>
        </ul>
      </div>
    </main>
  );
}
