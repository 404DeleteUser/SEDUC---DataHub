// Regras do organograma, sem React: cores por categoria, arranjo do desenho e busca.
import { textoNormalizado } from './ferramentas';
import type { Setor } from '../types/organograma';

/** Define a cor da caixa. A ordem de prioridade está em categoriaDoSetor. */
export type CategoriaSetor =
  | 'raiz'
  | 'gabinete'
  | 'superintendencia'
  | 'coordenadoria'
  | 'intermediario'
  | 'folha'
  | 'avulso';

/** No PDF oficial esta caixa fica na faixa das diretorias, sem tipo próprio. */
const NOME_UNIDADES_ESCOLARES = 'Unidades Escolares';

export type FilhosPorSetor = ReadonlyMap<string | undefined, Setor[]>;

export function filhosPorSetor(
  setores: readonly Setor[]
): Map<string | undefined, Setor[]> {
  const filhos = new Map<string | undefined, Setor[]>();
  for (const setor of setores) {
    filhos.set(setor.paiId, [...(filhos.get(setor.paiId) ?? []), setor]);
  }
  return filhos;
}

/** Sobe pelos pais procurando um gabinete (o próprio setor conta). */
function chegaAUmGabinete(
  setor: Setor,
  porId: ReadonlyMap<string, Setor>
): boolean {
  const visitados = new Set<string>();
  for (
    let atual: Setor | undefined = setor;
    atual && !visitados.has(atual.id);
    atual = atual.paiId ? porId.get(atual.paiId) : undefined
  ) {
    if (atual.tipo === 'gabinete') return true;
    visitados.add(atual.id);
  }
  return false;
}

function categoriaDoSetor(
  setor: Setor,
  raizId: string,
  temFilhos: boolean,
  porId: ReadonlyMap<string, Setor>
): CategoriaSetor {
  if (setor.id === raizId) return 'raiz';
  if (!chegaAUmGabinete(setor, porId)) return 'avulso';
  if (setor.tipo === 'gabinete') return 'gabinete';
  if (setor.tipo === 'superintendencia') return 'superintendencia';
  if (setor.tipo === 'coordenadoria') return 'coordenadoria';
  return temFilhos ? 'intermediario' : 'folha';
}

export function categoriasDosSetores(
  setores: readonly Setor[],
  raizId: string
): Map<string, CategoriaSetor> {
  const porId = new Map(setores.map((setor) => [setor.id, setor]));
  const comFilhos = new Set(setores.flatMap((setor) => setor.paiId ?? []));
  return new Map(
    setores.map((setor) => [
      setor.id,
      categoriaDoSetor(setor, raizId, comFilhos.has(setor.id), porId),
    ])
  );
}

/** Diretorias (e as Unidades Escolares) vinculadas a um gabinete vão para a faixa de baixo. */
export function vaiParaFaixaRegional(setor: Setor): boolean {
  return (
    setor.vinculo === 'vinculacao' &&
    (setor.tipo === 'diretoria' || setor.nome === NOME_UNIDADES_ESCOLARES)
  );
}

/** Filhos de um setor no desenho: caixas soltas (sem subordinados) e ramos. */
export function separarFilhos(
  setorId: string,
  filhos: FilhosPorSetor
): { folhas: Setor[]; ramos: Setor[] } {
  const proprios = (filhos.get(setorId) ?? []).filter(
    (setor) => !vaiParaFaixaRegional(setor)
  );
  return {
    folhas: proprios.filter((setor) => !filhos.has(setor.id)),
    ramos: proprios.filter((setor) => filhos.has(setor.id)),
  };
}

export type EstruturaOrganograma = {
  raiz: Setor;
  /** Unidades ligadas direto ao Secretário, nas duas colunas do tronco. */
  apoio: Setor[];
  /** Gabinetes adjuntos, lado a lado. */
  gabinetes: Setor[];
  /** Diretorias regionais e Unidades Escolares. */
  faixaRegional: Setor[];
  /** Colegiados sem linha no organograma. */
  colegiados: Setor[];
  /** Outros órgãos sem linha, mas com estrutura própria (ex.: CEE). */
  conselhos: Setor[];
};

/** Arranjo do desenho, no mesmo padrão do PDF oficial. */
export function estruturaDoOrganograma(
  setores: readonly Setor[],
  raizId: string
): EstruturaOrganograma {
  const filhos = filhosPorSetor(setores);
  const raiz = setores.find((setor) => setor.id === raizId);
  if (!raiz) throw new Error(`Setor raiz não encontrado: ${raizId}`);
  const daRaiz = filhos.get(raizId) ?? [];
  const ehGabineteAdjunto = (setor: Setor) =>
    setor.tipo === 'gabinete' && filhos.has(setor.id);
  const semPai = (filhos.get(undefined) ?? []).filter(
    (setor) => setor.id !== raizId
  );
  return {
    raiz,
    apoio: daRaiz.filter((setor) => !ehGabineteAdjunto(setor)),
    gabinetes: daRaiz.filter(ehGabineteAdjunto),
    faixaRegional: setores.filter(vaiParaFaixaRegional),
    colegiados: semPai.filter((setor) => !filhos.has(setor.id)),
    conselhos: semPai.filter((setor) => filhos.has(setor.id)),
  };
}

export function buscarSetores(
  setores: readonly Setor[],
  termo: string,
  limite = 8
): Setor[] {
  const procurado = textoNormalizado(termo);
  if (!procurado) return [];
  return setores
    .filter((setor) => textoNormalizado(setor.nome).includes(procurado))
    .slice(0, limite);
}
